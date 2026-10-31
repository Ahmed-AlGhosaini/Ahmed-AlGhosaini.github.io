"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/data/profile";

// The site is a static export, so messages go through Web3Forms, which forwards them to the inbox
// tied to profile.contactFormKey. The key is meant to be public; the email address never ships.
type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-foreground focus:outline-none";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    if (!profile.contactFormKey) {
      setStatus("error");
      setError("The contact form isn't set up yet. Please reach out on LinkedIn instead.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          access_key: profile.contactFormKey,
          subject: `New message from ${data.name} via your website`,
          from_name: `${profile.name} — website`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong sending your message. Please try again, or reach out on LinkedIn.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="mx-auto mt-8 max-w-xl rounded-xl border border-line bg-background px-6 py-8">
        <p className="font-medium">Thanks, your message is on its way.</p>
        <p className="mt-2 text-sm text-muted">I&apos;ll get back to you as soon as I can.</p>
        <button type="button" onClick={() => setStatus("idle")} className="btn mt-6">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        Name
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
        Message
        <textarea name="message" required rows={5} className={`${field} resize-y`} />
      </label>
      {/* Honeypot: hidden from people, filled in by bots; Web3Forms drops submissions that set it. */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="flex flex-col items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn btn-primary disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
