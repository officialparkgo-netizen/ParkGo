"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Eye, History, ImagePlus, PencilLine, Save, XCircle } from "lucide-react";
import type { BlogArticle, BlogRevision, Locale } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import {
  saveArticleAction,
  uploadBlogImageAction,
  type BlogFormState,
} from "@/lib/blog-actions";
import { renderMarkdown, slugify } from "@/lib/markdown";

/**
 * The post editor: plain fields, a markdown box, and a live preview rendered
 * by the *same* function the public page uses — so what the author sees is
 * what readers get, not an approximation by a second renderer.
 *
 * It autosaves. A browser tab is where drafts die, and "I lost an hour of
 * writing" is the one editor failure nobody forgives — 2.5s after typing
 * stops, the draft saves itself, and the footer says when.
 */

const LANGS: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिन्दी" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
];

export interface EditorLabels {
  title: string;
  slug: string;
  slugHint: string;
  excerpt: string;
  excerptHint: string;
  author: string;
  tags: string;
  tagsHint: string;
  cover: string;
  coverHint: string;
  body: string;
  bodyHint: string;
  write: string;
  preview: string;
  save: string;
  saved: string;
  autosaved: string;
  schedule: string;
  scheduleHint: string;
  language: string;
  translationOf: string;
  translationNone: string;
  insertImage: string;
  insertImageNoStorage: string;
  seoTitle: string;
  seoChecks: [string, string, string, string, string];
  revisions: string;
  revisionsHint: string;
  restore: string;
  restoring: string;
}

export function BlogEditor({
  article,
  revision,
  revisions = [],
  otherArticles = [],
  labels,
}: {
  article: BlogArticle | null;
  /** A restored old version being previewed — save to make it current. */
  revision?: Pick<BlogRevision, "id" | "title" | "excerpt" | "body"> | null;
  revisions?: BlogRevision[];
  /** For the "translation of" picker. */
  otherArticles?: Pick<BlogArticle, "id" | "title" | "lang">[];
  labels: EditorLabels;
}) {
  const seed = revision ?? article;
  const [title, setTitle] = useState(seed?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  // Once someone edits the slug by hand it stops following the title — a
  // published URL that silently changes with a title tweak breaks every link
  // already pointing at it.
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [excerpt, setExcerpt] = useState(seed?.excerpt ?? "");
  const [body, setBody] = useState(seed?.body ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [state, action, pending] = useActionState<BlogFormState, FormData>(saveArticleAction, {});

  const formRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => renderMarkdown(body), [body]);
  const effectiveId = state.id ?? article?.id ?? "";

  // ------------------------------------------------------------- autosave ---
  const dirty = useRef(false);
  useEffect(() => {
    if (!title.trim()) return;
    dirty.current = true;
    const timer = setTimeout(() => {
      if (dirty.current && !pending) {
        dirty.current = false;
        formRef.current?.requestSubmit();
      }
    }, 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, excerpt, slug]);

  useEffect(() => {
    if (state.ok) {
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  }, [state]);

  // --------------------------------------------------------- image insert ---
  async function insertImage(file: File) {
    setUploadNote(null);
    const fd = new FormData();
    fd.append("image", file);
    const res = await uploadBlogImageAction({}, fd);
    if (!res.url) {
      setUploadNote(labels.insertImageNoStorage);
      return;
    }
    const el = bodyRef.current;
    const at = el?.selectionStart ?? body.length;
    const snippet = `\n![](${res.url})\n`;
    setBody((b) => b.slice(0, at) + snippet + b.slice(at));
  }

  // ---------------------------------------------------------- SEO checks ----
  const words = body.split(/\s+/).filter(Boolean).length;
  const images = [...body.matchAll(/!\[([^\]]*)\]\(/g)];
  const seo: { label: string; ok: boolean }[] = [
    { label: labels.seoChecks[0], ok: title.trim().length > 0 && title.length <= 60 },
    {
      label: labels.seoChecks[1],
      ok: excerpt.trim().length === 0 || (excerpt.length >= 50 && excerpt.length <= 160),
    },
    { label: labels.seoChecks[2], ok: words >= 300 },
    { label: labels.seoChecks[3], ok: /^##\s+/m.test(body) },
    { label: labels.seoChecks[4], ok: images.every((m) => m[1].trim().length > 0) },
  ];

  return (
    <Card className="p-6">
      <form ref={formRef} action={action} className="space-y-4">
        <input type="hidden" name="id" value={effectiveId} />
        {article?.coverUrl && <input type="hidden" name="coverUrl" value={article.coverUrl} />}

        {revision && (
          <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-700" data-restoring>
            {labels.restoring}
          </p>
        )}

        <div>
          <Label htmlFor="post-title">{labels.title}</Label>
          <Input
            id="post-title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="post-slug">{labels.slug}</Label>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-sm text-navy-400">/blog/</span>
              <Input
                id="post-slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
              />
            </div>
            <p className="mt-1 text-xs text-navy-400">{labels.slugHint}</p>
          </div>
          <div>
            <Label htmlFor="post-author">{labels.author}</Label>
            <Input id="post-author" name="author" defaultValue={article?.author ?? ""} />
          </div>
        </div>

        <div>
          <Label htmlFor="post-excerpt">{labels.excerpt}</Label>
          <textarea
            id="post-excerpt"
            name="excerpt"
            rows={2}
            maxLength={300}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-1 text-xs text-navy-400">{labels.excerptHint}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="post-tags">{labels.tags}</Label>
            <Input
              id="post-tags"
              name="tags"
              defaultValue={(article?.tags ?? []).join(", ")}
              placeholder="Travel tips, Pricing"
            />
            <p className="mt-1 text-xs text-navy-400">{labels.tagsHint}</p>
          </div>
          <div>
            <Label htmlFor="post-cover">{labels.cover}</Label>
            <input
              id="post-cover"
              name="cover"
              type="file"
              accept="image/*"
              className="w-full text-sm text-navy-600 file:mr-2 file:rounded-lg file:border-0 file:bg-navy-100 file:px-3 file:py-2 file:text-sm file:font-bold file:text-navy-800"
            />
            <p className="mt-1 text-xs text-navy-400">{labels.coverHint}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="post-schedule">{labels.schedule}</Label>
            <Input
              id="post-schedule"
              name="scheduledAt"
              type="datetime-local"
              defaultValue={article?.scheduledAt ? article.scheduledAt.slice(0, 16) : ""}
            />
            <p className="mt-1 text-xs text-navy-400">{labels.scheduleHint}</p>
          </div>
          <div>
            <Label htmlFor="post-lang">{labels.language}</Label>
            <select
              id="post-lang"
              name="lang"
              defaultValue={article?.lang ?? "en"}
              className="h-11 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="post-translation-of">{labels.translationOf}</Label>
            <select
              id="post-translation-of"
              name="translationOf"
              defaultValue={article?.translationOf ?? ""}
              className="h-11 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
            >
              <option value="">{labels.translationNone}</option>
              {otherArticles
                .filter((a) => a.id !== article?.id)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="post-body">{labels.body}</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-2.5 py-1 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                data-insert-image
              >
                <ImagePlus className="h-3 w-3" /> {labels.insertImage}
              </button>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void insertImage(f);
                  e.target.value = "";
                }}
              />
              <div className="flex gap-1 rounded-lg border border-navy-200 p-0.5">
                <button
                  type="button"
                  aria-pressed={tab === "write"}
                  onClick={() => setTab("write")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
                    tab === "write" ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-50"
                  }`}
                >
                  <PencilLine className="h-3 w-3" /> {labels.write}
                </button>
                <button
                  type="button"
                  aria-pressed={tab === "preview"}
                  onClick={() => setTab("preview")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
                    tab === "preview" ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-50"
                  }`}
                  data-preview-tab
                >
                  <Eye className="h-3 w-3" /> {labels.preview}
                </button>
              </div>
            </div>
          </div>

          {uploadNote && (
            <p className="mb-1 text-xs font-semibold text-accent-700">{uploadNote}</p>
          )}

          {/* The textarea stays mounted either way — unmounting it would drop
              the form field from the submit while previewing. */}
          <textarea
            ref={bodyRef}
            id="post-body"
            name="body"
            rows={16}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`w-full rounded-xl border border-navy-200 px-3.5 py-2.5 font-mono text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 ${
              tab === "preview" ? "hidden" : ""
            }`}
          />
          {tab === "preview" && (
            <div
              className="prose-blog min-h-[24rem] rounded-xl border border-navy-100 bg-navy-50/40 px-5 py-4"
              data-body-preview
              // Safe: renderMarkdown escapes before transforming; see markdown.ts.
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          )}
          <p className="mt-1 text-xs text-navy-400">{labels.bodyHint}</p>
        </div>

        {/* SEO nudges: advice, never a blocker — a launch announcement is
            allowed to be 80 words long. */}
        <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-3.5" data-seo-checks>
          <p className="text-xs font-bold text-navy-700">{labels.seoTitle}</p>
          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
            {seo.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5 text-xs">
                {c.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-go-600" aria-hidden />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-navy-300" aria-hidden />
                )}
                <span className={c.ok ? "text-navy-700" : "text-navy-400"}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-lg bg-go-50 px-3 py-2 text-sm font-semibold text-go-700" data-saved>
            {labels.saved}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" /> {labels.save}
          </Button>
          {savedAt && (
            <span className="text-xs text-navy-400" data-autosaved>
              {labels.autosaved} {savedAt}
            </span>
          )}
        </div>
      </form>

      {/* ------------------------------------------------------ revisions --- */}
      {article && revisions.length > 0 && (
        <div className="mt-6 border-t border-navy-100 pt-4" data-revisions>
          <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
            <History className="h-4 w-4 text-navy-500" /> {labels.revisions}
          </p>
          <p className="mt-0.5 text-xs text-navy-400">{labels.revisionsHint}</p>
          <ul className="mt-2 space-y-1">
            {revisions.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-navy-600">
                  {new Date(r.createdAt).toLocaleString()} · {r.title}
                </span>
                <a
                  href={`/admin/blog?edit=${article.id}&rev=${r.id}`}
                  className="shrink-0 font-semibold text-brand-700 hover:underline"
                >
                  {labels.restore}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
