import { requireRole } from "@/lib/auth";
import { IS_LIVE } from "@/lib/config";

/**
 * Admin-only KYC document viewer: /admin/kyc?ref=<fileRef>.
 * Streams the file from the PRIVATE kyc-docs bucket via the service role —
 * documents never get public URLs. Mock refs get a demo placeholder.
 */

const TYPE_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export async function GET(request: Request) {
  await requireRole("admin");
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!ref || ref.includes("..")) return new Response("Bad request", { status: 400 });

  // Demo/mock refs have no real file behind them.
  if (!IS_LIVE || ref.startsWith("kyc:") || ref.startsWith("mock/")) {
    return new Response(
      `Demo mode — no real file behind "${ref}".\n\nIn live mode this streams the document from the private kyc-docs bucket (admin-only).`,
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }

  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const { data, error } = await supabaseAdmin().storage.from("kyc-docs").download(ref);
  if (error || !data) return new Response("Document not found", { status: 404 });

  const ext = ref.split(".").pop()?.toLowerCase() ?? "";
  return new Response(Buffer.from(await data.arrayBuffer()), {
    headers: {
      "Content-Type": TYPE_BY_EXT[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${ref.split("/").pop()}"`,
      "Cache-Control": "no-store",
    },
  });
}
