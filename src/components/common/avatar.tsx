import { cn, initials } from "@/lib/utils";

/**
 * User avatar: uploaded photo when present, initials-on-colour otherwise.
 * Size and text size come from the className (h-9 w-9 text-sm etc).
 */
export function Avatar({
  name,
  avatarUrl,
  color,
  className,
}: {
  name: string;
  avatarUrl?: string;
  color?: string;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user uploads (data/storage URLs)
      <img
        src={avatarUrl}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        className
      )}
      style={{ backgroundColor: color ?? "#F26A1B" }}
    >
      {initials(name)}
    </span>
  );
}
