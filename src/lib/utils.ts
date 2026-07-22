import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Pence } from "@/types";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format minor units as currency, e.g. 4900 -> "£49.00". */
export function formatMoney(pence: Pence, currency: "GBP" | "EUR" = "GBP") {
  const symbol = currency === "GBP" ? "£" : "€";
  return `${symbol}${(pence / 100).toFixed(2)}`;
}

/** Format minor units without trailing zeros, e.g. 4900 -> "£49". */
export function formatMoneyShort(pence: Pence, currency: "GBP" | "EUR" = "GBP") {
  const symbol = currency === "GBP" ? "£" : "€";
  const value = pence / 100;
  return `${symbol}${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

export function formatDate(iso: string, locale = "en-GB") {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string, locale = "en-GB") {
  return new Date(iso).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysBetween(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function hoursBetween(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
}

/**
 * Object path inside a Supabase public-bucket URL
 * (…/storage/v1/object/public/<bucket>/<path>), or null when the URL isn't
 * from that bucket — callers use this to refuse deleting foreign URLs.
 */
export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Deterministic id generator (avoids Math.random for reproducible mock data). */
let _seq = 1;
export function nextId(prefix = "id"): string {
  return `${prefix}_${(_seq++).toString(36).padStart(6, "0")}`;
}

/** Short human-friendly reference, deterministic from a seed string. */
export function shortRef(seed: string, prefix = "PG"): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += chars[h % chars.length];
    h = Math.floor(h / chars.length) + 7;
  }
  return `${prefix}-${out}`;
}

/** Deterministic fixed-length alphanumeric code (e.g. handover codes). */
export function accessCode(seed: string, len = 6): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[h % chars.length];
    h = Math.floor(h / chars.length) + 13;
  }
  return out;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
