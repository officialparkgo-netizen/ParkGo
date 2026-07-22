import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PhotoManager } from "@/components/host/photo-manager";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAirports } from "@/lib/data/store";
import { getHostForUser, getSpaceById } from "@/lib/data/hosts";
import { updateSpaceAction } from "@/lib/host-actions";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Edit listing",
  path: "/host/spaces",
  noindex: true,
});

export default async function EditSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("host");
  const { t } = await getI18n();
  const { id } = await params;

  const host = await getHostForUser(user);
  if (!host) redirect("/host/verify");

  const space = await getSpaceById(id);
  if (!space || space.hostId !== host.id) notFound();

  const airports = getAirports();

  return (
    <PortalShell user={user} nav={hostNav} title="host.edit.pageTitle">
      <div className="mx-auto max-w-2xl">
        <Link href="/host" className="text-sm font-semibold text-brand-600">
          ← {t("host.new.back")}
        </Link>
        <Card className="mt-3 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-navy-900">{space.title}</h2>
              <p className="text-sm text-navy-500">{t("host.edit.intro")}</p>
            </div>
            <StatusBadge status={space.status} />
          </div>

          <form action={updateSpaceAction} className="mt-5 space-y-5">
            <input type="hidden" name="spaceId" value={space.id} />

            <div>
              <Label>{t("host.edit.currentPhotos")}</Label>
              <PhotoManager
                photos={space.photos}
                removeLabel={t("host.edit.removePhoto")}
                keepLabel={t("host.edit.keepPhoto")}
              />
              <p className="mt-1 text-xs text-navy-400">{t("host.edit.removeHint")}</p>
            </div>

            <div>
              <Label htmlFor="title">{t("host.new.titleLabel")}</Label>
              <Input id="title" name="title" required defaultValue={space.title} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="airportSlug">{t("host.new.airport")}</Label>
                <Select id="airportSlug" name="airportSlug" defaultValue={space.airportSlug} disabled>
                  {airports.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="pricePerDay">{t("host.new.pricePerDay")}</Label>
                <Input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  min="1"
                  step="0.5"
                  defaultValue={(space.pricePerDay / 100).toString()}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pricePerHour">{t("host.new.pricePerHour")}</Label>
              <Input
                id="pricePerHour"
                name="pricePerHour"
                type="number"
                min="0"
                step="0.5"
                placeholder="—"
                defaultValue={space.pricePerHour ? (space.pricePerHour / 100).toString() : ""}
              />
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
                defaultValue={(space.capacity ?? 1).toString()}
                required
                className="max-w-32"
              />
              <p className="mt-1 text-xs text-navy-400">{t("host.new.capacityHint")}</p>
            </div>

            <div>
              <Label htmlFor="approxArea">{t("host.new.publicArea")}</Label>
              <Input id="approxArea" name="approxArea" required defaultValue={space.approxArea} />
            </div>
            <div>
              <Label htmlFor="exactAddress">{t("host.new.exactAddress")}</Label>
              <Input id="exactAddress" name="exactAddress" required defaultValue={space.exactAddress} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="maxVehicleSize">{t("host.new.maxVehicle")}</Label>
                <Select id="maxVehicleSize" name="maxVehicleSize" defaultValue={space.maxVehicleSize}>
                  <option value="small">{t("host.new.vehicle.small")}</option>
                  <option value="medium">{t("host.new.vehicle.medium")}</option>
                  <option value="large">{t("host.new.vehicle.large")}</option>
                  <option value="van">{t("host.new.vehicle.van")}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="lengthM">{t("host.new.lengthM")}</Label>
                <Input
                  id="lengthM"
                  name="lengthM"
                  type="number"
                  step="0.1"
                  defaultValue={space.dimensions.lengthM.toString()}
                />
              </div>
              <div>
                <Label htmlFor="widthM">{t("host.new.widthM")}</Label>
                <Input
                  id="widthM"
                  name="widthM"
                  type="number"
                  step="0.1"
                  defaultValue={space.dimensions.widthM.toString()}
                />
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-semibold text-navy-700">
                {t("host.new.facilities")}
              </legend>
              {[
                { name: "cctv", label: t("host.new.facility.cctv"), checked: space.cctv },
                { name: "liveCamera", label: t("host.new.facility.liveCamera"), checked: space.liveCamera },
                { name: "ev", label: t("host.new.facility.ev"), checked: !!space.evCharger },
                { name: "covered", label: t("host.new.facility.covered"), checked: !!space.covered },
              ].map((f) => (
                <label key={f.name} className="flex items-center gap-2 text-sm text-navy-700">
                  <input
                    type="checkbox"
                    name={f.name}
                    value="1"
                    defaultChecked={f.checked}
                    className="h-4 w-4 rounded border-navy-300 text-go-500 focus:ring-go-400"
                  />
                  {f.label}
                </label>
              ))}
              <div className="pt-1">
                <Label htmlFor="evKw">{t("host.new.evKw")}</Label>
                <Input
                  id="evKw"
                  name="evKw"
                  type="number"
                  defaultValue={(space.evCharger?.kw ?? 7).toString()}
                  className="max-w-32"
                />
              </div>
            </fieldset>

            <div>
              <Label htmlFor="accessRules">{t("host.new.accessRules")}</Label>
              <Textarea
                id="accessRules"
                name="accessRules"
                rows={3}
                defaultValue={space.accessRules}
              />
            </div>

            <div>
              <Label htmlFor="photos">{t("host.edit.addPhotos")}</Label>
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

            {space.status === "rejected" && (
              <div className="rounded-xl bg-accent-50 p-3 text-xs font-medium text-accent-500">
                {t("host.edit.resubmitNote")}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              {t("host.edit.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </PortalShell>
  );
}
