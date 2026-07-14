import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import type { User } from "@/types";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { MobileNav } from "@/components/common/mobile-nav";
import { logout } from "@/lib/auth-actions";
import { getI18n } from "@/lib/i18n";
import { unreadCount } from "@/lib/data/store";
import { initials } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

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
  const { t, locale } = await getI18n();
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
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <UserCard user={user} signOut={t("portal.signOut")} />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-navy-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile nav (accessible slide-in drawer) */}
            <MobileNav
              items={nav.map((i) => ({
                href: i.href,
                label: t(i.label),
                icon: <i.icon className="h-5 w-5 shrink-0" />,
              }))}
              label={t("nav.menu")}
              closeLabel={t("nav.closeMenu")}
              footer={
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" /> {t("portal.signOut")}
                  </button>
                </form>
              }
            />
            <h1 className="truncate text-lg font-bold text-navy-900">{t(title)}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher current={locale} className="hidden sm:inline-flex" />
            <Link
              href={`${nav[0]?.href ?? "#"}`}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 hover:bg-navy-50"
              aria-label={t("portal.notifications")}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Badge tone="navy" className="hidden sm:inline-flex">
              {t(`role.${user.role}`)}
            </Badge>
          </div>
        </header>

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function UserCard({ user, signOut }: { user: User; signOut: string }) {
  return (
    <div className="border-t border-navy-100 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: user.avatarColor ?? "#F26A1B" }}
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
            aria-label={signOut}
            title={signOut}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
