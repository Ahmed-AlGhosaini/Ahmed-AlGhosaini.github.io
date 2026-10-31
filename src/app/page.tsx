import Link from "next/link";
import ContactSection from "@/components/ContactSection";
import Hero from "@/components/Hero";
import { ProjectRow } from "@/components/ProjectCard";
import { featuredProjects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <Hero />

      <section className="container-page">
        <div className="mb-14 flex flex-col items-center gap-2 text-center">
          <p className="text-muted">Scroll down to see my current work</p>
          <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </div>

        <div className="flex flex-col gap-20 sm:gap-28">
          {featuredProjects.map((p, i) => (
            <ProjectRow key={p.slug} project={p} flip={i % 2 === 1} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link href="/projects" className="btn">
            View all projects →
          </Link>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
