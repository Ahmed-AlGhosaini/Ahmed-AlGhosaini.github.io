import Link from "next/link";
import { linkedin, profile } from "@/data/profile";
import { HeroFigure } from "./HeroFigure";
import Media from "./Media";

export default function Hero() {
  const heroMedia = (
    <Media src={profile.heroMedia} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
  );

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background: the robot (or static media) behind the intro text. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-stone-50 via-background to-indigo-50 dark:from-stone-950 dark:to-indigo-950/40">
        {/* Faded on smaller screens, where the robot sits directly behind the text. */}
        <div className="absolute inset-0 opacity-30 lg:opacity-100">
          {profile.heroInteractive ? (
            <HeroFigure fallback={heroMedia} alignTop="#hero-photo" alignBottom="#hero-actions" />
          ) : (
            heroMedia
          )}
        </div>
        {/* Soft veil behind the text so it stays readable where the robot overlaps it. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_42rem_32rem_at_50%_55%,var(--background)_35%,transparent_75%)] opacity-80" />
        {/* Line drawing hovering left of the heading, its front foot just above the "I" (wide screens only).
            Blending drops its white background in light mode; in dark mode it's inverted to white lines and
            the black drops out. An MP4 rather than the original GIF: ~95 KB instead of ~580 KB. */}
        <video
          src="/ingenuity.mp4"
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-[calc(50%-47.25rem)] top-13 hidden aspect-[768/460] w-[32rem] mix-blend-multiply lg:block dark:mix-blend-screen dark:invert"
        />
        {/* Patent-style robot arm drawing below the helicopter, kept clear of the text column: it shrinks
            with the side gutter and is hidden once the gutter gets too narrow. Same blending as above. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer */}
        <img
          src="/robot-arm.svg"
          alt=""
          aria-hidden="true"
          // Lazy: browsers then skip the download entirely on screens where it's hidden.
          loading="lazy"
          className="absolute right-[calc(50%+25rem)] top-[22rem] hidden w-[min(22rem,calc(50%-26rem))] mix-blend-multiply xl:block dark:mix-blend-screen dark:invert"
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="container-page">
        <div className="fade-up mx-auto max-w-3xl py-16 text-center sm:py-24" style={{ animationDelay: "120ms" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer */}
          <img
            id="hero-photo"
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            className="mx-auto mb-8 h-32 w-32 rounded-full border border-line bg-surface object-cover shadow-sm ring-4 ring-background sm:h-40 sm:w-40"
          />
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            I&apos;m {profile.name}, a&nbsp;<span className="text-accent">{profile.title}</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{profile.bio}</p>
          <div id="hero-actions" className="mt-10 flex flex-wrap justify-center gap-3">
            <a href={linkedin.href} target="_blank" rel="noopener noreferrer" className="btn">
              LinkedIn
            </a>
            <Link href="/projects" className="btn">
              Projects
            </Link>
            <Link href="/resume" className="btn">
              Resume
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
