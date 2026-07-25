import { describe, expect, it } from "vitest";
import type { Space, SpaceAlert } from "@/types";
import {
  canClaimReferral,
  creditToApply,
  MIN_CHARGE,
  normaliseReferralCode,
  referralCodeFor,
} from "./referrals";
import { makeShareToken, parseShareToken, shareExpiryFor } from "./booking-share";
import { bookingIcs, icsStamp } from "./booking-calendar";
import { alertMatches, isStale, liveAlerts } from "./space-alerts";

const NOW = Date.parse("2026-08-10T12:00:00Z");

describe("referral codes", () => {
  it("is stable per user and different between users", () => {
    expect(referralCodeFor("user_a")).toBe(referralCodeFor("user_a"));
    expect(referralCodeFor("user_a")).not.toBe(referralCodeFor("user_b"));
  });

  it("avoids characters people misread", () => {
    const code = referralCodeFor("user_traveller");
    expect(code).toMatch(/^PG[A-Z0-9]{6}$/);
    expect(code.slice(2)).not.toMatch(/[OI01]/);
  });

  it("forgives however the code was pasted", () => {
    expect(normaliseReferralCode(" pg-ab 23cd ")).toBe("PGAB23CD");
    expect(normaliseReferralCode("!!!")).toBe("");
  });
});

describe("referral credit", () => {
  it("spends what is held, up to the bill", () => {
    expect(creditToApply(500, 4900)).toBe(500);
    expect(creditToApply(9900, 4900)).toBe(4900 - MIN_CHARGE);
  });

  it("always leaves a chargeable amount on the card", () => {
    expect(creditToApply(10_000, 4900)).toBeLessThan(4900);
    expect(4900 - creditToApply(10_000, 4900)).toBe(MIN_CHARGE);
  });

  it("does nothing with no credit or a trivial bill", () => {
    expect(creditToApply(0, 4900)).toBe(0);
    expect(creditToApply(-50, 4900)).toBe(0);
    expect(creditToApply(500, MIN_CHARGE)).toBe(0);
  });
});

describe("claiming a referral", () => {
  const friend = { id: "u_friend" };
  it("accepts a first-time claim on someone else's code", () => {
    expect(canClaimReferral("PGAB23CD", { id: "u_owner" }, friend)).toBe(true);
  });

  it("refuses your own code, an unknown code and a second claim", () => {
    expect(canClaimReferral("PGAB23CD", friend, friend)).toBe(false);
    expect(canClaimReferral("PGAB23CD", null, friend)).toBe(false);
    expect(
      canClaimReferral("PGAB23CD", { id: "u_owner" }, { ...friend, referredBy: "u_other" })
    ).toBe(false);
  });
});

describe("share links", () => {
  const exp = NOW + 3_600_000;

  it("round-trips a booking id", () => {
    expect(parseShareToken(makeShareToken("bk_1", exp), NOW)).toBe("bk_1");
  });

  it("stops working once the stay is over", () => {
    expect(parseShareToken(makeShareToken("bk_1", NOW - 1000), NOW)).toBeNull();
  });

  it("cannot be forged by changing the id or the expiry", () => {
    const token = makeShareToken("bk_1", exp);
    const [, expPart, sig] = token.split(".");
    expect(parseShareToken(`bk_OTHER.${expPart}.${sig}`, NOW)).toBeNull();
    expect(parseShareToken(`bk_1.${exp + 86_400_000}.${sig}`, NOW)).toBeNull();
    expect(parseShareToken("nonsense", NOW)).toBeNull();
    expect(parseShareToken(undefined, NOW)).toBeNull();
  });

  it("stays valid for a day past pick-up, for the delayed flight", () => {
    const endAt = "2026-08-12T10:00:00Z";
    const expiry = shareExpiryFor(endAt);
    expect(expiry - Date.parse(endAt)).toBe(86_400_000);
    expect(parseShareToken(makeShareToken("bk_1", expiry), Date.parse(endAt) + 3_600_000)).toBe(
      "bk_1"
    );
  });
});

describe("calendar export", () => {
  const ics = bookingIcs({
    uid: "bk_1@parkgo.ai",
    title: "ParkGo · PG-1A2B",
    description: "Drop off at the barrier, code 4821",
    location: "12 Bath Road, Hounslow, TW6",
    startAt: "2026-08-12T10:00:00Z",
    endAt: "2026-08-15T14:30:00Z",
    url: "https://parkgo.ai/app/booking/bk_1",
  });

  it("emits a well-formed single event", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("DTSTART:20260812T100000Z");
    expect(ics).toContain("DTEND:20260815T143000Z");
  });

  it("escapes commas in the address so the file isn't corrupted", () => {
    expect(ics).toContain("LOCATION:12 Bath Road\\, Hounslow\\, TW6");
  });

  it("reminds the night before and an hour ahead", () => {
    expect(ics).toContain("TRIGGER:-PT12H");
    expect(ics).toContain("TRIGGER:-PT1H");
  });

  it("folds long lines to 75 octets", () => {
    const long = bookingIcs({
      uid: "x",
      title: "T",
      description: "d".repeat(300),
      location: "L",
      startAt: "2026-08-12T10:00:00Z",
      endAt: "2026-08-12T11:00:00Z",
    });
    for (const line of long.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75);
  });

  it("stamps times in UTC", () => {
    expect(icsStamp("2026-08-12T11:00:00+01:00")).toBe("20260812T100000Z");
  });
});

describe("price and availability watches", () => {
  const space = (p: Partial<Space> = {}): Space =>
    ({
      id: "sp_1",
      airportSlug: "lhr",
      status: "live",
      pricePerDay: 1200,
      ...p,
    }) as Space;

  const alert = (p: Partial<SpaceAlert> = {}): SpaceAlert => ({
    id: "al_1",
    userId: "u1",
    createdAt: new Date(NOW - 86_400_000).toISOString(),
    ...p,
  });

  it("fires when the watched space becomes bookable", () => {
    expect(alertMatches(alert({ spaceId: "sp_1" }), space(), { available: true })).toBe(true);
    expect(alertMatches(alert({ spaceId: "sp_1" }), space(), { available: false })).toBe(false);
  });

  it("ignores a different space", () => {
    expect(alertMatches(alert({ spaceId: "sp_OTHER" }), space(), { available: true })).toBe(false);
  });

  it("matches an airport watch under the price cap", () => {
    const a = alert({ airportSlug: "lhr", maxPricePence: 1500 });
    expect(alertMatches(a, space({ pricePerDay: 1200 }), { available: true })).toBe(true);
    expect(alertMatches(a, space({ pricePerDay: 1800 }), { available: true })).toBe(false);
    expect(alertMatches(a, space({ airportSlug: "lgw" }), { available: true })).toBe(false);
  });

  it("never fires twice or on a paused listing", () => {
    expect(
      alertMatches(alert({ spaceId: "sp_1", notifiedAt: "2026-08-01T00:00:00Z" }), space(), {
        available: true,
      })
    ).toBe(false);
    expect(alertMatches(alert({ spaceId: "sp_1" }), space({ status: "paused" }), { available: true })).toBe(
      false
    );
  });

  it("retires watches that have fired, aged out, or whose dates have passed", () => {
    expect(isStale(alert({ notifiedAt: "2026-08-01T00:00:00Z" }), NOW)).toBe(true);
    expect(isStale(alert({ createdAt: "2026-01-01T00:00:00Z" }), NOW)).toBe(true);
    expect(isStale(alert({ endAt: "2026-08-01T00:00:00Z" }), NOW)).toBe(true);
    expect(isStale(alert({ endAt: "2026-09-01T00:00:00Z" }), NOW)).toBe(false);
  });

  it("filters a batch down to the ones worth checking", () => {
    const kept = liveAlerts(
      [alert({ id: "a" }), alert({ id: "b", notifiedAt: "2026-08-01T00:00:00Z" })],
      NOW
    );
    expect(kept.map((x) => x.id)).toEqual(["a"]);
  });
});
