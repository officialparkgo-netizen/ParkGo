import { requireRole } from "@/lib/auth";
import { IS_LIVE } from "@/lib/config";
import { getHostForUser } from "@/lib/data/hosts";

/**
 * A host's view of their OWN verification documents:
 * /host/kyc?ref=<fileRef>. Same private-bucket streaming as the admin
 * viewer, with one extra rule — the path must belong to this host. KYC
 * uploads are stored under `<hostId>/<uuid>.<ext>`, which is what makes the
 * ownership check a prefix test rather than a database lookup.
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
  const user = await requireRole("host");
  const host = await getHostForUser(user);
  if (!host) return new Response("Not found", { status: 404 });

  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!ref || ref.includes("..")) return new Response("Bad request", { status: 400 });

  // Demo/mock refs have no real file behind them.
  if (!IS_LIVE || ref.startsWith("kyc:") || ref.startsWith("mock/")) {
    return new Response(
      `Demo mode — no real file behind "${ref}".`,
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }

  if (!ref.startsWith(`${host.id}/`)) return new Response("Not found", { status: 404 });

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
