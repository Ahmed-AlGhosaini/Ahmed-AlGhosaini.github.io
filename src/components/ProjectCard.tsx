import Link from "next/link";
import type { Project } from "@/data/projects";
import Media from "./Media";

export function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t} className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

// Grid card used on /projects.
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group flex flex-col">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <Media
          src={project.cover}
          alt={project.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug group-hover:text-accent">{project.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{project.summary}</p>
    </Link>
  );
}

// Wide alternating row used on the home page, like the reference site's stacked list.
export function ProjectRow({ project, flip }: { project: Project; flip?: boolean }) {
  return (
    <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <Link
        href={`/projects/${project.slug}`}
        className={`group overflow-hidden rounded-xl border border-line bg-surface ${flip ? "md:order-2" : ""}`}
      >
        <Media
          src={project.cover}
          alt={project.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div>
        <p className="text-sm text-muted">{project.date}</p>
        <h3 className="mt-2 text-2xl font-semibold leading-snug tracking-tight">{project.title}</h3>
        <p className="mt-4 leading-relaxed text-muted">{project.summary}</p>
        <div className="mt-5">
          <Tags tags={project.tags} />
        </div>
        <Link href={`/projects/${project.slug}`} className="mt-6 inline-block font-medium text-accent hover:underline">
          Learn More →
        </Link>
      </div>
    </article>
  );
}
