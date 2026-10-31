import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <section className="container-page pt-16 sm:pt-24">
      <h1 className="fade-up text-4xl font-semibold tracking-tight sm:text-5xl">Projects.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        A selection of things I&apos;ve built across robot learning, perception and control.
      </p>
      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
