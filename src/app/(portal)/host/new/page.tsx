import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAirports } from "@/lib/data/store";
import { createSpaceAction } from "@/lib/host-actions";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "List a space", path: "/host/new", noindex: true });

export default async function NewSpacePage() {
  const user = await requireRole("host");
  const airports = getAirports();

  return (
    <PortalShell user={user} nav={hostNav} title="List a new space">
      <div className="mx-auto max-w-2xl">
        <Link href="/host" className="text-sm font-semibold text-brand-600">
          ← Back to dashboard
        </Link>
        <Card className="mt-3 p-6">
          <p className="text-sm text-navy-500">
            Add your space details. Once submitted it enters compliance review and
            goes live after approval.
          </p>
          <form action={createSpaceAction} className="mt-5 space-y-5">
            <div>
              <Label htmlFor="title">Listing title</Label>
              <Input id="title" name="title" required placeholder="Secure driveway · 5 min to terminal" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="airportSlug">Airport</Label>
                <Select id="airportSlug" name="airportSlug" defaultValue="heathrow">
                  {airports.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="pricePerDay">Price per day (£)</Label>
                <Input id="pricePerDay" name="pricePerDay" type="number" min="1" step="0.5" defaultValue="10" required />
              </div>
            </div>

            <div>
              <Label htmlFor="approxArea">Public area (shown before booking)</Label>
              <Input id="approxArea" name="approxArea" required placeholder="Longford, near T5" />
            </div>
            <div>
              <Label htmlFor="exactAddress">Exact address (released after payment)</Label>
              <Input id="exactAddress" name="exactAddress" required placeholder="14 Bath Road, Longford UB7 0EX" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="maxVehicleSize">Max vehicle</Label>
                <Select id="maxVehicleSize" name="maxVehicleSize" defaultValue="large">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="van">Van</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="lengthM">Length (m)</Label>
                <Input id="lengthM" name="lengthM" type="number" step="0.1" defaultValue="5.5" />
              </div>
              <div>
                <Label htmlFor="widthM">Width (m)</Label>
                <Input id="widthM" name="widthM" type="number" step="0.1" defaultValue="2.6" />
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-semibold text-navy-700">Facilities</legend>
              {[
                { name: "cctv", label: "CCTV monitored" },
                { name: "liveCamera", label: "In-app live camera" },
                { name: "ev", label: "EV charger on site" },
              ].map((f) => (
                <label key={f.name} className="flex items-center gap-2 text-sm text-navy-700">
                  <input type="checkbox" name={f.name} value="1" className="h-4 w-4 rounded border-navy-300 text-go-500 focus:ring-go-400" />
                  {f.label}
                </label>
              ))}
              <div className="pt-1">
                <Label htmlFor="evKw">EV charger power (kW)</Label>
                <Input id="evKw" name="evKw" type="number" defaultValue="7" className="max-w-32" />
              </div>
            </fieldset>

            <div>
              <Label htmlFor="accessRules">Access rules</Label>
              <Textarea id="accessRules" name="accessRules" rows={3} placeholder="Park on the marked bay. Keep your keys." />
            </div>

            <div className="rounded-xl bg-navy-50 p-3 text-xs text-navy-500">
              Photo upload, ID &amp; address verification and the right-to-list
              declaration are handled in the full onboarding (mocked here).
            </div>

            <Button type="submit" size="lg" className="w-full">
              Submit for review
            </Button>
          </form>
        </Card>
      </div>
    </PortalShell>
  );
}
