import { describe, expect, it } from "vitest";
import { computeSplit, priceBundle, splitReconciles } from "./pricing";
import {
  applyLoyaltyToPrice,
  giftCardCode,
  MIN_CHARGE,
  passOffers,
  planPrepayment,
  tierFor,
  tripsToNextTier,
} from "./rewards";
import type { Space } from "@/types";

const space = {
  id: "s1",
  hostId: "h1",
  title: "Test",
  airportSlug: "heathrow",
  approxArea: "Area",
  exactAddress: "1 Test St",
  lat: 0,
  lng: 0,
  distanceMiles: 1,
  driveMinutes: 5,
  dimensions: { lengthM: 5, widthM: 2.5 },
  pricePerDay: 1200,
  photos: [],
  status: "live",
  rating: 5,
  reviewCount: 0,
  createdAt: new Date().toISOString(),
} as unknown as Space;

const priced = (extras?: Parameters<typeof priceBundle>[6]) =>
  priceBundle(space, { parking: true, transfer: false, ev: false }, "2026-08-01", "2026-08-06", "GBP", undefined, extras);

describe("protection and care in the split", () => {
  it("leaves the plain price untouched", () => {
    const p = priced();
    expect(p.protection).toBe(0);
    expect(p.care).toBe(0);
    expect(splitReconciles(p)).toBe(true);
  });

  it("gives the protection premium entirely to the platform", () => {
    const plain = priced();
    const withP = priced({ protection: true });
    expect(withP.protection).toBeGreaterThan(0);
    expect(withP.total).toBe(plain.total + withP.protection);
    // Host and driver are untouched; the platform takes all of it.
    expect(withP.split.hostPayout).toBe(plain.split.hostPayout);
    expect(withP.split.driverPayout).toBe(plain.split.driverPayout);
    expect(withP.split.platform).toBe(plain.split.platform + withP.protection);
    expect(splitReconciles(withP)).toBe(true);
  });

  it("pays the host for care, net of commission", () => {
    const plain = priced();
    const withCare = priced({ care: [{ id: "wash", label: "Wash", pricePence: 2000 }] });
    expect(withCare.care).toBe(2000);
    // The host does the work, so most of it is theirs — but not all.
    expect(withCare.split.hostPayout).toBeGreaterThan(plain.split.hostPayout);
    expect(withCare.split.hostPayout - plain.split.hostPayout).toBeLessThan(2000);
    expect(splitReconciles(withCare)).toBe(true);
  });

  it("still reconciles with both at once", () => {
    const p = priced({
      protection: true,
      care: [
        { id: "wash", label: "Wash", pricePence: 2000 },
        { id: "tyres", label: "Tyres", pricePence: 900 },
      ],
    });
    expect(p.care).toBe(2900);
    expect(splitReconciles(p)).toBe(true);
  });

  it("ignores a negative care price", () => {
    const p = priced({ care: [{ id: "x", label: "X", pricePence: -500 }] });
    expect(p.care).toBe(0);
    expect(splitReconciles(p)).toBe(true);
  });

  it("reconciles for any combination", () => {
    for (const protection of [false, true]) {
      for (const care of [0, 500, 5000]) {
        const p = priceBundle(
          space,
          { parking: true, transfer: true, transferReturn: true, ev: false },
          "2026-08-01",
          "2026-08-06",
          "GBP",
          undefined,
          { protection, care: care ? [{ id: "c", label: "C", pricePence: care }] : [] }
        );
        expect(splitReconciles(p), `protection=${protection} care=${care}`).toBe(true);
      }
    }
  });
});

describe("loyalty", () => {
  it("moves up with completed trips", () => {
    expect(tierFor(0).key).toBe("none");
    expect(tierFor(2).key).toBe("none");
    expect(tierFor(3).key).toBe("silver");
    expect(tierFor(7).key).toBe("silver");
    expect(tierFor(8).key).toBe("gold");
    expect(tierFor(19).key).toBe("gold");
    expect(tierFor(20).key).toBe("platinum");
    expect(tierFor(500).key).toBe("platinum");
  });

  it("says how far the next tier is, and stops at the top", () => {
    expect(tripsToNextTier(0)).toMatchObject({ need: 3 });
    expect(tripsToNextTier(7)).toMatchObject({ need: 1 });
    expect(tripsToNextTier(20)).toBeNull();
  });

  it("discounts without touching what anyone else is owed", () => {
    const plain = priced();
    const gold = applyLoyaltyToPrice(plain, 8);
    expect(gold.total).toBeLessThan(plain.total);
    expect(gold.split.hostPayout).toBe(plain.split.hostPayout);
    expect(gold.split.driverPayout).toBe(plain.split.driverPayout);
    expect(splitReconciles(gold)).toBe(true);
  });

  it("cannot discount more than the platform earns", () => {
    // A split with almost no platform cut. The moved pence go to the host so
    // the fixture still reconciles before the discount is applied — otherwise
    // the test proves nothing about the clamp.
    const thin = priced();
    const moved = thin.split.platform - 50;
    const squeezed = {
      ...thin,
      split: { ...thin.split, platform: 50, hostPayout: thin.split.hostPayout + moved },
    };
    expect(splitReconciles(squeezed)).toBe(true);

    const out = applyLoyaltyToPrice(squeezed, 20);
    expect(out.split.platform).toBe(0);
    expect(out.total).toBe(squeezed.total - 50);
    expect(out.split.hostPayout).toBe(squeezed.split.hostPayout);
    expect(splitReconciles(out)).toBe(true);
  });

  it("does nothing below the first tier", () => {
    const plain = priced();
    expect(applyLoyaltyToPrice(plain, 1)).toBe(plain);
  });
});

describe("prepayment", () => {
  it("charges the full amount when there is nothing to apply", () => {
    expect(planPrepayment(8699, {})).toMatchObject({ charge: 8699, fromCredit: 0 });
  });

  it("spends the pass first, then the gift card, then credit", () => {
    const plan = planPrepayment(10000, {
      credit: 5000,
      giftCard: { code: "X", balancePence: 3000 },
      pass: { id: "p", daysLeft: 2, dayValue: 1200 },
      daysBooked: 5,
    });
    // Perishable balances go before the one that never expires.
    expect(plan.fromPass).toBe(2400);
    expect(plan.fromGiftCard).toBe(3000);
    expect(plan.fromCredit).toBe(4500);
    expect(plan.charge).toBe(MIN_CHARGE);
  });

  it("always leaves something payable", () => {
    const plan = planPrepayment(5000, { credit: 999999 });
    expect(plan.charge).toBe(MIN_CHARGE);
    expect(plan.fromCredit).toBe(5000 - MIN_CHARGE);
  });

  it("only takes whole days off the pass", () => {
    const plan = planPrepayment(1500, { pass: { id: "p", daysLeft: 5, dayValue: 1200 }, daysBooked: 5 });
    // Two days would exceed what is left to pay, so only one comes off.
    expect(plan.passDays).toBe(1);
    expect(plan.fromPass).toBe(1200);
  });

  it("never uses more pass days than the stay is long", () => {
    const plan = planPrepayment(100000, { pass: { id: "p", daysLeft: 20, dayValue: 1000 }, daysBooked: 3 });
    expect(plan.passDays).toBe(3);
  });

  it("adds up to the total", () => {
    const total = 7350;
    const plan = planPrepayment(total, {
      credit: 1000,
      giftCard: { code: "G", balancePence: 2500 },
      pass: { id: "p", daysLeft: 1, dayValue: 1200 },
      daysBooked: 4,
    });
    expect(plan.fromPass + plan.fromGiftCard + plan.fromCredit + plan.charge).toBe(total);
  });
});

describe("gift cards", () => {
  it("is stable for a seed and readable", () => {
    const a = giftCardCode("order-1");
    expect(a).toBe(giftCardCode("order-1"));
    expect(a).not.toBe(giftCardCode("order-2"));
    // No characters that get misread when typed off a screen.
    expect(a).not.toMatch(/[OI01]/);
    expect(a).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
});

describe("trip pass", () => {
  it("is always worth more than paying per day", () => {
    for (const o of passOffers(1200)) {
      expect(o.price).toBeLessThan(o.dayValue * o.days);
    }
  });
  it("saves more the more you buy", () => {
    const [five, ten, twenty] = passOffers(1200);
    expect(five.savingBps).toBeLessThan(ten.savingBps);
    expect(ten.savingBps).toBeLessThan(twenty.savingBps);
  });
  it("prices a day off the destination's own cheapest rate", () => {
    expect(passOffers(900)[0].dayValue).toBe(900);
    expect(passOffers(2000)[0].dayValue).toBe(2000);
  });
});

describe("computeSplit directly", () => {
  it("treats protection as platform-only", () => {
    const a = computeSplit({ parking: 6000, transfer: 0, ev: 0, serviceFee: 299 });
    const b = computeSplit({ parking: 6000, transfer: 0, ev: 0, serviceFee: 299, protection: 480 });
    expect(b.platform - a.platform).toBe(480);
    expect(b.hostPayout).toBe(a.hostPayout);
  });
});
