import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Media from "@/components/Media";
import { Tags } from "@/components/ProjectCard";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const links = Object.entries(project.links ?? {}).filter(([, href]) => href);
  const linkLabels: Record<string, string> = { github: "Code", paper: "Paper", video: "Video" };

  return (
    <article className="container-page pt-12 sm:pt-16">
      <Link href="/projects" className="text-sm text-muted hover:text-foreground">
        ← All projects
      </Link>

      <header className="fade-up mt-6 max-w-3xl">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{project.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{project.summary}</p>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="mt-1 font-medium">{project.role}</dd>
          </div>
          <div>
            <dt className="text-muted">Year</dt>
            <dd className="mt-1 font-medium">{project.date}</dd>
          </div>
          {links.length > 0 && (
            <div>
              <dt className="text-muted">Links</dt>
              <dd className="mt-1 flex gap-4 font-medium">
                {links.map(([key, href]) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {linkLabels[key] ?? key} ↗
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-6">
          <Tags tags={project.tags} />
        </div>
      </header>

      <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface">
        <Media src={project.cover} alt={project.title} className="aspect-[16/9] w-full object-cover" />
      </div>

      <div className="mx-auto mt-16 max-w-3xl space-y-14">
        {project.body.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-muted">
                {p}
              </p>
            ))}
            {section.image && (
              <figure className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
                <Media src={section.image.src} alt={section.image.alt} className="w-full" />
              </figure>
            )}
          </section>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-3xl border-t border-line pt-8">
        <Link href="/projects" className="font-medium text-accent hover:underline">
          ← All projects
        </Link>
      </div>
    </article>
  );
}
