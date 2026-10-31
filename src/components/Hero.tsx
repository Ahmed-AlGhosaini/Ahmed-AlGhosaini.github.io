import Link from "next/link";
import { linkedin, profile } from "@/data/profile";
import HeroRobot from "./HeroRobot";
import Media from "./Media";

export default function Hero() {
  const heroMedia = (
    <Media src={profile.heroMedia} alt={profile.heroMediaAlt} className="aspect-[16/8] w-full object-cover" />
  );

  return (
    <section className="container-page pt-10 sm:pt-14">
      <div className="fade-up overflow-hidden rounded-2xl border border-line bg-surface">
        {profile.heroInteractive ? (
          <HeroRobot fallback={heroMedia} />
        ) : (
          heroMedia
        )}
      </div>

      <div className="fade-up mx-auto max-w-3xl py-16 text-center sm:py-24" style={{ animationDelay: "120ms" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer */}
        <img
          src={profile.photo}
          alt={`Portrait of ${profile.name}`}
          className="mx-auto mb-8 h-32 w-32 rounded-full border border-line bg-surface object-cover shadow-sm ring-4 ring-background sm:h-40 sm:w-40"
        />
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          I&apos;m {profile.name}, a <span className="text-accent">{profile.title}</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">{profile.bio}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={linkedin.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
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
    </section>
  );
}
