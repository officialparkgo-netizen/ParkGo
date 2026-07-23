import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { ensureHostForUser } from "@/lib/data/hosts";
import {
  hasPendingHostVerification,
  latestVerificationForHost,
} from "@/lib/data/verifications";
import { submitKycAction } from "@/lib/host-actions";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Verification",
  path: "/host/verify",
  noindex: true,
});

export default async function HostVerifyPage() {
  const user = await requireRole("host");
  const { t } = await getI18n();
  const host = await ensureHostForUser(user);

  const verified = host.verificationStatus === "approved";
  const underReview =
    !verified &&
    (host.verificationStatus === "in_review" ||
      host.verificationStatus === "pending" ||
      (await hasPendingHostVerification(host.id)));
  // Rejected? Show the admin's reason so the host knows what to fix.
  const latest =
    !verified && !underReview ? await latestVerificationForHost(host.id) : null;
  const rejectionReason =
    latest?.status === "rejected" && latest.notes ? latest.notes : null;

  return (
    <PortalShell user={user} nav={hostNav} title="host.verify.pageTitle">
      <div className="mx-auto max-w-xl space-y-5">
        <Link href="/host" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        {/* Status at a glance — the checklist reflects the real status */}
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <BadgeCheck
              className={`h-5 w-5 ${verified ? "text-go-600" : "text-navy-300"}`}
            />
            <span className="font-bold text-navy-900">{t("host.verifStatus")}</span>
            <span className="ml-auto">
              <StatusBadge status={host.verificationStatus} />
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              [t("host.verif.id"), verified],
              [t("host.verif.address"), verified],
              [t("host.verif.rightToList"), verified],
              [t("host.verif.bank"), !!host.payoutAccountRef],
            ].map(([label, done]) => (
              <li key={String(label)} className="flex items-center gap-2 text-navy-700">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    done ? "bg-go-100 text-go-700" : "bg-navy-100 text-navy-400"
                  }`}
                >
                  {done ? "✓" : "–"}
                </span>
                {label}
              </li>
            ))}
          </ul>
          {!verified && (
            <p className="mt-3 text-xs text-navy-400">{t("host.verif.why")}</p>
          )}
        </Card>

        {rejectionReason && (
          <Card className="border-red-200 bg-red-50/50 p-4">
            <p className="text-sm font-bold text-red-700">{t("host.verify.rejectedTitle")}</p>
            <p className="mt-1 text-sm text-navy-700">{rejectionReason}</p>
          </Card>
        )}

        {verified ? (
          <Card className="border-go-200 bg-go-50/40 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-go-100 text-go-700">
              <BadgeCheck className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold text-navy-900">
              {t("host.verify.doneTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-navy-600">
              {t("host.verify.doneBody")}
            </p>
          </Card>
        ) : underReview ? (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-500">
              <Clock className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold text-navy-900">{t("host.verify.pendingTitle")}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-navy-600">
              {t("host.verify.pendingBody")}
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-navy-900">{t("host.verify.title")}</h2>
                <p className="text-sm text-navy-600">{t("host.verify.intro")}</p>
              </div>
            </div>

            <form action={submitKycAction} className="mt-6 space-y-5">
              <div>
                <Label htmlFor="legalName">{t("host.verify.legalName")}</Label>
                <Input id="legalName" name="legalName" required defaultValue={user.name} />
              </div>
              <div>
                <Label htmlFor="address">{t("host.verify.address")}</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  placeholder={t("host.verify.addressPh")}
                />
              </div>
              <div>
                <Label htmlFor="idDoc">{t("host.verify.idDoc")}</Label>
                <input
                  id="idDoc"
                  name="idDoc"
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  className="block w-full cursor-pointer rounded-xl border border-navy-200 bg-white text-sm text-navy-600 file:mr-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-navy-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-navy-700"
                />
                <p className="mt-1 text-xs text-navy-400">{t("host.verify.idDocHint")}</p>
              </div>
              <div>
                <Label htmlFor="addressDoc">{t("host.verify.addressDoc")}</Label>
                <input
                  id="addressDoc"
                  name="addressDoc"
                  type="file"
                  accept="image/*,application/pdf"
                  className="block w-full cursor-pointer rounded-xl border border-navy-200 bg-white text-sm text-navy-600 file:mr-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-navy-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-navy-700"
                />
                <p className="mt-1 text-xs text-navy-400">{t("host.verify.addressDocHint")}</p>
              </div>

              <div className="rounded-xl bg-navy-50 p-3 text-xs text-navy-500">
                <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
                {t("host.verify.privacyNote")}
              </div>

              <Button type="submit" size="lg" className="w-full">
                {t("host.verify.submit")}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </PortalShell>
  );
}
