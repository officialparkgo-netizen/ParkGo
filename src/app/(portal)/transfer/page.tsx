import type { Metadata } from "next";
import {
  AlertTriangle,
  Banknote,
  Car,
  ClipboardList,
  FileCheck,
  Star,
  Timer,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { StatCard } from "@/components/portal/stat-card";
import { HandoverPanel } from "@/components/portal/handover-panel";
import { transferNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import {
  getBooking,
  getDriver,
  getDriversByProvider,
  getJobsForProvider,
  getTransferProviderByUser,
  getVehicle,
  getVehiclesByProvider,
} from "@/lib/data/store";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Transfer dashboard", path: "/transfer", noindex: true });

export default async function TransferDashboard() {
  const user = await requireRole("transfer");
  const provider = getTransferProviderByUser(user.id)!;
  const drivers = getDriversByProvider(provider.id);
  const vehicles = getVehiclesByProvider(provider.id);
  const jobs = getJobsForProvider(provider.id);

  const activeJobs = jobs.filter((j) => j.status !== "completed");
  const earnings = jobs.reduce(
    (s, j) => s + (getBooking(j.bookingId)?.price.split.driverPayout ?? 0),
    0
  );
  const insuranceSoon = vehicles.filter(
    (v) => new Date(v.insuranceExpiry).getTime() - Date.now() < 60 * 86_400_000
  );

  return (
    <PortalShell user={user} nav={transferNav} title="Transfer dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900">{provider.companyName}</h2>
          <p className="text-navy-500">
            Operator licence {provider.operatorLicenceNo} · {provider.slaMinutes}-min pickup SLA
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active jobs" value={String(activeJobs.length)} sub={`${jobs.length} total`} icon={ClipboardList} tone="brand" />
          <StatCard label="Drivers" value={String(drivers.length)} sub={`${vehicles.length} vehicles`} icon={Users} tone="navy" />
          <StatCard label="Earnings" value={formatMoney(earnings)} sub="after commission" icon={Banknote} tone="go" />
          <StatCard label="Rating" value={`${provider.rating.toFixed(1)}★`} sub={`SLA ${provider.slaMinutes} min`} icon={Star} tone="accent" />
        </div>

        {/* Jobs */}
        <section id="jobs" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">Jobs</h3>
          <div className="space-y-4">
            {jobs.length === 0 && (
              <Card className="p-6 text-center text-navy-500">No jobs assigned yet.</Card>
            )}
            {jobs.map((job) => {
              const booking = getBooking(job.bookingId);
              const driver = job.driverId ? getDriver(job.driverId) : undefined;
              const vehicle = job.vehicleId ? getVehicle(job.vehicleId) : undefined;
              const showHandover = job.status !== "completed" && job.status !== "unassigned";
              return (
                <Card key={job.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-navy-900">
                          {booking?.reference ?? job.bookingId}
                        </span>
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
                        <Timer className="h-3.5 w-3.5" /> Pickup {formatDateTime(job.pickupAt)}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-navy-600">
                        <Car className="h-3.5 w-3.5" />
                        {driver ? driver.name : "Unassigned"}
                        {vehicle ? ` · ${vehicle.colour} ${vehicle.make} ${vehicle.model} (${vehicle.reg})` : ""}
                      </div>
                    </div>
                    {booking && (
                      <span className="font-bold text-navy-900">
                        +{formatMoney(booking.price.split.driverPayout, booking.price.currency)}
                      </span>
                    )}
                  </div>

                  {job.status === "unassigned" && (
                    <div className="mt-3 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
                      Awaiting driver assignment.
                    </div>
                  )}

                  {showHandover && (
                    <div className="mt-4">
                      <HandoverPanel
                        transferId={job.id}
                        bookingId={job.bookingId}
                        expectedCode={job.handoverCode}
                        initialConfirmedAt={job.handoverConfirmedAt}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Drivers & vehicles */}
          <section id="drivers" className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">Drivers &amp; vehicles</h3>
            <Card className="divide-y divide-navy-100">
              {drivers.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold text-navy-900">{d.name}</div>
                    <div className="text-xs text-navy-400">Badge {d.badgeNo}</div>
                  </div>
                  <StatusBadge status={d.verificationStatus} />
                </div>
              ))}
              {vehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold text-navy-900">
                      {v.colour} {v.make} {v.model}
                    </div>
                    <div className="text-xs text-navy-400">{v.reg} · {v.seats} seats</div>
                  </div>
                  <Badge tone="neutral">Ins. to {formatDate(v.insuranceExpiry)}</Badge>
                </div>
              ))}
            </Card>
          </section>

          {/* Documents / compliance */}
          <section id="docs" className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">Documents &amp; compliance</h3>
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-go-600" />
                <span className="font-bold text-navy-900">Operator status</span>
                <span className="ml-auto">
                  <StatusBadge status={provider.verificationStatus} />
                </span>
              </div>
              {provider.reverifyDueAt && (
                <p className="mt-3 text-sm text-navy-600">
                  Periodic re-verification due {formatDate(provider.reverifyDueAt)}.
                </p>
              )}
              {insuranceSoon.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {insuranceSoon.length} vehicle insurance{insuranceSoon.length > 1 ? "s" : ""}{" "}
                    expiring within 60 days — upload renewal to stay live.
                  </span>
                </div>
              )}
              <ul className="mt-4 space-y-2 text-sm text-navy-700">
                {["Operator licence", "Commercial passenger insurance", "Driver PHV badges", "SLA agreement"].map((doc) => (
                  <li key={doc} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-go-100 text-[10px] font-bold text-go-700">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>

        {/* Earnings */}
        <section id="earnings" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">Earnings</h3>
          <Card className="divide-y divide-navy-100">
            {jobs.map((job) => {
              const booking = getBooking(job.bookingId);
              if (!booking) return null;
              return (
                <div key={job.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-mono text-sm font-bold text-navy-900">{booking.reference}</div>
                    <div className="text-xs text-navy-400">{formatDate(job.pickupAt)}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={job.status} />
                    <span className="font-bold text-navy-900">
                      {formatMoney(booking.price.split.driverPayout, booking.price.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
