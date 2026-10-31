import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { type DatedItem, resume } from "@/data/resume";

export const metadata: Metadata = { title: "Resume" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-12 md:grid-cols-[12rem_1fr]">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function DatedList({ items }: { items: DatedItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.title} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <p>
            <span className="font-semibold">{item.title}</span>
            <span className="text-muted">, {item.issuer}</span>
          </p>
          <p className="shrink-0 text-sm text-muted">{item.date}</p>
        </li>
      ))}
    </ul>
  );
}

export default function ResumePage() {
  return (
    <div className="container-page pt-16 sm:pt-24">
      <header className="fade-up flex flex-col gap-6 pb-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Resume.</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{resume.intro}</p>
        </div>
        <a href={profile.cv} download className="btn btn-primary shrink-0">
          Download PDF ↓
        </a>
      </header>

      <Section title="Experience">
        <ol className="space-y-10">
          {resume.experience.map((job) => (
            <li key={`${job.company}-${job.period}`}>
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                <h3 className="text-lg font-semibold">{job.company}</h3>
                <p className="shrink-0 text-sm text-muted">{job.period}</p>
              </div>
              <p className="text-foreground/80">{job.role}</p>
              <p className="text-sm text-muted">{job.location}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-muted marker:text-line">
                {job.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Education">
        <ul className="space-y-6">
          {resume.education.map((ed) => (
            <li key={`${ed.school}-${ed.period}`}>
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                <h3 className="text-lg font-semibold">{ed.degree}</h3>
                <p className="shrink-0 text-sm text-muted">{ed.period}</p>
              </div>
              <p className="text-muted">
                {ed.school} · {ed.location}
              </p>
              {ed.points && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-muted marker:text-line">
                  {ed.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Skills">
        <dl className="grid gap-5 sm:grid-cols-2">
          {Object.entries(resume.skills).map(([group, items]) => (
            <div key={group}>
              <dt className="font-semibold">{group}</dt>
              <dd className="mt-1 text-muted">{items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Languages">
        <p className="text-muted">{resume.languages.join(" · ")}</p>
      </Section>

      {resume.publications.length > 0 && (
        <Section title="Publications">
          <ul className="space-y-5">
            {resume.publications.map((pub) => (
              <li key={pub.title}>
                {pub.href ? (
                  <a href={pub.href} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">
                    {pub.title} ↗
                  </a>
                ) : (
                  <p className="font-semibold">{pub.title}</p>
                )}
                <p className="text-sm text-muted">{pub.authors}</p>
                <p className="text-sm italic text-muted">{pub.venue}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Awards">
        <DatedList items={resume.awards} />
      </Section>

      <Section title="Certifications">
        <DatedList items={resume.certifications} />
      </Section>

      <Section title="Interests">
        <p className="text-muted">{resume.interests.join(" · ")}</p>
      </Section>
    </div>
  );
}
