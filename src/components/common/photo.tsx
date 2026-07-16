import { cn } from "@/lib/utils";
import { Scene } from "@/components/common/scenes";

/**
 * Listing imagery. Space photos are stored either as real uploaded URLs
 * (Supabase Storage — always shown as-is) or as scene tokens (e.g. "drive-1")
 * that render ParkGo's owned illustration scenes, so demo/keyless listings
 * still look finished without stock photography.
 */
export function Photo({
  token,
  className,
  rounded = "rounded-2xl",
}: {
  token: string;
  className?: string;
  rounded?: string;
}) {
  // Real uploaded photo (Supabase Storage public URL) — render the image.
  if (token.startsWith("http")) {
    return (
      <div className={cn("relative overflow-hidden bg-navy-100", rounded, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={token} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden bg-navy-100", rounded, className)}
      aria-hidden
    >
      <Scene token={token} />
    </div>
  );
}
