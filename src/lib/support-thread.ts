import { createHmac } from "crypto";

/**
 * Live support thread access for the widget: after escalation the visitor
 * gets a signed cookie naming their ticket, so the chat keeps working with
 * no account (admins authenticate normally and pass the id instead).
 */
export const SUPPORT_COOKIE = "parkgo_support";
export const SUPPORT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // a week of follow-ups

function secret(): string {
  return (
    process.env.ADMIN_2FA_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "parkgo-demo-secret"
  );
}

function sig(id: string): string {
  return createHmac("sha256", secret()).update(`support.${id}`).digest("hex").slice(0, 24);
}

export function makeSupportToken(ticketId: string): string {
  return `${ticketId}.${sig(ticketId)}`;
}

/** Ticket id for a valid token; null otherwise. */
export function parseSupportToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  return sig(id) === token.slice(dot + 1) ? id : null;
}

/** The short reference shown to users ("SP-1A2B3C"). */
export function supportRef(ticketId: string): string {
  return `SP-${ticketId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`;
}
