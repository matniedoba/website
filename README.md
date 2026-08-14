# matniedoba.de

React rebuild of the personal site, deployed to GitHub Pages.

## Local preview

Double-click **`preview.bat`** — it installs dependencies on first run, starts Vite on
<http://localhost:5180/> and opens a browser. (Port 5180 rather than Vite's default 5173,
which often collides with other dev servers. If it is busy too, Vite falls forward to the
next free port and opens that one — always trust the URL it prints.)

Equivalent commands:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output lands in `dist/`. `npm run preview` serves that build locally.

## Deployment

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
It is enabled under **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site is served at the root of **matniedoba.de**, so `vite.config.js` uses `base: '/'`.
To build for the bare project-page URL instead, set `VITE_BASE=/website/`.

The custom domain is configured in **Settings → Pages**, not via a `CNAME` file — when
publishing from a custom Actions workflow, GitHub ignores any `CNAME` file in the repo.

Images are stored in **Git LFS** (`*.png`, `*.jpg`, `*.jpeg`). The deploy workflow checks
out with `lfs: true`; without it the build would silently publish pointer stubs instead of
images. Clone with git-lfs installed, and if images ever appear as ~130-byte files, run
`git lfs checkout`.

Two details make client-side routing work on Pages: `dist/404.html` is written as a copy of
`index.html` (Pages has no rewrite rule, so a direct hit on a subpage would otherwise 404),
and `public/.nojekyll` stops Jekyll from dropping files.

## Adding a gallery

Galleries live at `matniedoba.de/gallery/<name>` and are managed purely by dropping files
into `public/gallery/<name>/`:

```
public/gallery/myGalleryName/
  thumbs/            images shown in the grid  ← required
    01-wide.jpg
    02-portrait.jpg
  01-wide.jpg        optional full-size original; clicking the thumb opens it
  02-portrait.jpg
  photos.zip         optional — any .zip here becomes the download button
  meta.json          optional — { "title": "...", "text": "..." }
```

No code changes and no list to maintain. `vite-plugins/galleries.js` scans the folders at
build time and exposes them to the page as the `virtual:galleries` module — necessary
because GitHub Pages cannot list a directory at runtime. The dev server re-scans and
reloads when you add or remove files.

The URL is matched case-insensitively, so `/gallery/mygalleryname` and
`/gallery/myGalleryName` both work. Without a `meta.json`, the folder name is used as the
title and no intro text is shown.

## Adding a subpage

1. Create a component in `src/pages/`.
2. Register it in `src/App.jsx` inside the `<Route element={<Layout />}>` block.
3. If it belongs in the header, add it to `NAV` in `src/components/Header.jsx`.

## Structure

```
src/
  App.jsx            routes
  main.jsx           entry, router setup
  styles.css         global styles (tokens mirror the original theme)
  usePageTitle.js    per-page <title>
  components/        Layout, Header, Footer
  pages/             About, Projects, NotFound
  assets/            images
```

Content and visual design are reconstructed from the
[2025-12-28 Wayback capture](https://web.archive.org/web/20251228020059/https://matniedoba.de/about/).
