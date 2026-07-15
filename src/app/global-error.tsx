"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Root error boundary: reports fatal client-side errors to Sentry (when
 * configured) and shows a branded recovery page instead of a blank screen.
 * Must render its own <html>/<body> because it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
          background: "#F6F7F8",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#15171A" }}>
            Park<span style={{ color: "#F26A1B" }}>Go</span>
          </div>
          <h1 style={{ fontSize: 20, color: "#15171A", margin: "18px 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#5B616B", fontSize: 14, margin: "0 0 20px" }}>
            Sorry — an unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#F26A1B",
              color: "#fff",
              border: 0,
              padding: "12px 22px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
