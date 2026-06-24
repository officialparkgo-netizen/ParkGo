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
    brand: "bg-brand-50 text-brand-600",
    go: "bg-go-50 text-go-600",
    accent: "bg-accent-50 text-accent-500",
    navy: "bg-navy-50 text-navy-700",
  }[tone];
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-navy-500">{label}</span>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", toneClass)}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-navy-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-navy-400">{sub}</div>}
    </div>
  );
}
