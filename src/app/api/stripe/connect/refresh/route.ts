import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureHostForUser, setHostPayoutAccount } from "@/lib/data/hosts";
import { createHostOnboardingLink, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Stripe Connect onboarding-link refresh (the link expired). Re-issue one. */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const user = await getCurrentUser();
  if (!user || user.role !== "host" || !isStripeConfigured()) {
    return NextResponse.redirect(`${origin}/host`);
  }
  try {
    const host = await ensureHostForUser(user);
    const { url, accountId } = await createHostOnboardingLink({
      id: host.id,
      displayName: host.displayName,
      payoutAccountRef: host.payoutAccountRef,
    });
    if (accountId !== host.payoutAccountRef) await setHostPayoutAccount(host.id, accountId);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(`${origin}/host`);
  }
}
