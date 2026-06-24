/**
 * Payments — marketplace split payments behind a swappable gateway.
 *
 * Mock mode simulates an authorised charge and records the platform/host/driver
 * split. Live mode is Stripe Connect: create a PaymentIntent with
 * `application_fee_amount = split.platform` and `transfer_data.destination` =
 * the host's connected account; driver payouts go via a separate transfer.
 */
import type { PaymentMethod, PaymentSplit, Pence } from "@/types";

export interface ChargeRequest {
  bookingRef: string;
  amount: Pence;
  currency: "GBP" | "EUR";
  method: PaymentMethod;
  split: PaymentSplit;
}

export interface ChargeResult {
  ok: boolean;
  paymentId: string;
  provider: "stripe" | "crypto" | "mock";
  error?: string;
}

export interface PaymentGateway {
  readonly name: string;
  charge(req: ChargeRequest): Promise<ChargeResult>;
}

class MockGateway implements PaymentGateway {
  readonly name = "mock";
  async charge(req: ChargeRequest): Promise<ChargeResult> {
    // Always succeeds; deterministic id from the booking reference.
    return { ok: true, paymentId: `pi_mock_${req.bookingRef}`, provider: "mock" };
  }
}

// Stripe / crypto adapters would implement PaymentGateway here. Kept as stubs so
// the interface is the contract and providers drop in without UI changes.
class StripeGateway implements PaymentGateway {
  readonly name = "stripe";
  async charge(): Promise<ChargeResult> {
    throw new Error("Stripe gateway not configured. Set STRIPE_SECRET_KEY and implement charge().");
  }
}

export function getPaymentGateway(): PaymentGateway {
  const live = process.env.PARKGO_MODE === "live" && !!process.env.STRIPE_SECRET_KEY;
  return live ? new StripeGateway() : new MockGateway();
}

/** Supported payment methods surfaced at checkout (crypto is pluggable). */
export const PAYMENT_METHODS: { id: PaymentMethod; label: string; note: string }[] = [
  { id: "card", label: "Card", note: "Visa, Mastercard, Amex" },
  { id: "wallet", label: "Wallet", note: "Apple Pay / Google Pay" },
  { id: "crypto", label: "Crypto", note: "Compliant wallet (provider TBD)" },
];
