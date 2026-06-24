import { Badge } from "@/components/ui/badge";

type Tone = "go" | "brand" | "accent" | "navy" | "neutral" | "danger";

const MAP: Record<string, { tone: Tone; label: string }> = {
  // bookings
  requested: { tone: "neutral", label: "Requested" },
  paid: { tone: "brand", label: "Paid" },
  active: { tone: "go", label: "Active" },
  completed: { tone: "navy", label: "Completed" },
  reviewed: { tone: "go", label: "Reviewed" },
  cancelled: { tone: "danger", label: "Cancelled" },
  // transfers
  unassigned: { tone: "neutral", label: "Unassigned" },
  assigned: { tone: "brand", label: "Assigned" },
  en_route: { tone: "accent", label: "En route" },
  arrived: { tone: "brand", label: "Arrived" },
  handover_pending: { tone: "accent", label: "Handover pending" },
  // verification / spaces
  approved: { tone: "go", label: "Approved" },
  live: { tone: "go", label: "Live" },
  in_review: { tone: "accent", label: "In review" },
  pending: { tone: "accent", label: "Pending" },
  pending_review: { tone: "accent", label: "Pending review" },
  rejected: { tone: "danger", label: "Rejected" },
  draft: { tone: "neutral", label: "Draft" },
  paused: { tone: "neutral", label: "Paused" },
  not_started: { tone: "neutral", label: "Not started" },
};

export function StatusBadge({ status }: { status: string }) {
  const m = MAP[status] ?? { tone: "neutral" as Tone, label: status };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
