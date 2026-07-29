"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, PencilLine, Save } from "lucide-react";
import type { BlogArticle } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { saveArticleAction, type BlogFormState } from "@/lib/blog-actions";
import { renderMarkdown, slugify } from "@/lib/markdown";

/**
 * The post editor: plain fields, a markdown box, and a live preview rendered
 * by the *same* function the public page uses — so what the author sees is
 * what readers get, not an approximation by a second renderer.
 */
export function BlogEditor({
  article,
  labels,
}: {
  article: BlogArticle | null;
  labels: {
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
  };
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  // Once someone edits the slug by hand it stops following the title — a
  // published URL that silently changes with a title tweak breaks every link
  // already pointing at it.
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [body, setBody] = useState(article?.body ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [state, action, pending] = useActionState<BlogFormState, FormData>(saveArticleAction, {});

  const preview = useMemo(() => renderMarkdown(body), [body]);
  const effectiveId = state.id ?? article?.id ?? "";

  return (
    <Card className="p-6">
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={effectiveId} />
        {article?.coverUrl && <input type="hidden" name="coverUrl" value={article.coverUrl} />}

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
            defaultValue={article?.excerpt ?? ""}
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="post-body">{labels.body}</Label>
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

          {/* The textarea stays mounted either way — unmounting it would drop
              the form field from the submit while previewing. */}
          <textarea
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

        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" /> {labels.save}
        </Button>
      </form>
    </Card>
  );
}
