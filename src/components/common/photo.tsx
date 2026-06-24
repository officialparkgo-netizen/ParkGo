import { Car, Home, ShieldCheck, Warehouse, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * On-brand placeholder imagery. Space photos are stored as tokens (e.g. "drive-1")
 * rather than URLs so the app has polished, deterministic visuals offline and
 * keyless. Swap for next/image + a CDN/Supabase Storage when real photos exist.
 */
const GRADIENTS = [
  "from-navy-700 to-brand-500",
  "from-brand-600 to-go-500",
  "from-navy-800 to-navy-500",
  "from-go-600 to-brand-500",
  "from-brand-700 to-navy-600",
];

function iconFor(token: string) {
  if (token.startsWith("ev")) return Zap;
  if (token.startsWith("yard")) return Warehouse;
  if (token.startsWith("compound")) return ShieldCheck;
  if (token.startsWith("carport")) return Car;
  return Home;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Photo({
  token,
  className,
  rounded = "rounded-2xl",
}: {
  token: string;
  className?: string;
  rounded?: string;
}) {
  const Icon = iconFor(token);
  const gradient = GRADIENTS[hash(token) % GRADIENTS.length];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        rounded,
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-grid opacity-30" />
      <Icon className="relative h-1/4 w-1/4 max-h-16 max-w-16 text-white/85" strokeWidth={1.5} />
    </div>
  );
}
