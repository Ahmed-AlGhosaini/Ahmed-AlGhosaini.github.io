"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { profile } from "@/data/profile";
import { HeroFigureToggle } from "./HeroFigure";
import Logo from "./Logo";
import { SocialIcon, SocialLinks } from "./SocialIcons";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "Projects" },
];

function ContactLink({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/#contact"
      onClick={onClick}
      aria-label="Contact"
      title="Contact"
      className="text-muted transition-colors hover:text-foreground"
    >
      <SocialIcon icon="email" />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        Skip to content
      </a>
      <nav className="container-page flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-7">
          <Link href="/" aria-label="Home" onClick={() => setOpen(false)} className="text-foreground">
            <Logo />
          </Link>
          <ul className="hidden items-center gap-7 text-sm md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`transition-colors hover:text-foreground ${
                    isActive(l.href) ? "text-foreground font-medium" : "text-muted"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className="text-base font-semibold tracking-tight" onClick={() => setOpen(false)}>
          {profile.name}
        </Link>

        <div className="hidden items-center justify-end gap-4 md:flex">
          <SocialLinks socials={profile.socials} />
          <ContactLink />
          <HeroFigureToggle />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ContactLink onClick={() => setOpen(false)} />
          <HeroFigureToggle />
          <ThemeToggle />
          <button
            type="button"
            className="-mr-2 p-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-background md:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2 text-lg ${isActive(l.href) ? "font-medium" : "text-muted"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <SocialLinks socials={profile.socials} className="container-page pb-5" />
        </div>
      )}
    </header>
  );
}
