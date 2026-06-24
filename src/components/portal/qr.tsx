import QRCode from "qrcode";
import { cn } from "@/lib/utils";

/**
 * Server-rendered QR access code. Encodes the booking's signed access token
 * (reference|spaceId|travellerId in mock mode). Generated to a data URL at
 * render time — no client JS, works offline.
 */
export async function QrCode({
  value,
  size = 200,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const dataUrl = await QRCode.toDataURL(value, {
    width: size,
    margin: 1,
    color: { dark: "#0E2A47", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Booking QR access code"
      width={size}
      height={size}
      className={cn("rounded-xl", className)}
    />
  );
}
