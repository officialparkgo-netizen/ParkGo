"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Locale } from "@/types";
import { requireContentAdmin, requireFinanceAdmin } from "@/lib/auth";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  setArticleStatus,
  updateArticle,
  type SaveResult,
} from "@/lib/data/blog";
import { parseTags } from "@/lib/markdown";
import { uploadSpacePhoto } from "@/lib/storage";
import { recordAdminAction } from "@/lib/data/admin-actions";

/**
 * Blog actions. Guarded like /admin/broadcast rather than like the ticket
 * desk: publishing to the public site is outward-facing, and support-scope
 * agents are locked to support.
 */

export interface BlogFormState {
  ok?: boolean;
  error?: string;
  /** Set after a successful save so the editor can switch to editing-by-id. */
  id?: string;
}

const SAVE_ERRORS: Record<Exclude<SaveResult["reason" & keyof SaveResult], undefined> | string, string> = {
  empty: "Give the post a title.",
  "slug-taken": "Another post already uses that URL slug.",
  "slug-builtin": "That slug belongs to a built-in post. Pick a different one.",
  failed: "The post could not be saved. Try again.",
};

export async function saveArticleAction(
  _prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const admin = await requireContentAdmin();

  const id = String(formData.get("id") || "");
  const langRaw = String(formData.get("lang") || "en");
  const input = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    author: String(formData.get("author") || "") || admin.name,
    tags: parseTags(String(formData.get("tags") || "")),
    coverUrl: String(formData.get("coverUrl") || "") || undefined,
    scheduledAt: String(formData.get("scheduledAt") || "") || undefined,
    lang: (["en", "ur", "hi", "de", "zh", "ar"].includes(langRaw) ? langRaw : "en") as Locale,
    translationOf: String(formData.get("translationOf") || "") || undefined,
  };

  // A new cover replaces the kept one; mock mode has no storage, so the field
  // simply stays empty there.
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    const url = await uploadSpacePhoto(cover, "blog");
    if (url) input.coverUrl = url;
  }

  const result = id ? await updateArticle(id, input) : await createArticle(input);
  if (!result.ok) return { error: SAVE_ERRORS[result.reason] ?? SAVE_ERRORS.failed };

  await recordAdminAction(admin, id ? "blog.updated" : "blog.created", "blog", result.article.slug);
  revalidateBlog(result.article.slug);
  return { ok: true, id: result.article.id };
}

export async function setArticleStatusAction(formData: FormData): Promise<void> {
  const admin = await requireContentAdmin();
  const id = String(formData.get("id") || "");
  const status = formData.get("status") === "published" ? "published" : "draft";
  const article = await setArticleStatus(id, status);
  if (article) {
    await recordAdminAction(
      admin,
      status === "published" ? "blog.published" : "blog.unpublished",
      "blog",
      article.slug
    );
    revalidateBlog(article.slug);
    if (status === "published") {
      // Both are best-effort side effects of publishing, never publish itself:
      // subscribers hear about the new post, and search engines are pinged.
      const { announceNewPost } = await import("@/lib/blog-notify");
      await announceNewPost(article);
    }
  }
  redirect("/admin/blog");
}

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Body-image upload for the editor. Returns the URL so the client can splice
 * the markdown in at the cursor. Live mode only — mock has no storage.
 */
export async function uploadBlogImageAction(
  _prev: UploadResult,
  formData: FormData
): Promise<UploadResult> {
  await requireContentAdmin();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "empty" };
  const url = await uploadSpacePhoto(file, "blog");
  return url ? { url } : { error: "no-storage" };
}

export async function duplicateArticleAction(formData: FormData): Promise<void> {
  const admin = await requireContentAdmin();
  const id = String(formData.get("id") || "");
  const { duplicateArticle } = await import("@/lib/data/blog");
  const copy = await duplicateArticle(id);
  if (copy) {
    await recordAdminAction(admin, "blog.duplicated", "blog", copy.slug);
    redirect(`/admin/blog?edit=${copy.id}`);
  }
  redirect("/admin/blog");
}

/**
 * Invite a writer: a limited staff login that can only reach /admin/blog.
 * Full admins only — a writer must not be able to mint more writers, and a
 * support agent's lockdown never included publishing.
 */
export async function inviteWriterAction(formData: FormData): Promise<void> {
  const admin = await requireFinanceAdmin();
  const email = String(formData.get("email") || "");
  const name = String(formData.get("name") || "");
  const { createStaffAccount, findUserByEmail } = await import("@/lib/data/users");

  // Never re-point an existing full admin or agent: minting an invite for
  // them would hand this caller a set-password link for a peer's account.
  const existing = await findUserByEmail(email);
  if (existing && existing.role === "admin" && existing.adminScope !== "content") {
    redirect("/admin/blog?team=peer");
  }

  const writer = await createStaffAccount(email, name, "content");
  if (!writer) {
    revalidatePath("/admin/blog");
    redirect("/admin/blog?team=error");
  }

  const { sendTeamInvite } = await import("@/lib/team-invite-mail");
  const { emailed } = await sendTeamInvite(writer, admin.name);
  await recordAdminAction(admin, "blog.writer_invited", "user", writer.id, writer.email);
  revalidatePath("/admin/blog");
  redirect(`/admin/blog?team=${emailed ? "invited" : "invited-nomail"}`);
}

export async function removeWriterAction(formData: FormData): Promise<void> {
  const admin = await requireFinanceAdmin();
  const userId = String(formData.get("userId") || "");
  const { getUserProfile, revokeSupportAgent } = await import("@/lib/data/users");
  const member = userId ? await getUserProfile(userId) : null;
  // Only content-scoped accounts — this button must never demote an agent or
  // a peer, whatever id the form posts.
  if (!member || member.adminScope !== "content" || member.id === admin.id) {
    redirect("/admin/blog?team=error");
  }
  const ok = await revokeSupportAgent(userId);
  if (ok) await recordAdminAction(admin, "blog.writer_removed", "user", userId);
  revalidatePath("/admin/blog");
  redirect(`/admin/blog?team=${ok ? "removed" : "error"}`);
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  const admin = await requireContentAdmin();
  const id = String(formData.get("id") || "");
  // Read before delete, so the public page for it can still be revalidated.
  const article = await getArticleById(id);
  if (article && (await deleteArticle(id))) {
    await recordAdminAction(admin, "blog.deleted", "blog", article.slug);
    revalidateBlog(article.slug);
  }
  redirect("/admin/blog");
}

export interface SubscribeState {
  ok?: boolean;
  error?: boolean;
}

/**
 * Newsletter signup — the one action in this file with NO admin guard, because
 * it is the public blog's own form. It stores an address and nothing else.
 */
export async function subscribeToBlogAction(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const { subscribeToBlog } = await import("@/lib/data/blog");
  const ok = await subscribeToBlog(String(formData.get("email") || ""));
  return ok ? { ok: true } : { error: true };
}

/** The listing, the post, and the sitemap all change together. */
function revalidateBlog(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
}
