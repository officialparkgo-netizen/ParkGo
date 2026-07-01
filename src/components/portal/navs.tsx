import {
  BadgeCheck,
  Banknote,
  CalendarCheck,
  LayoutGrid,
  LifeBuoy,
  Radio,
  ScrollText,
  Search,
  Ticket,
  Warehouse,
} from "lucide-react";
import type { NavItem } from "@/components/portal/shell";

// `label` values are i18n keys resolved by the shell via t().
export const travellerNav: NavItem[] = [
  { href: "/app", label: "nav.dashboard", icon: LayoutGrid },
  { href: "/app/search", label: "nav.findParking", icon: Search },
  { href: "/app#trips", label: "nav.myTrips", icon: Ticket },
  { href: "/faq", label: "nav.help", icon: LifeBuoy },
];

export const hostNav: NavItem[] = [
  { href: "/host", label: "nav.dashboard", icon: LayoutGrid },
  { href: "/host#listings", label: "nav.listings", icon: Warehouse },
  { href: "/host#bookings", label: "nav.bookings", icon: CalendarCheck },
  { href: "/host#earnings", label: "nav.earnings", icon: Banknote },
  { href: "/host#verification", label: "nav.verification", icon: BadgeCheck },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "nav.dashboard", icon: LayoutGrid },
  { href: "/admin#verification", label: "nav.hostVerification", icon: BadgeCheck },
  { href: "/admin#operator", label: "nav.operator", icon: Radio },
  { href: "/admin#listings", label: "nav.listingsUsers", icon: Warehouse },
  { href: "/admin#payments", label: "nav.payments", icon: Banknote },
  { href: "/admin#audit", label: "nav.audit", icon: ScrollText },
];
