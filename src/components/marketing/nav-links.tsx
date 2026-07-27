"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavLinkItem {
  href: string;
  label: string;
}

/**
 * Desktop navigation with a current-page marker.
 *
 * The mobile drawer has told you where you are for a while; the desktop bar
 * did not, so on a wide screen every link looked identical no matter which
 * page you were reading. Same matching rule as the drawer — exact match, or a
 * child route beneath it — so the two never disagree.
 *
 * `aria-current="page"` is the part that matters beyond the styling: it is how
 * a screen reader announces the current page, and no amount of colour conveys
 * that on its own.
 */
export function NavLinks({ items }: { items: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {items.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-2 text-sm transition-colors",
              // The underline is a child rather than `link-underline` so the
              // active state can hold it open while hover still animates it.
              "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-go-500 after:transition-all",
              active
                ? "font-semibold text-navy-900 after:opacity-100"
                : "font-medium text-navy-700 after:opacity-0 hover:bg-navy-50 hover:text-navy-900 hover:after:opacity-100"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
