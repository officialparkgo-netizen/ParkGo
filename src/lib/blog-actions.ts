"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireFinanceAdmin } from "@/lib/auth";
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
  const admin = await requireFinanceAdmin();

  const id = String(formData.get("id") || "");
  const input = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    author: String(formData.get("author") || "") || admin.name,
    tags: parseTags(String(formData.get("tags") || "")),
    coverUrl: String(formData.get("coverUrl") || "") || undefined,
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
  const admin = await requireFinanceAdmin();
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
  }
  redirect("/admin/blog");
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  const admin = await requireFinanceAdmin();
  const id = String(formData.get("id") || "");
  // Read before delete, so the public page for it can still be revalidated.
  const article = await getArticleById(id);
  if (article && (await deleteArticle(id))) {
    await recordAdminAction(admin, "blog.deleted", "blog", article.slug);
    revalidateBlog(article.slug);
  }
  redirect("/admin/blog");
}

/** The listing, the post, and the sitemap all change together. */
function revalidateBlog(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
}
