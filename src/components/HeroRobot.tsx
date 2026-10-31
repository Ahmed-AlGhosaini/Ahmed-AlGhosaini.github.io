"use client";

// Interactive hero background: a 3D humanoid bust that turns its head to look at the mouse cursor.
// The three.js scene lives in ./robotScene and is loaded on demand, so the ~570 KB of three.js
// doesn't delay the rest of the page from loading and becoming interactive.

import { useEffect, useRef, useState } from "react";

export default function HeroRobot({
  fallback,
  alignTop,
  alignBottom,
}: {
  fallback: React.ReactNode;
  // CSS selectors of the elements whose top / bottom edges the robot's head top / base line up with
  // (wide layout only). The robot is scaled to span exactly that range.
  alignTop?: string;
  alignBottom?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    import("./robotScene")
      .then(({ mountRobot }) => {
        if (cancelled) return;
        cleanup = mountRobot(container, { alignTop, alignBottom, onReady: () => setStatus("ready") });
      })
      // Chunk failed to load, or no WebGL — show the static fallback.
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [alignTop, alignBottom]);

  if (status === "error") return <>{fallback}</>;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 transition-opacity duration-500 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
    />
  );
}
