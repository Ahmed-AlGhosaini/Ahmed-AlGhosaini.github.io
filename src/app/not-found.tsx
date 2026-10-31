import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex flex-col items-center py-32 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">This page wandered off the map.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Back home
      </Link>
    </section>
  );
}
