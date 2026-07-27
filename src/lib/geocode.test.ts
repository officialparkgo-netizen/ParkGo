import { afterEach, describe, expect, it, vi } from "vitest";
import { geocodeUk, geocodeUkDetailed, parseGeocode } from "./geo-search";

/**
 * Geocoding is the one thing here that talks to a third party, so it is also
 * the one thing that used to fail invisibly: a missing token, a wrong token, a
 * URL-restricted token and a retired endpoint all returned `[]`. These tests
 * pin the version handling and the parsing without touching the network.
 */

const V6_BODY = {
  features: [
    {
      geometry: { type: "Point", coordinates: [-0.1276, 51.5074] },
      properties: {
        name: "SW1A 1AA",
        place_formatted: "London, England, United Kingdom",
        full_address: "SW1A 1AA, London, England, United Kingdom",
      },
    },
    {
      geometry: { type: "Point", coordinates: [-0.19, 51.11] },
      properties: { name: "Crawley", place_formatted: "England, United Kingdom" },
    },
  ],
};

const V5_BODY = {
  features: [
    { place_name: "SW1A 1AA, London, United Kingdom", center: [-0.1276, 51.5074] },
  ],
};

const okRes = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
const errRes = (status: number) => ({ ok: false, status, json: async () => ({}) });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("parseGeocode", () => {
  it("reads the v6 shape, preferring full_address", () => {
    expect(parseGeocode("v6", V6_BODY)).toEqual([
      { label: "SW1A 1AA, London, England, United Kingdom", lat: 51.5074, lng: -0.1276 },
      { label: "Crawley, England, United Kingdom", lat: 51.11, lng: -0.19 },
    ]);
  });

  it("reads the v5 shape", () => {
    expect(parseGeocode("v5", V5_BODY)).toEqual([
      { label: "SW1A 1AA, London, United Kingdom", lat: 51.5074, lng: -0.1276 },
    ]);
  });

  it("drops features with no label or no coordinates", () => {
    expect(
      parseGeocode("v6", {
        features: [
          { properties: { name: "No geometry" } },
          { geometry: { coordinates: [1, 2] }, properties: {} },
          { geometry: { coordinates: ["a", "b"] }, properties: { name: "Bad coords" } },
        ],
      })
    ).toEqual([]);
  });

  it("survives rubbish", () => {
    expect(parseGeocode("v6", null)).toEqual([]);
    expect(parseGeocode("v5", { features: "nope" })).toEqual([]);
  });
});

describe("geocodeUkDetailed", () => {
  it("says so when there is no token, rather than looking like no results", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "");
    expect(await geocodeUkDetailed("sw1a")).toEqual({ ok: false, reason: "no-token" });
  });

  it("accepts a two-character outward code", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.test");
    const fetchMock = vi.fn().mockResolvedValue(okRes(V6_BODY));
    vi.stubGlobal("fetch", fetchMock);
    const res = await geocodeUkDetailed("N1");
    expect(res.ok).toBe(true);
    // The old gate rejected anything under 3 characters, which silently
    // excluded N1, E1 and W1.
    expect(fetchMock).toHaveBeenCalled();
  });

  it("calls v6 first", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.test");
    const fetchMock = vi.fn().mockResolvedValue(okRes(V6_BODY));
    vi.stubGlobal("fetch", fetchMock);
    const res = await geocodeUkDetailed("sw1a");
    expect(res).toMatchObject({ ok: true, via: "v6" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/search/geocode/v6/forward");
    expect(url).toContain("country=gb%2Cie");
  });

  it("never asks v6 for a type it does not have", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.test");
    const fetchMock = vi.fn().mockResolvedValue(okRes(V6_BODY));
    vi.stubGlobal("fetch", fetchMock);
    await geocodeUkDetailed("sw1a");
    // `poi` was retired from geocoding in v6 (it lives in the Search Box API
    // now). Sending it gets the whole request rejected, which is exactly how a
    // working token ends up quietly served by the legacy v5 endpoint.
    expect(String(fetchMock.mock.calls[0][0])).not.toContain("poi");
  });

  it("still asks v5 for poi, which v5 does support", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.old");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errRes(422))
      .mockResolvedValueOnce(okRes(V5_BODY));
    vi.stubGlobal("fetch", fetchMock);
    await geocodeUkDetailed("sw1a");
    expect(String(fetchMock.mock.calls[1][0])).toContain("poi");
  });

  it("falls back to v5 when v6 rejects the request", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.old");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errRes(404))
      .mockResolvedValueOnce(okRes(V5_BODY));
    vi.stubGlobal("fetch", fetchMock);
    const res = await geocodeUkDetailed("sw1a");
    expect(res).toMatchObject({ ok: true, via: "v5" });
    expect(String(fetchMock.mock.calls[1][0])).toContain("/geocoding/v5/mapbox.places/");
  });

  it("reports the HTTP status when both versions refuse", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.bad");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errRes(401)));
    // A 401 is a bad or restricted token, and used to be indistinguishable
    // from "that postcode does not exist".
    expect(await geocodeUkDetailed("sw1a")).toEqual({
      ok: false,
      reason: "http",
      status: 401,
      via: "v5",
    });
  });

  it("distinguishes a network failure from an empty result", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await geocodeUkDetailed("sw1a")).toMatchObject({ ok: false, reason: "network" });
  });

  it("reports a genuine miss as no-match", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okRes({ features: [] })));
    expect(await geocodeUkDetailed("zzzqqq")).toMatchObject({ ok: false, reason: "no-match" });
  });
});

describe("geocodeUk", () => {
  it("keeps the old quiet contract for callers that just want hits", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_TOKEN", "pk.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okRes(V6_BODY)));
    expect((await geocodeUk("sw1a")).map((h) => h.lat)).toEqual([51.5074, 51.11]);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errRes(401)));
    expect(await geocodeUk("sw1a")).toEqual([]);
  });
});
