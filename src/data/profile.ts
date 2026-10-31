// Edit this file to change your personal details across the whole site.

export type Social = {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "scholar" | "x" | "email";
};

export const profile = {
  name: "Ahmed Al-Ghosaini",
  title: "Physical AI Engineer",
  // Short line shown in the browser tab / search results.
  tagline: "Robot learning, Vision-Language-Action and foundation models: building robots that learn to act in the real world.",
  bio: "I'm a computer scientist (M.Sc., Leibniz University Hannover) focused on robot learning. For my master's thesis I fine-tuned a Vision-Language-Action foundation model for language-conditioned humanoid navigation and took it all the way from teleoperated data collection to deployment on the real robot. I've also worked on tactile robot learning at L3S, generative models for genomic super-resolution, the RoboCup@Work team, and applied AI with LLMs and RAG at PwC.",
  location: "Hannover, Germany",
  // Contact form key from https://web3forms.com: enter the email that should receive messages and
  // paste the access key it sends you here. The email itself is never shown or shipped with the site.
  contactFormKey: "eda171d7-628c-4272-bf08-2d47d574e01d",
  siteUrl: "https://your-domain.com",
  // true = interactive 3D humanoid behind the intro that looks at the cursor; false = show heroMedia there instead.
  // heroMedia is also the fallback if the visitor's browser can't run WebGL.
  heroInteractive: true,
  // Put your own image, GIF or video in /public and point to it here.
  // Supported: .svg / .png / .jpg / .gif / .webp (image) or .mp4 / .webm (video).
  heroMedia: "/hero.svg",
  heroMediaAlt: "Animated robot arm",
  // Your portrait, shown on the home page. Put e.g. me.jpg in /public and set "/me.jpg".
  // A square photo works best (it is cropped to a circle).
  photo: "/me.jpg",
  cv: "/cv.pdf",
  // Add Google Scholar / X here too (icons: "scholar", "x").
  socials: [
    { label: "GitHub", href: "https://github.com/Ahmed-AlGhosaini", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmed-alghosaini", icon: "linkedin" },
  ] satisfies Social[],
};

export const linkedin = profile.socials.find((s) => s.icon === "linkedin")!;
