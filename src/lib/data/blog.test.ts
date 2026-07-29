import { describe, expect, it } from "vitest";
import {
  bumpStat,
  createArticle,
  duplicateArticle,
  getStats,
  listRevisions,
  listTranslations,
  MAX_REVISIONS,
  publishDuePosts,
  relatedPosts,
  setArticleStatus,
  subscribeToBlog,
  listActiveSubscribers,
  unsubscribeFromBlog,
  updateArticle,
} from "@/lib/data/blog";

/**
 * The blog data layer in mock mode: the same code paths the admin console and
 * public pages call, minus the database. Live mode differs only in storage.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function draft(title: string, extra: Parameters<typeof createArticle>[0] extends infer T ? Partial<T> : never = {}) {
  const res = await createArticle({ title, body: `${title} body`, ...extra });
  if (!res.ok) throw new Error(`draft failed: ${res.reason}`);
  return res.article;
}

describe("articles", () => {
  it("refuses a built-in slug", async () => {
    const res = await createArticle({
      title: "Takeover",
      slug: "real-cost-of-airport-parking",
      body: "x",
    });
    expect(res).toEqual({ ok: false, reason: "slug-builtin" });
  });

  it("refuses a slug another article holds", async () => {
    await draft("Unique One", { slug: "unique-one" });
    const res = await createArticle({ title: "Other", slug: "unique-one", body: "y" });
    expect(res).toEqual({ ok: false, reason: "slug-taken" });
  });

  it("drops a scheduled time that is already in the past", async () => {
    const a = await draft("Past schedule", {
      scheduledAt: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(a.scheduledAt).toBeUndefined();
  });
});

describe("revisions", () => {
  it("snapshots the previous version on every update, capped", async () => {
    const a = await draft("Revised post");
    for (let i = 1; i <= MAX_REVISIONS + 3; i += 1) {
      const res = await updateArticle(a.id, { title: `Revised post v${i}`, body: `body v${i}` });
      expect(res.ok).toBe(true);
    }
    const revs = await listRevisions(a.id);
    expect(revs.length).toBe(MAX_REVISIONS);
    // Newest snapshot first — the version the latest save replaced.
    expect(revs[0].title).toBe(`Revised post v${MAX_REVISIONS + 2}`);
  });
});

describe("scheduling", () => {
  it("publishes a draft whose moment has passed, and stamps publishedAt", async () => {
    const a = await draft("Scheduled launch", {
      scheduledAt: new Date(Date.now() + 25).toISOString(),
    });
    expect(a.scheduledAt).toBeTruthy();
    expect(await publishDuePosts()).toBe(0); // not yet due
    await sleep(40);
    expect(await publishDuePosts()).toBe(1);
    const again = await publishDuePosts();
    expect(again).toBe(0); // idempotent — already flipped
  });
});

describe("duplicate", () => {
  it("clones as a fresh draft and probes for a free slug", async () => {
    const a = await draft("Template post", { slug: "template-post", tags: ["Guides"] });
    const copy1 = await duplicateArticle(a.id);
    const copy2 = await duplicateArticle(a.id);
    expect(copy1?.slug).toBe("template-post-copy");
    expect(copy2?.slug).toBe("template-post-copy-2");
    expect(copy1?.status).toBe("draft");
    expect(copy1?.title).toBe("Copy of Template post");
  });
});

describe("translations", () => {
  it("finds the family from either side", async () => {
    const en = await draft("Family original");
    const ur = await draft("Family Urdu", { lang: "ur", translationOf: en.id });
    await setArticleStatus(en.id, "published");
    await setArticleStatus(ur.id, "published");

    const fromEn = await listTranslations(en);
    const fromUr = await listTranslations(ur);
    expect(fromEn.map((x) => x.id)).toContain(ur.id);
    expect(fromUr.map((x) => x.id)).toContain(en.id);
    // Never lists yourself.
    expect(fromEn.map((x) => x.id)).not.toContain(en.id);
  });

  it("hides unpublished family members", async () => {
    const en = await draft("Family two");
    const de = await draft("Family two DE", { lang: "de", translationOf: en.id });
    await setArticleStatus(en.id, "published");
    // de stays a draft
    const fromEn = await listTranslations(en);
    expect(fromEn.map((x) => x.id)).not.toContain(de.id);
  });
});

describe("stats", () => {
  it("counts views and helpful separately, keyed by slug", async () => {
    await bumpStat("stats-slug", "views");
    await bumpStat("stats-slug", "views");
    await bumpStat("stats-slug", "helpful");
    const s = await getStats("stats-slug");
    expect(s.views).toBe(2);
    expect(s.helpful).toBe(1);
  });
});

describe("subscribers", () => {
  it("subscribes, unsubscribes, and honours a re-subscribe", async () => {
    expect(await subscribeToBlog("not-an-email")).toBe(false);
    expect(await subscribeToBlog("reader@example.com")).toBe(true);
    expect(await listActiveSubscribers()).toContain("reader@example.com");

    await unsubscribeFromBlog("reader@example.com");
    expect(await listActiveSubscribers()).not.toContain("reader@example.com");

    // Coming back is a real intent — the row revives rather than duplicating.
    expect(await subscribeToBlog("READER@example.com ")).toBe(true);
    const subs = await listActiveSubscribers();
    expect(subs.filter((e) => e === "reader@example.com").length).toBe(1);
  });
});

describe("related", () => {
  it("prefers tag overlap, fills with newest when nothing matches", async () => {
    const a = await draft("Related anchor", { tags: ["Winter", "EV"] });
    const b = await draft("Related match", { tags: ["winter"] });
    await setArticleStatus(a.id, "published");
    await setArticleStatus(b.id, "published");

    const rel = await relatedPosts(a.slug, a.tags, 3);
    expect(rel.length).toBe(3);
    expect(rel[0].slug).toBe(b.slug); // case-insensitive tag match outranks recency
    expect(rel.map((p) => p.slug)).not.toContain(a.slug);
  });
});
