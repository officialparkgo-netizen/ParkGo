import "server-only";
import type { SupportTicket } from "@/types";
import { slaState } from "@/lib/support-sla";
import { markTicketEscalated } from "@/lib/data/support";
import { supportRef } from "@/lib/support-thread";

/**
 * Nobody answered in time — tell the people who can do something about it.
 *
 * Runs as a side effect of loading the support queue, which is the only page
 * guaranteed to be looked at often enough to matter, and is cheap because a
 * breach is stamped the first time it fires and never alerts again.
 *
 * Deliberately never throws: a failed alert must not take the queue down.
 */
export async function sweepSlaBreaches(
  tickets: SupportTicket[],
  slaMinutes: number
): Promise<SupportTicket[]> {
  const due = tickets.filter((t) => slaState(t, slaMinutes).needsEscalation);
  if (due.length === 0) return [];

  for (const ticket of due) {
    // Stamp first. If the alert below fails we'd rather lose one notification
    // than re-alert on every page load for the rest of the day.
    await markTicketEscalated(ticket.id).catch(() => {});
  }

  try {
    const { sendOpsAlert } = await import("@/lib/ops-alerts");
    await sendOpsAlert(
      `⏰ ${due.length} support ${due.length === 1 ? "chat has" : "chats have"} missed the reply target: ` +
        due.map((t) => supportRef(t.id)).join(", ")
    );
  } catch {
    // best-effort
  }

  try {
    const { listAdminUsers } = await import("@/lib/data/users");
    // Writers ("content" scope) have no ticket desk — SLA noise skips them.
    const everyone = (await listAdminUsers()).filter((u) => u.adminScope !== "content");
    const admins = everyone.filter((u) => u.adminScope !== "support");

    // Push reaches the on-call agent whose console tab is closed — the exact
    // person a missed reply target is about.
    const { pushToUsers } = await import("@/lib/push");
    await pushToUsers(everyone.map((u) => u.id), {
      title: `Support SLA missed · ${due.length}`,
      body: due.map((t) => supportRef(t.id)).join(", "),
      url: "/admin/support?show=urgent",
      tag: "parkgo-sla",
      urgent: true,
    });
    const body = due
      .map((t) => `${supportRef(t.id)} · ${t.name || t.email}`)
      .join("\n");

    const { notifyUsers } = await import("@/lib/data/notifications");
    await notifyUsers(
      admins.map((a) => a.id),
      {
        title: `Support SLA missed · ${due.length}`,
        body: `No reply yet on:\n${body}`,
        // "support" rather than "system": on /notifications this kind is a
        // link straight to the ticket desk.
        kind: "support",
      }
    );
  } catch {
    // best-effort
  }

  return due;
}
