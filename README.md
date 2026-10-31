# Personal website — Physical AI Engineer

Portfolio site (Home, Resume, Projects, per-project pages, Contact) built with Next.js 16, React 19 and Tailwind CSS 4, exported as a fully static site.

## Edit your content

Everything lives in `src/data/`. You never need to touch components to update content.

| File | What it controls |
| --- | --- |
| `src/data/profile.ts` | Name, title, bio, email, location, social links, hero image/video |
| `src/data/projects.ts` | Project cards and detail pages (`featured: true` → shown on Home) |
| `src/data/resume.ts` | Experience, education, skills, publications, awards |

### Images, GIFs and videos

Put files in `public/` and reference them by path, e.g. `/projects/my-robot.mp4`.
Anything ending in `.mp4`/`.webm` is rendered as an autoplaying, muted, looping video; everything else as an image.

- `public/hero.svg` — the animated placeholder hero; replace with your robot demo
- `public/projects/*.svg` — placeholder project covers
- `public/cv.pdf` — your CV (the "Download PDF" button links to it; keep the filename lowercase)
- `src/app/favicon.ico` — browser tab icon

Colors and fonts are set at the top of `src/app/globals.css` (`--accent` is the highlight color).

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build & deploy

```bash
npm run build    # writes the static site to out/
```

- **Vercel** (easiest): push to GitHub, then "Import Project" on vercel.com. No settings needed.
- **Netlify**: build command `npm run build`, publish directory `out`.
- **GitHub Pages**: upload the `out/` folder (if served from `username.github.io/repo`, set `basePath: "/repo"` in `next.config.ts`).

Remember to set `siteUrl` in `src/data/profile.ts` to your real domain.
