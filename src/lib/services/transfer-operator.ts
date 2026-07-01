/**
 * Independent licensed transfer operator — integrated by API only.
 *
 * ParkGo does NOT run drivers or a driver app. The terminal transfer is fulfilled
 * by an external, licensed & insured operator; ParkGo talks to it over an API.
 * This module is that API client. In mock mode it derives live jobs from the
 * local booking data; in live mode swap the bodies for real HTTP calls to the
 * operator (auth, signed webhooks for status/handover), keeping these signatures.
 */
import type { TransferStatus } from "@/types";
import {
  getAllTransfers,
  getBooking,
  getDriver,
  getTransferProvider,
  getVehicle,
} from "@/lib/data/store";

export interface OperatorStatus {
  connected: boolean;
  name: string;
  slaMinutes: number;
  rating: number;
  activeJobs: number;
  handoversConfirmed: number;
}

export interface OperatorJob {
  id: string;
  bookingRef: string;
  status: TransferStatus;
  driverName: string;
  vehicle: string;
  etaMinutes: number | null;
  handoverConfirmed: boolean;
  pickupAt: string;
}

function etaFor(status: TransferStatus, id: string): number | null {
  switch (status) {
    case "arrived":
    case "handover_pending":
      return 0;
    case "en_route": {
      // deterministic 3–12 min from the job id
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      return 3 + (h % 10);
    }
    case "assigned":
      return 15;
    default:
      return null;
  }
}

export function getOperatorStatus(): OperatorStatus {
  const provider = getTransferProvider("tp_swiftlink");
  const jobs = getAllTransfers();
  return {
    connected: true, // in live mode: reflect the API health check
    name: provider?.companyName ?? "Licensed transfer operator",
    slaMinutes: provider?.slaMinutes ?? 15,
    rating: provider?.rating ?? 4.8,
    activeJobs: jobs.filter((j) => j.status !== "completed").length,
    handoversConfirmed: jobs.filter((j) => !!j.handoverConfirmedAt).length,
  };
}

export function getOperatorJob(transferId: string): OperatorJob | undefined {
  return getOperatorJobs().find((j) => j.id === transferId);
}

export function getOperatorJobs(): OperatorJob[] {
  return getAllTransfers()
    .map((t) => {
      const booking = getBooking(t.bookingId);
      const driver = t.driverId ? getDriver(t.driverId) : undefined;
      const vehicle = t.vehicleId ? getVehicle(t.vehicleId) : undefined;
      return {
        id: t.id,
        bookingRef: booking?.reference ?? t.bookingId,
        status: t.status,
        driverName: driver?.name ?? "Assigning…",
        vehicle: vehicle ? `${vehicle.colour} ${vehicle.make} ${vehicle.model} · ${vehicle.reg}` : "—",
        etaMinutes: etaFor(t.status, t.id),
        handoverConfirmed: !!t.handoverConfirmedAt,
        pickupAt: t.pickupAt,
      };
    })
    .sort((a, b) => +new Date(b.pickupAt) - +new Date(a.pickupAt));
}
