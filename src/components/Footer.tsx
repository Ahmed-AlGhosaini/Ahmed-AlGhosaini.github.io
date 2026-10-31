import { profile } from "@/data/profile";
import { SocialLinks } from "./SocialIcons";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page flex flex-col items-start justify-between gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <SocialLinks socials={[...profile.socials, { label: "Contact", href: "/#contact", icon: "email" }]} />
      </div>
    </footer>
  );
}
