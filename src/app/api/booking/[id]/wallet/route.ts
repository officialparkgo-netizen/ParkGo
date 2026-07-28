import { NextResponse } from "next/server";
import { resolvePassAccess } from "@/lib/booking-access";
import { googleWalletSaveUrl, walletAvailability } from "@/lib/wallet";
import { makeShareToken, shareExpiryFor } from "@/lib/booking-share";

export const dynamic = "force-dynamic";

/**
 * Hand the pass to a phone wallet.
 *
 * Access goes through the same guard as the pass page itself, so a signed
 * share link works here too — the person putting the pass on their phone is
 * often the person actually driving, not the one who paid.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams, origin } = new URL(request.url);
  const access = await resolvePassAccess(id, searchParams.get("t") ?? undefined);
  if (!access) return new NextResponse("Not found", { status: 404 });

  const { booking, space } = access;
  const platform = searchParams.get("p");
  const available = walletAvailability();

  if (platform === "google") {
    const shareUrl = `${origin}/pass/${booking.id}?t=${makeShareToken(
      booking.id,
      shareExpiryFor(booking.endAt)
    )}`;
    const url = googleWalletSaveUrl(booking, space, shareUrl);
    // No credentials, or a key that would not sign: send them to the web pass,
    // which is the thing the wallet pass is a shortcut to anyway.
    if (!url) return NextResponse.redirect(shareUrl);
    return NextResponse.redirect(url);
  }

  // Apple needs a signed .pkpass archive, which needs a certificate that is
  // not an environment variable. Report what is missing rather than serving a
  // file that Wallet will silently refuse to open.
  if (platform === "apple") {
    if (!available.apple) {
      const { appleWalletMissing } = await import("@/lib/wallet");
      return NextResponse.json(
        { ok: false, reason: "not-configured", missing: appleWalletMissing() },
        { status: 503 }
      );
    }
    const { applePassJson } = await import("@/lib/wallet");
    // The archive is built and signed by the platform-specific builder; the
    // JSON is served here so the pipeline has a single source for pass content.
    return NextResponse.json(applePassJson(booking, space));
  }

  return NextResponse.json({ ok: true, ...available });
}
