import Link from "next/link";
import { Bell, LogOut, Menu } from "lucide-react";
import type { User } from "@/types";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { logout } from "@/lib/auth-actions";
import { getLocale } from "@/lib/i18n";
import { unreadCount } from "@/lib/data/store";
import { initials } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_LABEL: Record<User["role"], string> = {
  traveller: "Traveller",
  host: "Host",
  transfer: "Transfer Partner",
  admin: "Admin",
};

export async function PortalShell({
  user,
  nav,
  title,
  children,
}: {
  user: User;
  nav: NavItem[];
  title: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const unread = unreadCount(user.id);

  return (
    <div className="flex min-h-screen bg-navy-50/40">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-navy-100 bg-white lg:flex">
        <div className="px-5 py-4">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              <item.icon className="h-5 w-5 text-navy-400" />
              {item.label}
            </Link>
          ))}
        </nav>
        <UserCard user={user} />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-navy-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile nav */}
            <details className="relative lg:hidden">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50 [&::-webkit-details-marker]:hidden">
                <Menu className="h-5 w-5" />
              </summary>
              <div className="absolute left-0 mt-2 w-60 rounded-2xl border border-navy-100 bg-white p-2 shadow-card-lg">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50"
                  >
                    <item.icon className="h-4 w-4 text-navy-400" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
            <h1 className="truncate text-lg font-bold text-navy-900">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher current={locale} className="hidden sm:inline-flex" />
            <Link
              href={`${nav[0]?.href ?? "#"}`}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 hover:bg-navy-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Badge tone="navy" className="hidden sm:inline-flex">
              {ROLE_LABEL[user.role]}
            </Badge>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function UserCard({ user }: { user: User }) {
  return (
    <div className="border-t border-navy-100 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: user.avatarColor ?? "#1B6CB3" }}
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-navy-900">{user.name}</div>
          <div className="truncate text-xs text-navy-400">{user.email}</div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
