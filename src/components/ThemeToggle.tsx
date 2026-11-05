"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// The theme lives on <html data-theme> (set by ThemeScript), so read it from there.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

// Falls back to dark, like the static HTML, in case ThemeScript didn't run, so the button never stays blank.
const getTheme = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ?? "dark";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  // null on the server and during hydration, so the markup matches before the real theme is known.
  const theme = useSyncExternalStore<Theme | null>(subscribe, getTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked — the choice just won't persist.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme ? `Switch to ${next} mode` : "Toggle color theme"}
      title={theme ? `Switch to ${next} mode` : undefined}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:border-foreground hover:bg-surface ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-[18px] w-[18px] transition-opacity ${theme ? "opacity-100" : "opacity-0"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {theme === "dark" ? (
          // Sun: shown in dark mode, switches to light.
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          // Moon: shown in light mode, switches to dark.
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  );
}
