import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAirports } from "@/lib/data/store";
import { getHostForUser } from "@/lib/data/hosts";
import { createSpaceAction } from "@/lib/host-actions";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "List a space", path: "/host/new", noindex: true });

export default async function NewSpacePage() {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const { t } = await getI18n();

  // KYC-first: hosts must be verified before they can list.
  const host = await getHostForUser(user);
  if (!host || host.verificationStatus !== "approved") redirect("/host/verify");

  const airports = getAirports();

  return (
    <PortalShell user={user} nav={hostNav} title="host.new.pageTitle">
      <div className="mx-auto max-w-2xl">
        <Link href="/host" className="text-sm font-semibold text-brand-700">
          ← {t("host.new.back")}
        </Link>
        <Card className="mt-3 p-6">
          <p className="text-sm text-navy-500">
            {t("host.new.intro")}
          </p>
          <form action={createSpaceAction} className="mt-5 space-y-5">
            <div>
              <Label htmlFor="title">{t("host.new.titleLabel")}</Label>
              <Input id="title" name="title" required placeholder={t("host.new.titlePh")} />
            </div>

            <div>
              <Label htmlFor="bio">{t("host.new.bioLabel")}</Label>
              <Textarea id="bio" name="bio" rows={2} placeholder={t("host.new.bioPh")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="airportSlug">{t("search.destination")}</Label>
                <Select id="airportSlug" name="airportSlug" defaultValue="heathrow">
                  <optgroup label={t("search.group.airports")}>
                    {airports
                      .filter((a) => !a.kind || a.kind === "airport")
                      .map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {a.name} ({a.code})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={t("search.group.places")}>
                    {airports
                      .filter((a) => a.kind && a.kind !== "airport")
                      .map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {a.name}
                        </option>
                      ))}
                  </optgroup>
                </Select>
              </div>
              <div>
                <Label htmlFor="pricePerDay">{t("host.new.pricePerDay")}</Label>
                <Input id="pricePerDay" name="pricePerDay" type="number" min="1" step="0.5" defaultValue="10" required />
              </div>
            </div>

            <div>
              <Label htmlFor="pricePerHour">{t("host.new.pricePerHour")}</Label>
              <Input id="pricePerHour" name="pricePerHour" type="number" min="0" step="0.5" placeholder="—" />
              <p className="mt-1 text-xs text-navy-400">{t("host.new.pricePerHourHint")}</p>
            </div>

            <div>
              <Label htmlFor="capacity">{t("host.new.capacity")}</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                max="50"
                defaultValue="1"
                required
                className="max-w-32"
              />
              <p className="mt-1 text-xs text-navy-400">{t("host.new.capacityHint")}</p>
            </div>

            <div>
              <Label htmlFor="approxArea">{t("host.new.publicArea")}</Label>
              <Input id="approxArea" name="approxArea" required placeholder={t("host.new.publicAreaPh")} />
            </div>
            <div>
              <Label htmlFor="exactAddress">{t("host.new.exactAddress")}</Label>
              <Input id="exactAddress" name="exactAddress" required placeholder={t("host.new.exactAddressPh")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="maxVehicleSize">{t("host.new.maxVehicle")}</Label>
                <Select id="maxVehicleSize" name="maxVehicleSize" defaultValue="large">
                  <option value="small">{t("host.new.vehicle.small")}</option>
                  <option value="medium">{t("host.new.vehicle.medium")}</option>
                  <option value="large">{t("host.new.vehicle.large")}</option>
                  <option value="van">{t("host.new.vehicle.van")}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="lengthM">{t("host.new.lengthM")}</Label>
                <Input id="lengthM" name="lengthM" type="number" step="0.1" defaultValue="5.5" />
              </div>
              <div>
                <Label htmlFor="widthM">{t("host.new.widthM")}</Label>
                <Input id="widthM" name="widthM" type="number" step="0.1" defaultValue="2.6" />
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-semibold text-navy-700">{t("host.new.facilities")}</legend>
              {[
                { name: "cctv", label: t("host.new.facility.cctv") },
                { name: "liveCamera", label: t("host.new.facility.liveCamera") },
                { name: "ev", label: t("host.new.facility.ev") },
                { name: "covered", label: t("host.new.facility.covered") },
              ].map((f) => (
                <label key={f.name} className="flex items-center gap-2 text-sm text-navy-700">
                  <input type="checkbox" name={f.name} value="1" className="h-4 w-4 rounded border-navy-300 text-go-500 focus:ring-go-400" />
                  {f.label}
                </label>
              ))}
              <div className="pt-1">
                <Label htmlFor="evKw">{t("host.new.evKw")}</Label>
                <Input id="evKw" name="evKw" type="number" defaultValue="7" className="max-w-32" />
              </div>
            </fieldset>

            <div>
              <Label htmlFor="accessRules">{t("host.new.accessRules")}</Label>
              <Textarea id="accessRules" name="accessRules" rows={3} placeholder={t("host.new.accessRulesPh")} />
            </div>

            <div>
              <Label htmlFor="photos">{t("host.new.photos")}</Label>
              <input
                id="photos"
                name="photos"
                type="file"
                multiple
                accept="image/*"
                className="block w-full cursor-pointer rounded-xl border border-navy-200 bg-white text-sm text-navy-600 file:mr-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-navy-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-navy-700"
              />
              <p className="mt-1 text-xs text-navy-400">{t("host.new.photosHint")}</p>
            </div>

            <div className="rounded-xl bg-navy-50 p-3 text-xs text-navy-500">
              {t("host.new.onboardingNote")}
            </div>

            <Button type="submit" size="lg" className="w-full">
              {t("host.new.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </PortalShell>
  );
}
