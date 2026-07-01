"use client";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/client";

type Tone = "go" | "brand" | "accent" | "navy" | "neutral" | "danger";

const TONE: Record<string, Tone> = {
  // bookings
  requested: "neutral",
  paid: "brand",
  active: "go",
  completed: "navy",
  reviewed: "go",
  cancelled: "danger",
  // transfers
  unassigned: "neutral",
  assigned: "brand",
  en_route: "accent",
  arrived: "brand",
  handover_pending: "accent",
  // verification / spaces
  approved: "go",
  live: "go",
  in_review: "accent",
  pending: "accent",
  pending_review: "accent",
  rejected: "danger",
  draft: "neutral",
  paused: "neutral",
  not_started: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const t = useT();
  const key = `status.${status}`;
  const label = t(key);
  return <Badge tone={TONE[status] ?? "neutral"}>{label === key ? status : label}</Badge>;
}
