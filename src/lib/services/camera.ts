/**
 * Live camera (IP/RTSP -> HLS/WebRTC) behind a swappable provider.
 *
 * Mock mode returns a token the <CameraView/> component renders as an animated
 * simulated feed (no hardware, no keys). Live mode returns a short-lived signed
 * HLS/WebRTC URL for the space's camera; access is gated to the paying traveller,
 * the owning host and admins (see RLS in supabase/migrations).
 */
import type { CameraStream } from "@/types";

export type CameraProvider = "mock" | "hls" | "webrtc";

export function cameraProvider(): CameraProvider {
  return (process.env.CAMERA_PROVIDER as CameraProvider) || "mock";
}

export interface ResolvedStream {
  id: string;
  label: string;
  protocol: "hls" | "webrtc";
  url: string;
  live: boolean;
  /** Mock streams are rendered by the UI rather than fetched. */
  isMock: boolean;
}

export function resolveStream(stream: CameraStream): ResolvedStream {
  const isMock = cameraProvider() === "mock" || stream.url.startsWith("mock://");
  return {
    id: stream.id,
    label: stream.label,
    protocol: stream.protocol,
    url: stream.url,
    live: stream.live,
    isMock,
  };
}
