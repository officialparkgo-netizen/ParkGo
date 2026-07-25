import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarPlus,
  CheckCircle2,
  MessageSquareHeart,
  ShieldOff,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { CopyLinkButton } from "@/components/common/copy-link-button";
import { PortalShell } from "@/components/portal/shell";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { ensureHostForUser } from "@/lib/data/hosts";
import { getUsersByIds } from "@/lib/data/users";
import { icalToken } from "@/lib/ical";
import {
  inviteCohostAction,
  removeCohostAction,
  resendCohostInviteAction,
  saveAutoWelcomeAction,
  unblockGuestAction,
} from "@/lib/host-suite2-actions";
import { inviteLinkFor } from "@/lib/team-invite-mail";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Host settings",
  path: "/host/settings",
  noindex: true,
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.parkgo.ai";

/** Host-level preferences: welcome message, calendar feed, co-host, blocklist. */
export default async function HostSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; cohost?: string; guest?: string }>;
}) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const { t } = await getI18n();
  const { welcome, cohost, guest } = await searchParams;
  const host = await ensureHostForUser(user);
  const blocked = host.blockedGuests ?? [];
  const { getUserProfile } = await import("@/lib/data/users");
  const cohostUser = host.cohostUserId ? await getUserProfile(host.cohostUserId) : null;
  const cohostPending = cohostUser?.inviteNonce
    ? inviteLinkFor(cohostUser.id, cohostUser.inviteNonce)
    : null;
  const blockedUsers = await getUsersByIds(blocked);
  const icalUrl = `${SITE}/api/host/ical?host=${host.id}&token=${icalToken(host.id)}`;

  const banner = (text: string, ok: boolean) => (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 font-semibold ${
        ok
          ? "border-go-200 bg-go-50 text-go-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />} {text}
    </div>
  );

  return (
    <PortalShell user={user} nav={hostNav} title="host.settings.title">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href="/host" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        {welcome === "saved" && banner(t("host.settings.welcomeSaved"), true)}
        {welcome === "error" && banner(t("host.settings.error"), false)}
        {cohost === "invited" && banner(t("host.settings.cohostInvited"), true)}
        {cohost === "resent" && banner(t("host.settings.cohostResent"), true)}
        {cohost === "invited-nomail" && (
          <div
            className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-700"
            data-cohost-nomail
          >
            <CheckCircle2 className="h-5 w-5" /> {t("host.settings.cohostNoMail")}
          </div>
        )}
        {cohost === "removed" && banner(t("host.settings.cohostRemoved"), true)}
        {cohost === "error" && banner(t("host.settings.cohostError"), false)}
        {guest === "unblocked" && banner(t("host.settings.guestUnblocked"), true)}

        {/* Auto welcome message */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
            <MessageSquareHeart className="h-5 w-5 text-brand-700" />
            {t("host.settings.welcomeTitle")}
          </h2>
          <p className="mt-1 text-sm text-navy-500">{t("host.settings.welcomeSub")}</p>
          <form action={saveAutoWelcomeAction} className="mt-4 space-y-3">
            <Textarea
              name="autoWelcome"
              rows={3}
              maxLength={600}
              defaultValue={host.autoWelcome ?? ""}
              placeholder={t("host.settings.welcomePh")}
            />
            <Button type="submit">{t("host.settings.welcomeSave")}</Button>
          </form>
        </Card>

        {/* Calendar feed */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
            <CalendarPlus className="h-5 w-5 text-brand-700" />
            {t("host.settings.icalTitle")}
          </h2>
          <p className="mt-1 text-sm text-navy-500">{t("host.settings.icalSub")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code className="block max-w-full overflow-x-auto rounded-xl bg-navy-50 px-3.5 py-2.5 text-xs text-navy-700">
              {icalUrl}
            </code>
            <CopyLinkButton
              value={icalUrl}
              label={t("host.settings.icalCopy")}
              copiedLabel={t("host.settings.icalCopied")}
            />
          </div>
          <p className="mt-2 text-xs text-navy-400">{t("host.settings.icalHint")}</p>
        </Card>

        {/* Co-host */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
            <UserPlus className="h-5 w-5 text-brand-700" />
            {t("host.settings.cohostTitle")}
          </h2>
          <p className="mt-1 text-sm text-navy-500">{t("host.settings.cohostSub")}</p>
          {host.cohostUserId ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge tone="go" data-cohost-state>
                {host.cohostEmail ?? t("host.settings.cohostActive")}
              </Badge>
              {cohostPending && (
                <>
                  <Badge tone="accent" data-cohost-pending>
                    {t("admin.team.pending")}
                  </Badge>
                  <span data-cohost-invite-link={cohostPending}>
                    <CopyLinkButton
                      value={cohostPending}
                      label={t("admin.team.copyInvite")}
                      copiedLabel={t("host.settings.icalCopied")}
                    />
                  </span>
                  <form action={resendCohostInviteAction}>
                    <button
                      type="submit"
                      className="text-xs font-semibold text-brand-700 hover:text-brand-700"
                    >
                      {t("admin.team.resend")}
                    </button>
                  </form>
                </>
              )}
              <form action={removeCohostAction}>
                <Button type="submit" variant="outline">
                  {t("host.settings.cohostRemove")}
                </Button>
              </form>
            </div>
          ) : (
            <form action={inviteCohostAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <Label htmlFor="cohostName">{t("host.settings.cohostName")}</Label>
                <Input id="cohostName" name="name" placeholder="Alex" />
              </div>
              <div>
                <Label htmlFor="cohostEmail">{t("host.settings.cohostEmail")}</Label>
                <Input
                  id="cohostEmail"
                  name="email"
                  type="email"
                  required
                  placeholder="alex@example.com"
                />
              </div>
              <div className="self-end">
                <Button type="submit">{t("host.settings.cohostInvite")}</Button>
              </div>
            </form>
          )}
          <p className="mt-2 text-xs text-navy-400">{t("host.settings.cohostHint")}</p>
        </Card>

        {/* Blocked guests */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
            <ShieldOff className="h-5 w-5 text-brand-700" />
            {t("host.settings.blockTitle")}
            <Badge tone="neutral">{blocked.length}</Badge>
          </h2>
          <p className="mt-1 text-sm text-navy-500">{t("host.settings.blockSub")}</p>
          {blocked.length === 0 ? (
            <p className="mt-4 text-sm text-navy-400">{t("host.settings.blockEmpty")}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {blocked.map((id) => (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-navy-50 px-3.5 py-2.5"
                >
                  <span className="text-sm font-semibold text-navy-800">
                    {blockedUsers.get(id)?.name ?? id}
                  </span>
                  <form action={unblockGuestAction}>
                    <input type="hidden" name="guestId" value={id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-brand-700 hover:text-brand-700"
                    >
                      {t("host.settings.unblock")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PortalShell>
  );
}
