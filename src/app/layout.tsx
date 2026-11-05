import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import { HeroFigureProvider } from "@/components/HeroFigure";
import Navbar from "@/components/Navbar";
import ThemeScript from "@/components/ThemeScript";
import { profile } from "@/data/profile";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: `${profile.name} — ${profile.title}`,
    template: `%s — ${profile.name}`,
  },
  description: profile.tagline,
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description: profile.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Dark is only the fallback for visitors without JS; ThemeScript picks the saved or OS theme.
    // suppressHydrationWarning: ThemeScript may change data-theme before React hydrates.
    <html lang="en" data-theme="dark" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {/* Shares the hero robot's drawing / 3D choice with its toggle in the navbar. */}
        <HeroFigureProvider>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
        </HeroFigureProvider>
        <Footer />
      </body>
    </html>
  );
}
