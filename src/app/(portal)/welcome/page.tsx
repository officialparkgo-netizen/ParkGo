import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, Car, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { buttonVariants } from "@/components/ui/button";
import { AvatarPicker } from "@/components/common/avatar-picker";
import { getCurrentUser, rolePath } from "@/lib/auth";
import { completeOnboardingAction } from "@/lib/user-actions";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Welcome",
  path: "/welcome",
  noindex: true,
});

/** First-run profile setup. Non-onboarded users are gated here by the guards. */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ invalid?: string }>;
}) {
  const { invalid } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Already set up (or pre-migration row) — nothing to do here.
  if (user.onboarded !== false || user.role === "admin") redirect(rolePath(user.role));

  const { t } = await getI18n();
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-navy-50/70 to-white px-4 py-10">
      <Logo />
      <Card className="mt-6 w-full max-w-lg p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-navy-900">
              {t("welcome.title")} {firstName}! 👋
            </h1>
            <p className="mt-1 text-sm text-navy-500">{t("welcome.sub")}</p>
          </div>
        </div>

        {invalid && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {t("account.profile.invalid")}
          </p>
        )}

        <form action={completeOnboardingAction} className="mt-6 space-y-4">
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
              <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} placeholder="+44 7…" />
            </div>
          </div>

          {user.role === "traveller" && (
            <div className="rounded-2xl border border-navy-100 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
                <Car className="h-4 w-4 text-brand-700" /> {t("account.vehicle.title")}
              </h3>
              <p className="mb-3 mt-0.5 text-xs text-navy-500">{t("account.vehicle.sub")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="vehicleReg">{t("account.vehicle.reg")}</Label>
                  <Input id="vehicleReg" name="vehicleReg" defaultValue={user.vehicle?.reg ?? ""} placeholder="AB12 CDE" className="uppercase" />
                </div>
                <div>
                  <Label htmlFor="vehicleMake">{t("account.vehicle.make")}</Label>
                  <Input id="vehicleMake" name="vehicleMake" defaultValue={user.vehicle?.make ?? ""} placeholder="Toyota" />
                </div>
                <div>
                  <Label htmlFor="vehicleModel">{t("account.vehicle.model")}</Label>
                  <Input id="vehicleModel" name="vehicleModel" defaultValue={user.vehicle?.model ?? ""} placeholder="Corolla" />
                </div>
                <div>
                  <Label htmlFor="vehicleColour">{t("account.vehicle.colour")}</Label>
                  <Input id="vehicleColour" name="vehicleColour" defaultValue={user.vehicle?.colour ?? ""} placeholder="Silver" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className={buttonVariants({ size: "lg", className: "w-full" })}>
            {t("welcome.continue")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </button>
          <p className="text-center text-xs text-navy-400">{t("welcome.note")}</p>
        </form>
      </Card>
    </div>
  );
}
