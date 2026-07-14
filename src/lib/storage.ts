import "server-only";
import { IS_LIVE } from "@/lib/config";

/**
 * Supabase Storage helpers (server-only, service role).
 * - space-photos: public bucket for listing photos (public URLs).
 * - kyc-docs: private bucket for verification documents (path refs only).
 * Buckets are created lazily so no manual dashboard/SQL step is needed.
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10MB

const ensured = new Set<string>();

async function ensureBucket(name: string, isPublic: boolean) {
  if (ensured.has(name)) return;
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const storage = supabaseAdmin().storage;
  const { data } = await storage.getBucket(name);
  if (!data) {
    await storage.createBucket(name, { public: isPublic }).catch(() => {
      /* raced/exists — fine */
    });
  }
  ensured.add(name);
}

function extFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type.split("/")[1] || "bin";
}

/** Upload a listing photo; returns its public URL (or null if invalid/mock). */
export async function uploadSpacePhoto(file: File, spaceKey: string): Promise<string | null> {
  if (!IS_LIVE) return null; // mock mode keeps token placeholders
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;
  if (file.size > MAX_IMAGE_BYTES) return null;

  await ensureBucket("space-photos", true);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const storage = supabaseAdmin().storage.from("space-photos");
  const path = `${spaceKey}/${crypto.randomUUID()}.${extFor(file)}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await storage.upload(path, buf, { contentType: file.type, upsert: false });
  if (error) return null;
  return storage.getPublicUrl(path).data.publicUrl;
}

/** Upload a private KYC document; returns the storage path (not a URL). */
export async function uploadKycDoc(file: File, hostId: string): Promise<string | null> {
  if (!IS_LIVE) return `mock/${file.name}`;
  if (!file || file.size === 0) return null;
  const okType = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!okType || file.size > MAX_DOC_BYTES) return null;

  await ensureBucket("kyc-docs", false);
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const storage = supabaseAdmin().storage.from("kyc-docs");
  const path = `${hostId}/${crypto.randomUUID()}.${extFor(file)}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await storage.upload(path, buf, { contentType: file.type, upsert: false });
  if (error) return null;
  return path;
}
