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
Enable it once under **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site is served from `https://matniedoba.github.io/website/`, so `vite.config.js`
sets `base` to `/website/` for production builds.

**Using a custom domain** (e.g. `matniedoba.de`): add a `CNAME` file to `public/` with the
domain, and build with `VITE_BASE=/` so assets resolve from the root.

Two details make client-side routing work on Pages: `dist/404.html` is written as a copy of
`index.html` (Pages has no rewrite rule, so a direct hit on a subpage would otherwise 404),
and `public/.nojekyll` stops Jekyll from dropping files.

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
