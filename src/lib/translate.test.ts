import { afterEach, describe, expect, it, vi } from "vitest";
import { isTranslationConfigured, translateText, translationProvider, worthTranslating } from "./translate";
import { detectLocale } from "./support-lang";

/**
 * Translation decides what an agent reads and therefore what they act on, so
 * the two rules that protect the customer are pinned here: no provider means
 * no loss, and the original is never what gets replaced.
 */

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("provider gating", () => {
  it("reports nothing configured when no key is set", () => {
    vi.stubEnv("DEEPL_API_KEY", "");
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", "");
    vi.stubEnv("PARKGO_DEMO_TRANSLATE", "");
    expect(translationProvider()).toBeNull();
    expect(isTranslationConfigured()).toBe(false);
  });

  it("never uses the demo provider in live mode", () => {
    vi.stubEnv("DEEPL_API_KEY", "");
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", "");
    vi.stubEnv("PARKGO_DEMO_TRANSLATE", "1");
    vi.stubEnv("PARKGO_MODE", "live");
    expect(translationProvider()).toBeNull();
  });

  it("labels the demo output so it cannot pass for a translation", async () => {
    vi.stubEnv("DEEPL_API_KEY", "");
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", "");
    vi.stubEnv("PARKGO_DEMO_TRANSLATE", "1");
    vi.stubEnv("PARKGO_MODE", "mock");
    const out = await translateText("مدد", "en", "ur");
    expect(out?.provider).toBe("demo");
    expect(out?.text).toContain("no translation provider configured");
  });

  it("prefers DeepL when both are set", () => {
    vi.stubEnv("DEEPL_API_KEY", "k");
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", "g");
    expect(translationProvider()).toBe("deepl");
  });

  it("translates nothing without a key, rather than throwing", async () => {
    vi.stubEnv("DEEPL_API_KEY", "");
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", "");
    vi.stubEnv("PARKGO_DEMO_TRANSLATE", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await translateText("میری بکنگ منسوخ کریں", "en", "ur")).toBeNull();
    // A missing key must not even attempt a call.
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("translateText", () => {
  it("reads DeepL's shape", async () => {
    vi.stubEnv("DEEPL_API_KEY", "k");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        ok({ translations: [{ text: "Cancel my booking", detected_source_language: "UR" }] })
      )
    );
    expect(await translateText("میری بکنگ منسوخ کریں", "en", "ur")).toEqual({
      text: "Cancel my booking",
      detected: "ur",
      provider: "deepl",
    });
  });

  it("sends free-tier keys to the free host", async () => {
    vi.stubEnv("DEEPL_API_KEY", "abc:fx");
    const fetchMock = vi.fn().mockResolvedValue(ok({ translations: [{ text: "hi" }] }));
    vi.stubGlobal("fetch", fetchMock);
    await translateText("hallo", "en", "de");
    expect(String(fetchMock.mock.calls[0][0])).toContain("api-free.deepl.com");
  });

  it("reads Google's shape", async () => {
    vi.stubEnv("DEEPL_API_KEY", "");
    vi.stubEnv("PARKGO_DEMO_TRANSLATE", "");
    vi.stubEnv("GOOGLE_TRANSLATE_API_KEY", "g");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        ok({ data: { translations: [{ translatedText: "Where is my car?", detectedSourceLanguage: "hi" }] } })
      )
    );
    const out = await translateText("मेरी गाड़ी कहाँ है?", "en");
    expect(out).toMatchObject({ text: "Where is my car?", provider: "google" });
  });

  it("returns null rather than throwing when the provider is down", async () => {
    vi.stubEnv("DEEPL_API_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await translateText("hallo", "en", "de")).toBeNull();
  });

  it("returns null on an HTTP error", async () => {
    vi.stubEnv("DEEPL_API_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 456, json: async () => ({}) }));
    expect(await translateText("hallo", "en", "de")).toBeNull();
  });

  it("does not call out when the source is already the target", async () => {
    vi.stubEnv("DEEPL_API_KEY", "k");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await translateText("hello", "en", "en")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ignores an empty message", async () => {
    vi.stubEnv("DEEPL_API_KEY", "k");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await translateText("   ", "en", "ur")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("worthTranslating", () => {
  it("skips English", () => {
    expect(worthTranslating("my car is stuck behind the gate", "en")).toBe(false);
  });

  it("translates any non-Latin script, even one word", () => {
    // A single Urdu word is still a word an English reader cannot read.
    expect(worthTranslating("مدد", "ur")).toBe(true);
    expect(worthTranslating("मदद", "hi")).toBe(true);
    expect(worthTranslating("你好", "zh")).toBe(true);
  });

  it("needs more than one word for a Latin-script language", () => {
    // "ok" and "danke" carry no question; translating them is noise in the
    // thread rather than help.
    expect(worthTranslating("ok", "de")).toBe(false);
    expect(worthTranslating("Ich kann nicht stornieren", "de")).toBe(true);
  });

  it("does not treat a bare link as language", () => {
    expect(worthTranslating("https://www.parkgo.ai/app/booking/abc", "de")).toBe(false);
  });
});

describe("what actually gets translated end to end", () => {
  it("detects then translates the languages the product supports", async () => {
    vi.stubEnv("DEEPL_API_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ translations: [{ text: "translated" }] })));

    const cases: [string, string][] = [
      ["میری گاڑی گیٹ کے پیچھے پھنس گئی ہے", "ur"],
      ["मेरी गाड़ी गेट के पीछे फँस गई है", "hi"],
      ["你好，我的车被门挡住了", "zh"],
      ["Ich kann meine Buchung nicht stornieren", "de"],
    ];
    for (const [text, expected] of cases) {
      const locale = detectLocale(text);
      expect(locale, text).toBe(expected);
      expect(worthTranslating(text, locale), text).toBe(true);
      expect((await translateText(text, "en", locale))?.text).toBe("translated");
    }
  });
});
