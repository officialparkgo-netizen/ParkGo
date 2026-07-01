"use client";

import { createContext, useContext } from "react";

type Dict = Record<string, string>;

const I18nContext = createContext<Dict>({});

/** Provides the current locale's merged dictionary to client components. */
export function I18nProvider({
  dict,
  children,
}: {
  dict: Dict;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={dict}>{children}</I18nContext.Provider>;
}

/** Client-side translator: t(key) with English fallback (key returned if absent). */
export function useT() {
  const dict = useContext(I18nContext);
  return (key: string) => dict[key] ?? key;
}
