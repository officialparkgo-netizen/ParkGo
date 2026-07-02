"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import type { Locale } from "@/types";
import { LOCALES } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  current,
  className,
}: {
  current: Locale;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const currentIndex = Math.max(
    0,
    LOCALES.findIndex((l) => l.code === current)
  );
  const currentMeta = LOCALES[currentIndex];

  // Which option is visually highlighted for keyboard navigation.
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (i: number) => `${baseId}-option-${i}`;

  function openMenu(index = currentIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function closeMenu(focusTrigger = false) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function selectLocale(next: Locale) {
    closeMenu(true);
    if (next === current) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  // Move DOM focus into the listbox when it opens.
  useEffect(() => {
    if (open) listboxRef.current?.focus();
  }, [open]);

  // Close on outside click; cleaned up when the menu closes/unmounts.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${baseId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, baseId]);

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        openMenu(currentIndex);
        break;
      case "ArrowUp":
        e.preventDefault();
        openMenu(LOCALES.length - 1);
        break;
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % LOCALES.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + LOCALES.length) % LOCALES.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(LOCALES.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        selectLocale(LOCALES[activeIndex].code);
        break;
      case "Escape":
        e.preventDefault();
        closeMenu(true);
        break;
      case "Tab":
        // Let focus leave naturally, but dismiss the menu.
        setOpen(false);
        break;
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("relative inline-block text-left", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        onClick={() => (open ? setOpen(false) : openMenu(currentIndex))}
        onKeyDown={onTriggerKeyDown}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={`Language: ${currentMeta.nativeLabel}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          pending && "cursor-not-allowed opacity-60"
        )}
      >
        <Globe className="h-4 w-4 text-navy-500" aria-hidden />
        <span aria-hidden>{currentMeta.flag}</span>
        <span dir={currentMeta.dir}>{currentMeta.nativeLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-navy-400 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={triggerId}
          aria-activedescendant={optionId(activeIndex)}
          onKeyDown={onListKeyDown}
          className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] origin-top-right animate-scale-in rounded-xl border border-navy-100 bg-white p-1.5 shadow-card-lg focus:outline-none"
        >
          {LOCALES.map((l, i) => {
            const selected = l.code === current;
            const active = i === activeIndex;
            return (
              <li
                key={l.code}
                id={optionId(i)}
                role="option"
                aria-selected={selected}
                onClick={() => selectLocale(l.code)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  active ? "bg-navy-50" : "hover:bg-navy-50",
                  selected ? "font-semibold text-brand-700" : "text-navy-700"
                )}
              >
                <span className="text-base leading-none" aria-hidden>
                  {l.flag}
                </span>
                <span className="flex-1" dir={l.dir}>
                  {l.nativeLabel}
                </span>
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
