import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "brand" | "go" | "accent" | "navy";
}) {
  const toneClass = {
    brand: "bg-brand-50 text-brand-700",
    go: "bg-go-50 text-go-600",
    accent: "bg-accent-50 text-accent-500",
    navy: "bg-navy-50 text-navy-700",
  }[tone];
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-3.5 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold leading-tight text-navy-500 sm:text-sm">
          {label}
        </span>
        <span
          className={cn(
            "hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:flex",
            toneClass
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-1.5 text-xl font-extrabold text-navy-900 sm:mt-2 sm:text-2xl">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-navy-400 sm:text-xs">{sub}</div>}
    </div>
  );
}
