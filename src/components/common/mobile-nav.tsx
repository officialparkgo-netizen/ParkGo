"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  href: string;
  label: string;
  /** Pre-rendered icon element (server components can't pass a component fn to a client component). */
  icon?: React.ReactNode;
}

export function MobileNav({
  items,
  footer,
  label,
  closeLabel = label,
}: {
  items: MobileNavItem[];
  footer?: React.ReactNode;
  label: string;
  /** Accessible name for the close/backdrop controls (falls back to `label`). */
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Portalling to <body> requires the DOM; only enable after mount (SSR-safe).
  useEffect(() => setMounted(true), []);

  // Body scroll lock + focus management + Esc + focus trap
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the panel.
    const panel = panelRef.current;
    const focusables = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];
    focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !panel?.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Restore focus to the trigger when the drawer closes.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label={closeLabel}
            tabIndex={-1}
            onClick={close}
            className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-navy-900/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="animate-slide-in-right absolute right-0 top-0 flex h-full w-full max-w-[20rem] flex-col overflow-y-auto border-l border-navy-100 bg-white shadow-card-lg"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-navy-100 px-4">
              <Logo />
              <button
                type="button"
                onClick={close}
                aria-label={closeLabel}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-3">
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                      active
                        ? "bg-go-50 text-go-700 ring-1 ring-inset ring-go-200"
                        : "text-navy-700 hover:bg-navy-50 hover:text-navy-900"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      className="h-4 w-4 text-navy-400 rtl:-scale-x-100"
                      aria-hidden
                    />
                  </Link>
                );
              })}
            </nav>

            {footer && (
              <div
                className="mt-auto border-t border-navy-100 p-3"
                onClick={(e) => {
                  // Close when a link inside the footer is activated, but leave
                  // interactive controls (e.g. the language <select>) alone.
                  if ((e.target as HTMLElement).closest("a")) close();
                }}
              >
                {footer}
              </div>
            )}
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export function StickyHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 6);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        className,
        "transition-shadow",
        scrolled && "border-navy-100 shadow-card"
      )}
    >
      {children}
    </header>
  );
}
