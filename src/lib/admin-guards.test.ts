import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

/**
 * Guard-rail: hiding a control in the UI is not security. Every action a
 * support-scope agent must not perform has to call requireFinanceAdmin() —
 * requireRole("admin") lets agents through, because an agent IS role=admin.
 *
 * Source-level so it fails loudly if someone downgrades a guard later.
 */
const FULL_ADMIN_ONLY: Record<string, string[]> = {
  "src/lib/admin-suite-actions.ts": [
    "adminCancelBookingAction",
    "adminPartialRefundAction",
    "adminChangeBookingDatesAction",
    "markPayoutPaidAction",
    "runStripePayoutsAction",
    "setReviewHiddenAction",
    "createPromoAction",
    "setPromoActiveAction",
    "startImpersonationAction",
    "setClaimStatusAction",
    "createCampaignAction",
    "cancelCampaignAction",
    "bulkApproveListingsAction",
    "anonymizeUserAction",
    "setAdminScopeAction",
    "savePlatformSettingsAction",
    "sendDigestNowAction",
    "inviteWaitlistAction",
    "inviteSupportAgentAction",
    "resendTeamInviteAction",
    "removeSupportAgentAction",
  ],
  "src/lib/user-actions.ts": ["setUserRoleAction", "setUserSuspendedAction"],
  "src/lib/booking-actions.ts": [
    "reviewVerificationAction",
    "reviewSpaceAction",
    "pauseSpaceAction",
  ],
};

/** The body of an exported async function, up to the next export. */
function bodyOf(source: string, fn: string): string {
  const start = source.indexOf(`export async function ${fn}(`);
  if (start === -1) return "";
  const next = source.indexOf("\nexport ", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

describe("support agents cannot reach full-admin actions", () => {
  for (const [file, fns] of Object.entries(FULL_ADMIN_ONLY)) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    for (const fn of fns) {
      it(`${fn} is guarded by requireFinanceAdmin`, () => {
        const body = bodyOf(source, fn);
        expect(body, `${fn} not found in ${file}`).not.toBe("");
        expect(body).toContain("requireFinanceAdmin()");
        expect(body).not.toContain('requireRole("admin")');
      });
    }
  }
});

describe("invite links can never be aimed at a peer admin", () => {
  const source = readFileSync(
    join(process.cwd(), "src/lib/admin-suite-actions.ts"),
    "utf8"
  );

  it("inviting refuses an existing full admin", () => {
    const body = bodyOf(source, "inviteSupportAgentAction");
    expect(body).toContain("findUserByEmail");
    expect(body).toMatch(/adminScope !== "support"/);
  });

  it("resending is limited to pending support agents and never yourself", () => {
    const body = bodyOf(source, "resendTeamInviteAction");
    expect(body).toMatch(/adminScope !== "support"/);
    expect(body).toContain("member.id === admin.id");
  });
});
