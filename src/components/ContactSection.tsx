import { profile } from "@/data/profile";
import ContactForm from "./ContactForm";
import { SocialLinks } from "./SocialIcons";

export default function ContactSection() {
  return (
    <section id="contact" className="container-page scroll-mt-24 pt-24">
      <div className="rounded-2xl border border-line bg-surface px-6 py-14 text-center sm:px-12">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Let&apos;s build something.</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          I&apos;m open to collaborations, research discussions and new opportunities in robotics and physical AI.
          Based in {profile.location}.
        </p>
        <ContactForm />
        <SocialLinks socials={profile.socials} className="mt-8 justify-center" />
      </div>
    </section>
  );
}
