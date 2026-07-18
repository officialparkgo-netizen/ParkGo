import { describe, expect, it } from "vitest";
import { resolveNext, rolePath } from "@/lib/auth";

describe("resolveNext", () => {
  it("sends each role to its own portal when there is no target", () => {
    expect(resolveNext(undefined, rolePath("admin"))).toBe("/admin");
    expect(resolveNext(null, rolePath("host"))).toBe("/host");
    expect(resolveNext("", rolePath("traveller"))).toBe("/app");
  });

  it("collapses bare portal roots to the user's own portal", () => {
    // Admin arriving via a generic "Get started" link (/login?next=/app).
    expect(resolveNext("/app", "/admin")).toBe("/admin");
    expect(resolveNext("/host", "/admin")).toBe("/admin");
    expect(resolveNext("/admin", "/app")).toBe("/app");
  });

  it("honors deep links", () => {
    expect(resolveNext("/app/booking/bk_1", "/admin")).toBe("/app/booking/bk_1");
    expect(resolveNext("/account?reset=1", "/app")).toBe("/account?reset=1");
    expect(resolveNext("/app/search?airport=gatwick", "/admin")).toBe(
      "/app/search?airport=gatwick"
    );
  });
});
