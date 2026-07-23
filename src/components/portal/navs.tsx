import {
  BadgeCheck,
  Banknote,
  CalendarCheck,
  CalendarClock,
  Headset,
  LayoutGrid,
  LifeBuoy,
  Megaphone,
  Radio,
  ScrollText,
  Search,
  Settings,
  ShieldAlert,
  Star,
  Tag,
  Ticket,
  Users,
  Warehouse,
} from "lucide-react";
import type { NavItem } from "@/components/portal/shell";

// `label` values are i18n keys resolved by the shell via t().
export const travellerNav: NavItem[] = [
  { href: "/app", label: "nav.dashboard", icon: LayoutGrid },
  { href: "/app/search", label: "nav.findParking", icon: Search },
  { href: "/app/trips", label: "nav.myTrips", icon: Ticket },
  { href: "/faq", label: "nav.help", icon: LifeBuoy },
];

export const hostNav: NavItem[] = [
  { href: "/host", label: "nav.dashboard", icon: LayoutGrid },
  { href: "/host#listings", label: "nav.listings", icon: Warehouse },
  { href: "/host#bookings", label: "nav.bookings", icon: CalendarCheck },
  { href: "/host/payouts", label: "nav.earnings", icon: Banknote },
  { href: "/host/verify", label: "nav.verification", icon: BadgeCheck },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "nav.dashboard", icon: LayoutGrid },
  { href: "/admin/today", label: "admin.today.title", icon: CalendarClock },
  { href: "/admin/verification", label: "nav.hostVerification", icon: BadgeCheck },
  { href: "/admin/operator", label: "nav.operator", icon: Radio },
  { href: "/admin/listings", label: "nav.listings", icon: Warehouse },
  { href: "/admin/bookings", label: "nav.bookings", icon: CalendarCheck },
  { href: "/admin/users", label: "nav.users", icon: Users },
  { href: "/admin/payments", label: "nav.payments", icon: Banknote },
  { href: "/admin/reviews", label: "admin.reviews.title", icon: Star },
  { href: "/admin/promos", label: "admin.promos.title", icon: Tag },
  { href: "/admin/claims", label: "admin.claims.title", icon: ShieldAlert },
  { href: "/admin/support", label: "admin.support.title", icon: Headset },
  { href: "/admin/broadcast", label: "admin.broadcast.title", icon: Megaphone },
  { href: "/admin/audit", label: "nav.audit", icon: ScrollText },
  { href: "/admin/settings", label: "admin.settings.title", icon: Settings },
];
