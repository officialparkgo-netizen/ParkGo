import type { Metadata } from "next";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  FileDown,
  LockKeyhole,
  BellRing,
  ShieldCheck,
  Trash2,
  UserRound,
  Warehouse,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Avatar } from "@/components/common/avatar";
import { AvatarPicker } from "@/components/common/avatar-picker";
import { PortalShell } from "@/components/portal/shell";
import { adminNav, hostNav, travellerNav } from "@/components/portal/navs";
import { PasswordForm } from "@/components/auth/password-form";
import { requireUser } from "@/lib/auth";
import {
  requestPrivacyAction,
  setOwnTwofaAction,
  updateOwnProfileAction,
} from "@/lib/user-actions";
import { updateHostProfileAction } from "@/lib/host-actions";
import { setBookingAlertsAction } from "@/lib/host-suite-actions";
import { listBookingsForTraveller, listPaymentsForHost } from "@/lib/data/bookings";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { getI18n } from "@/lib/i18n";
import { formatDate, formatMoney } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Account",
  path: "/account",
  noindex: true,
});

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    reset?: string;
    twofa?: string;
    alerts?: string;
    profile?: string;
    privacy?: string;
    hostbio?: string;
  }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const { reset, twofa, profile, privacy, hostbio, alerts } = await searchParams;

  const nav =
    user.role === "admin" ? adminNav : user.role === "host" ? hostNav : travellerNav;

  // Role-aware summary chips.
  let tripCount = 0;
  let listingCount = 0;
  let lifetimeEarned = 0;
  const host = user.role === "host" ? await getHostForUser(user) : null;
  if (user.role === "traveller") {
    const bookings = await listBookingsForTraveller(user.id);
    tripCount = bookings.filter((b) => b.status !== "cancelled").length;
  } else if (host) {
    listingCount = (await getSpacesForHost(host.id)).length;
    lifetimeEarned = (await listPaymentsForHost(host.id))
      .filter((p) => p.payoutStatus !== "refunded")
      .reduce((s, p) => s + p.split.hostPayout, 0);
  }

  return (
    <PortalShell user={user} nav={nav} title="account.title">
      <div className="mx-auto max-w-2xl space-y-6">
        {reset && (
          <div className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-500">
            <LockKeyhole className="h-5 w-5" /> {t("account.resetBanner")}
          </div>
        )}
        {profile === "saved" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {t("account.profile.saved")}
          </div>
        )}
        {profile === "invalid" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {t("account.profile.invalid")}
          </div>
        )}
        {privacy && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {t("account.privacy.done")}
          </div>
        )}

        {/* Profile summary */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              color={user.avatarColor}
              className="h-14 w-14 text-lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-bold text-navy-900">{user.name}</span>
                <Badge tone="navy">{t(`role.${user.role}`)}</Badge>
              </div>
              <p className="truncate text-sm text-navy-500">{user.email}</p>
            </div>
            <UserRound className="hidden h-6 w-6 text-navy-300 sm:block" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-100 pt-4 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 font-semibold text-navy-700">
              <CalendarCheck className="h-3.5 w-3.5 text-navy-400" />
              {t("account.member")} {formatDate(user.createdAt)}
            </span>
            {user.role === "traveller" && (
              <span
                data-stat-trips
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700"
              >
                <Car className="h-3.5 w-3.5" />
                {tripCount} {t("account.stats.trips")}
              </span>
            )}
            {user.role === "host" && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
                  <Warehouse className="h-3.5 w-3.5" />
                  {listingCount} {t("account.stats.listings")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-go-50 px-3 py-1 font-semibold text-go-700">
                  {formatMoney(lifetimeEarned)} {t("account.stats.earned")}
                </span>
              </>
            )}
          </div>
        </Card>

        {/* Editable profile details */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy-900">
            <UserRound className="h-4 w-4 text-brand-600" /> {t("account.profile.title")}
          </h2>
          <p className="mb-4 mt-1 text-sm text-navy-500">{t("account.profile.sub")}</p>
          <form action={updateOwnProfileAction} className="space-y-4">
            <div>
              <Label>{t("account.profile.photo")}</Label>
              <div className="mt-1">
                <AvatarPicker
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  color={user.avatarColor}
                  chooseLabel={t("avatar.choose")}
                  changeLabel={t("avatar.change")}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t("account.profile.name")}</Label>
                <Input id="name" name="name" required minLength={2} defaultValue={user.name} />
              </div>
              <div>
                <Label htmlFor="phone">{t("account.profile.phone")}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={user.phone ?? ""}
                  placeholder="+44 7…"
                />
              </div>
            </div>

            {user.role === "traveller" && (
              <div className="rounded-2xl border border-navy-100 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
                  <Car className="h-4 w-4 text-brand-600" /> {t("account.vehicle.title")}
                </h3>
                <p className="mb-3 mt-0.5 text-xs text-navy-500">{t("account.vehicle.sub")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="vehicleReg">{t("account.vehicle.reg")}</Label>
                    <Input
                      id="vehicleReg"
                      name="vehicleReg"
                      defaultValue={user.vehicle?.reg ?? ""}
                      placeholder="AB12 CDE"
                      className="uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleMake">{t("account.vehicle.make")}</Label>
                    <Input
                      id="vehicleMake"
                      name="vehicleMake"
                      defaultValue={user.vehicle?.make ?? ""}
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel">{t("account.vehicle.model")}</Label>
                    <Input
                      id="vehicleModel"
                      name="vehicleModel"
                      defaultValue={user.vehicle?.model ?? ""}
                      placeholder="Corolla"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleColour">{t("account.vehicle.colour")}</Label>
                    <Input
                      id="vehicleColour"
                      name="vehicleColour"
                      defaultValue={user.vehicle?.colour ?? ""}
                      placeholder="Silver"
                    />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className={buttonVariants({ size: "sm" })}>
              {t("account.profile.save")}
            </button>
          </form>
        </Card>

        {/* Host guest-facing profile (moved from the host dashboard) */}
        {host && (
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-navy-900">
                <Warehouse className="h-4 w-4 text-brand-600" /> {t("host.section.yourProfile")}
              </h2>
              <Badge tone="go">
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("host.profileShownToGuests")}
              </Badge>
            </div>
            <p className="mb-4 mt-1 text-sm text-navy-500">{t("host.profileBlurb")}</p>
            {hostbio === "saved" && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" /> {t("host.profileSavedBanner")}
              </div>
            )}
            {hostbio === "error" && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {t("host.profileErrorBanner")}
              </div>
            )}
            <form action={updateHostProfileAction}>
              <Label htmlFor="bio">{t("host.bioLabel")}</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={host.bio ?? ""}
                placeholder={t("host.bioPlaceholder")}
                className="mt-1 w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-2" })}
              >
                {t("host.saveProfile")}
              </button>
            </form>
          </Card>
        )}

        {/* 2FA (admins + hosts, self-service) */}
        {(user.role === "admin" || user.role === "host") && (
          <Card className="p-5">
            {twofa && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {twofa === "on" ? t("account.twofa.savedOn") : t("account.twofa.savedOff")}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-navy-900">
                  <ShieldCheck className="h-4 w-4 text-brand-600" /> {t("account.twofa.title")}
                </h2>
                <p className="mt-1 max-w-md text-sm text-navy-500">{t("account.twofa.sub")}</p>
              </div>
              <Badge tone={user.twofaEnabled ? "go" : "neutral"} data-twofa-state>
                {user.twofaEnabled ? t("account.twofa.on") : t("account.twofa.off")}
              </Badge>
            </div>
            <form action={setOwnTwofaAction} className="mt-4">
              <input type="hidden" name="state" value={user.twofaEnabled ? "off" : "on"} />
              <button
                type="submit"
                className={buttonVariants({
                  variant: user.twofaEnabled ? "outline" : "primary",
                  size: "sm",
                })}
              >
                {user.twofaEnabled ? t("account.twofa.disable") : t("account.twofa.enable")}
              </button>
            </form>
          </Card>
        )}

        {/* Booking email alerts (hosts) */}
        {user.role === "host" && (
          <Card className="p-5">
            {alerts && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {alerts === "on" ? t("account.alerts.savedOn") : t("account.alerts.savedOff")}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-navy-900">
                  <BellRing className="h-4 w-4 text-brand-600" /> {t("account.alerts.title")}
                </h2>
                <p className="mt-1 max-w-md text-sm text-navy-500">{t("account.alerts.sub")}</p>
              </div>
              <Badge tone={user.emailBookingAlerts !== false ? "go" : "neutral"} data-alerts-state>
                {user.emailBookingAlerts !== false
                  ? t("account.twofa.on")
                  : t("account.twofa.off")}
              </Badge>
            </div>
            <form action={setBookingAlertsAction} className="mt-4">
              <input
                type="hidden"
                name="state"
                value={user.emailBookingAlerts !== false ? "off" : "on"}
              />
              <button
                type="submit"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {user.emailBookingAlerts !== false
                  ? t("account.alerts.disable")
                  : t("account.alerts.enable")}
              </button>
            </form>
          </Card>
        )}

        {/* Change password */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy-900">
            <LockKeyhole className="h-4 w-4 text-brand-600" /> {t("account.password.title")}
          </h2>
          <p className="mb-4 mt-1 text-sm text-navy-500">{t("account.password.sub")}</p>
          <PasswordForm />
        </Card>

        {/* Privacy & data (UK GDPR) */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy-900">
            <ShieldCheck className="h-4 w-4 text-brand-600" /> {t("account.privacy.title")}
          </h2>
          <p className="mb-4 mt-1 text-sm text-navy-500">{t("account.privacy.sub")}</p>
          <div className="flex flex-wrap gap-2">
            <form action={requestPrivacyAction}>
              <input type="hidden" name="kind" value="export" />
              <button
                type="submit"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileDown className="h-3.5 w-3.5" /> {t("account.privacy.export")}
              </button>
            </form>
            <form action={requestPrivacyAction}>
              <input type="hidden" name="kind" value="delete" />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> {t("account.privacy.delete")}
              </button>
            </form>
          </div>
        </Card>

        <p className="flex items-center gap-2 text-xs text-navy-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-go-500" />
          {t("account.securityNote")}
        </p>
      </div>
    </PortalShell>
  );
}
