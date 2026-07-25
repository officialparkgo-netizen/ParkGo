import type { Metadata } from "next";
import {
  BellRing,
  Building2,
  CalendarCheck,
  Car,
  CheckCircle2,
  FileDown,
  Gift,
  LockKeyhole,
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
import {
  claimReferralAction,
  saveBusinessAction,
  saveVehiclesAction,
} from "@/lib/guest-actions";
import { REFERRAL_FRIEND_CREDIT, REFERRAL_REFERRER_CREDIT, referralCodeFor } from "@/lib/referrals";
import { ensureReferralCode } from "@/lib/data/users";
import { CopyLinkButton } from "@/components/common/copy-link-button";
import { updateHostProfileAction } from "@/lib/host-actions";
import { setBookingAlertsAction } from "@/lib/host-suite-actions";
import { listBookingsForTraveller, listPaymentsForHost } from "@/lib/data/bookings";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { getI18n } from "@/lib/i18n";
import { formatDate, formatMoney } from "@/lib/utils";
import { pageMetadata, SITE } from "@/lib/seo";

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
    saved?: string;
    referral?: string;
  }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const { reset, twofa, profile, privacy, hostbio, alerts, saved, referral } = await searchParams;
  // Derived from the user id, so it is the same code every time even before
  // the column has been written.
  const referralCode =
    user.role === "traveller"
      ? await ensureReferralCode(user).catch(() => referralCodeFor(user.id))
      : "";
  // Always show one blank slot so another car can be added without a JS row
  // button; the action drops any row left without a registration.
  const owned = user.vehicles?.length ? user.vehicles : user.vehicle ? [user.vehicle] : [];
  const vehicleRows = [
    ...owned,
    ...Array.from({ length: Math.max(1, 3 - owned.length) }, () => ({
      reg: "",
      make: "",
      model: "",
      colour: "",
      size: "medium" as const,
      ev: false,
    })),
  ].slice(0, 5);

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
        {referral === "claimed" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700" data-referral-claimed>
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {t("account.referral.claimed")}
          </div>
        )}
        {referral === "invalid" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" data-referral-invalid>
            {t("account.referral.invalid")}
          </div>
        )}
        {(profile === "saved" || saved) && (
          <div
            className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700"
            data-saved-banner
          >
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
            <UserRound className="h-4 w-4 text-brand-700" /> {t("account.profile.title")}
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

            <button type="submit" className={buttonVariants({ size: "sm" })}>
              {t("account.profile.save")}
            </button>
          </form>
        </Card>

        {/* Every car on the account — the first is the default at checkout. */}
        {user.role === "traveller" && (
          <Card className="p-5" data-vehicles-card>
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Car className="h-5 w-5 text-navy-500" /> {t("account.vehicle.title")}
            </h2>
            <p className="mb-4 mt-0.5 text-sm text-navy-500">{t("account.vehicle.listSub")}</p>
            <form action={saveVehiclesAction} className="space-y-4">
              {vehicleRows.map((v, i) => (
                <fieldset key={i} className="rounded-2xl border border-navy-100 p-4">
                  <legend className="px-1 text-xs font-bold text-navy-500">
                    {i === 0 ? t("account.vehicle.primary") : `${t("account.vehicle.car")} ${i + 1}`}
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`reg-${i}`}>{t("account.vehicle.reg")}</Label>
                      <Input
                        id={`reg-${i}`}
                        name="vehicleReg"
                        defaultValue={v.reg}
                        placeholder="AB12 CDE"
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`make-${i}`}>{t("account.vehicle.make")}</Label>
                      <Input id={`make-${i}`} name="vehicleMake" defaultValue={v.make} placeholder="Toyota" />
                    </div>
                    <div>
                      <Label htmlFor={`model-${i}`}>{t("account.vehicle.model")}</Label>
                      <Input id={`model-${i}`} name="vehicleModel" defaultValue={v.model} placeholder="Corolla" />
                    </div>
                    <div>
                      <Label htmlFor={`colour-${i}`}>{t("account.vehicle.colour")}</Label>
                      <Input id={`colour-${i}`} name="vehicleColour" defaultValue={v.colour} placeholder="Silver" />
                    </div>
                    <div>
                      <Label htmlFor={`size-${i}`}>{t("account.vehicle.size")}</Label>
                      <select
                        id={`size-${i}`}
                        name="vehicleSize"
                        defaultValue={v.size}
                        className="h-11 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
                      >
                        {(["small", "medium", "large", "van"] as const).map((size) => (
                          <option key={size} value={size}>
                            {t(`vehicle.size.${size}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor={`ev-${i}`}>{t("account.vehicle.ev")}</Label>
                      <select
                        id={`ev-${i}`}
                        name="vehicleEv"
                        defaultValue={v.ev ? "1" : "0"}
                        className="h-11 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
                      >
                        <option value="0">{t("common.no")}</option>
                        <option value="1">{t("common.yes")}</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
              ))}
              <p className="text-xs text-navy-400">{t("account.vehicle.blankHint")}</p>
              <button type="submit" className={buttonVariants({ size: "sm" })}>
                {t("account.profile.save")}
              </button>
            </form>
          </Card>
        )}

        {/* Referrals: a code to share and whatever credit it has earned. */}
        {user.role === "traveller" && (
          <Card className="p-5" data-referral-card>
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Gift className="h-5 w-5 text-navy-500" /> {t("account.referral.title")}
            </h2>
            <p className="mb-4 mt-0.5 text-sm text-navy-500">
              {t("account.referral.sub")
                .replace("{friend}", formatMoney(REFERRAL_FRIEND_CREDIT))
                .replace("{you}", formatMoney(REFERRAL_REFERRER_CREDIT))}
            </p>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-navy-50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-navy-400">{t("account.referral.code")}</p>
                <p className="font-mono text-xl font-bold tracking-widest text-navy-900" data-referral-code>
                  {referralCode}
                </p>
              </div>
              <span className="ms-auto">
                <CopyLinkButton
                  value={`${SITE.url}/login?ref=${referralCode}`}
                  label={t("account.referral.copy")}
                  copiedLabel={t("host.settings.icalCopied")}
                />
              </span>
            </div>

            <p className="mt-3 text-sm text-navy-600">
              {t("account.referral.balance")}{" "}
              <strong className="text-navy-900" data-credit-balance>
                {formatMoney(user.creditPence ?? 0)}
              </strong>
            </p>
            <p className="mt-1 text-xs text-navy-400">{t("account.referral.spendHint")}</p>

            {!user.referredBy && (
              <form action={claimReferralAction} className="mt-4 flex flex-wrap items-end gap-2">
                <div className="min-w-40 flex-1">
                  <Label htmlFor="ref-code">{t("account.referral.haveCode")}</Label>
                  <Input id="ref-code" name="code" placeholder="PGAB23CD" className="uppercase" />
                </div>
                <button type="submit" className={buttonVariants({ size: "sm" })}>
                  {t("account.referral.claim")}
                </button>
              </form>
            )}
            {user.referredBy && (
              <p className="mt-3 text-xs font-semibold text-go-700" data-referral-used>
                {t("account.referral.alreadyUsed")}
              </p>
            )}
          </Card>
        )}

        {/* Expensing a trip: these details land on the VAT receipt. */}
        {user.role === "traveller" && (
          <Card className="p-5" data-business-card>
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Building2 className="h-5 w-5 text-navy-500" /> {t("account.business.title")}
            </h2>
            <p className="mb-4 mt-0.5 text-sm text-navy-500">{t("account.business.sub")}</p>
            <form action={saveBusinessAction} className="space-y-3">
              <div>
                <Label htmlFor="company">{t("account.business.company")}</Label>
                <Input id="company" name="company" defaultValue={user.business?.company ?? ""} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="vatNumber">{t("account.business.vat")}</Label>
                  <Input
                    id="vatNumber"
                    name="vatNumber"
                    defaultValue={user.business?.vatNumber ?? ""}
                    placeholder="GB123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="costCentre">{t("account.business.costCentre")}</Label>
                  <Input
                    id="costCentre"
                    name="costCentre"
                    defaultValue={user.business?.costCentre ?? ""}
                  />
                </div>
              </div>
              <p className="text-xs text-navy-400">{t("account.business.clearHint")}</p>
              <button type="submit" className={buttonVariants({ size: "sm" })}>
                {t("account.profile.save")}
              </button>
            </form>
          </Card>
        )}

        {/* Host guest-facing profile (moved from the host dashboard) */}
        {host && (
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-navy-900">
                <Warehouse className="h-4 w-4 text-brand-700" /> {t("host.section.yourProfile")}
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
                  <ShieldCheck className="h-4 w-4 text-brand-700" /> {t("account.twofa.title")}
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
                  <BellRing className="h-4 w-4 text-brand-700" /> {t("account.alerts.title")}
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
            <LockKeyhole className="h-4 w-4 text-brand-700" /> {t("account.password.title")}
          </h2>
          <p className="mb-4 mt-1 text-sm text-navy-500">{t("account.password.sub")}</p>
          <PasswordForm />
        </Card>

        {/* Privacy & data (UK GDPR) */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy-900">
            <ShieldCheck className="h-4 w-4 text-brand-700" /> {t("account.privacy.title")}
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
