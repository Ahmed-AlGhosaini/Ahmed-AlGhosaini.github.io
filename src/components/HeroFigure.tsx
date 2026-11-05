"use client";

// The robot behind the hero text: a static line drawing of a humanoid mid-kick by default, with a navbar
// button to swap in the interactive 3D robot. three.js is only downloaded once the 3D view is opened.
// The figure lives in the home page and the button in the navbar, so they share the mode through
// context: HeroFigureProvider wraps the whole layout.

import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { profile } from "@/data/profile";
import HeroRobot from "./HeroRobot";

type Mode = "drawing" | "3d";

const ModeContext = createContext<{ mode: Mode; setMode: (mode: Mode) => void }>({
  mode: "drawing",
  setMode: () => {},
});

export function HeroFigureProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("drawing");
  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

export function HeroFigure({
  fallback,
  alignTop,
  alignBottom,
  alignTopOffset,
  alignBottomLine,
}: {
  // Shown if the 3D view can't run (no WebGL).
  fallback: React.ReactNode;
  // CSS selectors of the elements the 3D robot's top and base line up with (wide layout only), plus
  // optionally how far below alignTop the head starts (CSS px) and the line of alignBottom's text the
  // base stops at.
  alignTop?: string;
  alignBottom?: string;
  alignTopOffset?: number;
  alignBottomLine?: number;
}) {
  const { mode } = useContext(ModeContext);
  if (mode === "3d")
    return (
      <HeroRobot
        fallback={fallback}
        alignTop={alignTop}
        alignBottom={alignBottom}
        alignTopOffset={alignTopOffset}
        alignBottomLine={alignBottomLine}
      />
    );

  // The drawing's box spans the hero's vertical padding, i.e. from the portrait's top to the buttons'
  // bottom. The PNG is cropped to the robot plus a 4px margin (of 962px), so it's scaled up slightly and
  // shifted to put the robot itself in the box. On extra-wide screens it's centred in the right-hand
  // gutter; on narrower ones it sits behind the text like the 3D robot, faded (the parent already fades
  // it below lg). Black lines on transparent, inverted to white in dark mode.
  return (
    <div aria-hidden="true" className="absolute inset-x-0 inset-y-16 sm:inset-y-24">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer */}
      <img
        src="/robot-drawing.png"
        alt=""
        className="absolute left-1/2 top-[10%] h-[65%] w-auto max-w-none -translate-x-1/2 lg:max-xl:opacity-30 xl:left-[calc(75%+0rem)] dark:invert"
      />
    </div>
  );
}

// Navbar button: only on the home page, where the hero is.
export function HeroFigureToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useContext(ModeContext);
  const pathname = usePathname();
  if (!profile.heroInteractive || pathname !== "/") return null;

  const next: Mode = mode === "drawing" ? "3d" : "drawing";
  const label = next === "3d" ? "View the robot in 3D" : "View the robot drawing";

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:border-foreground hover:bg-surface ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {next === "3d" ? (
          // Cube: switches to the 3D view.
          <path d="M12 2.5 3.5 7v10l8.5 4.5 8.5-4.5V7zM3.5 7 12 11.5 20.5 7M12 11.5v10" />
        ) : (
          // Ruler: switches back to the line drawing.
          <path d="M3 16.5 16.5 3 21 7.5 7.5 21zM7 12.5l2 2M10 9.5l2 2M13 6.5l2 2" />
        )}
      </svg>
    </button>
  );
}
