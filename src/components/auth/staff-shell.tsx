import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

/** Shared frame for the staff-only pages (invite accept + team sign-in). */
export function StaffShell({
  title,
  subtitle,
  backLabel,
  children,
}: {
  title: string;
  subtitle: string;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-navy-50/70 to-white">
      <div className="container-px flex h-16 items-center justify-between">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {backLabel}
        </Link>
      </div>

      <div className="container-px flex flex-1 items-start justify-center py-10 sm:items-center">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{title}</h1>
            <p className="mt-2 text-sm text-navy-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      <p className="pb-8 text-center text-xs text-navy-400">
        © {new Date().getFullYear()} PARKGO LIMITED
      </p>
    </div>
  );
}
