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

export const travellerNav: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutGrid },
  { href: "/app/search", label: "Find parking", icon: Search },
  { href: "/app#trips", label: "My trips", icon: Ticket },
  { href: "/faq", label: "Help", icon: LifeBuoy },
];

export const hostNav: NavItem[] = [
  { href: "/host", label: "Dashboard", icon: LayoutGrid },
  { href: "/host#listings", label: "Listings", icon: Warehouse },
  { href: "/host#bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/host#earnings", label: "Earnings", icon: Banknote },
  { href: "/host#verification", label: "Verification", icon: BadgeCheck },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin#verification", label: "Host verification", icon: BadgeCheck },
  { href: "/admin#operator", label: "Transfer operator", icon: Radio },
  { href: "/admin#listings", label: "Listings & users", icon: Warehouse },
  { href: "/admin#payments", label: "Payments", icon: Banknote },
  { href: "/admin#audit", label: "Audit log", icon: ScrollText },
];
