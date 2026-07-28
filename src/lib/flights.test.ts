import { describe, expect, it } from "vitest";
import {
  DELAY_THRESHOLD_MIN,
  extendedEndFor,
  isFlightNumber,
  POST_LANDING_BUFFER_MIN,
} from "./flights";
import { toE164 } from "./sms";

describe("isFlightNumber", () => {
  it("accepts real designators", () => {
    for (const n of ["BA2490", "EI21", "FR1234", "U28765", "AA1"]) {
      expect(isFlightNumber(n), n).toBe(true);
    }
  });
  it("rejects things that are not one", () => {
    // BA12345 is the interesting one: a looser pattern reads it as carrier
    // "BA1" plus number "2345" and happily looks up a flight nobody is on.
    for (const n of ["", "B", "BRITISHAIRWAYS", "BA", "BA12345", "BA 2490!", "123", "BAW2490"]) {
      expect(isFlightNumber(n), n).toBe(false);
    }
  });
  it("does not care about case or padding", () => {
    expect(isFlightNumber("  ba2490 ")).toBe(true);
  });
});

describe("extendedEndFor", () => {
  const end = "2026-08-06T12:00:00.000Z";

  it("does nothing for an on-time flight", () => {
    expect(
      extendedEndFor(end, { status: "scheduled", estimatedArrival: "2026-08-06T10:00:00.000Z" })
    ).toBeNull();
  });

  it("does nothing without an arrival time to work from", () => {
    expect(extendedEndFor(end, { status: "delayed" })).toBeNull();
  });

  it("extends past a late arrival, plus the walk to the car", () => {
    // Lands at 11:30, which is before the 12:00 pick-up — but not by enough to
    // clear the aircraft, collect a bag and drive out.
    const out = extendedEndFor(end, {
      status: "delayed",
      estimatedArrival: "2026-08-06T11:30:00.000Z",
    });
    expect(out).not.toBeNull();
    const gapMin = (new Date(out!).getTime() - new Date("2026-08-06T11:30:00.000Z").getTime()) / 60_000;
    expect(gapMin).toBeGreaterThanOrEqual(POST_LANDING_BUFFER_MIN);
  });

  it("leaves a stay alone when the buffer already fits inside it", () => {
    // Lands at 08:00, four hours before pick-up — nothing to fix.
    expect(
      extendedEndFor(end, { status: "delayed", estimatedArrival: "2026-08-06T08:00:00.000Z" })
    ).toBeNull();
  });

  it("rounds up to the quarter hour", () => {
    const out = extendedEndFor(end, {
      status: "landed",
      estimatedArrival: "2026-08-06T11:37:00.000Z",
    });
    expect(new Date(out!).getUTCMinutes() % 15).toBe(0);
  });

  it("never extends twice", () => {
    // A flight that keeps slipping would otherwise ratchet the stay out for as
    // long as the sweep kept running.
    expect(
      extendedEndFor(end, {
        status: "delayed",
        estimatedArrival: "2026-08-07T09:00:00.000Z",
        extendedAt: "2026-08-06T09:00:00.000Z",
      })
    ).toBeNull();
  });

  it("uses a threshold small enough to matter and large enough not to churn", () => {
    expect(DELAY_THRESHOLD_MIN).toBeGreaterThan(0);
    expect(DELAY_THRESHOLD_MIN).toBeLessThan(POST_LANDING_BUFFER_MIN);
  });
});

describe("toE164", () => {
  it("normalises UK mobiles however they were typed", () => {
    expect(toE164("07700 900123")).toBe("+447700900123");
    expect(toE164("+44 7700 900123")).toBe("+447700900123");
    expect(toE164("447700900123")).toBe("+447700900123");
  });

  it("handles Irish mobiles", () => {
    expect(toE164("085 123 4567")).toBe("+353851234567");
  });

  it("refuses anything it cannot be sure about", () => {
    // Guessing would text a stranger, so an ambiguous number is no number.
    for (const bad of ["", "123", "0170", "not a phone", "+1"]) {
      expect(toE164(bad), bad).toBeNull();
    }
    expect(toE164(undefined)).toBeNull();
  });

  it("keeps a valid international number as-is", () => {
    expect(toE164("+33612345678")).toBe("+33612345678");
  });
});
