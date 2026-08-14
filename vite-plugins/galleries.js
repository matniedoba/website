import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { extname, join, resolve, sep } from 'node:path'

const VIRTUAL_ID = 'virtual:galleries'
const RESOLVED_ID = '\0' + VIRTUAL_ID

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'])

const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

/**
 * Scans public/photography/<slug>/ and returns a map keyed by lowercased slug:
 *
 *   public/photography/<slug>/thumbs/*.jpg  -> grid images
 *   public/photography/<slug>/*.jpg         -> optional full-size version of a thumb
 *   public/photography/<slug>/*.zip         -> optional download bundle
 *   public/photography/<slug>/meta.json     -> optional { title, text, password }
 *
 * A `password` in meta.json is written in plain text for convenience but is never
 * published: only its SHA-256 hash reaches the bundle, and the copy of meta.json in
 * dist/ has the field stripped. This gates the page, not the image files, which stay
 * directly fetchable — see the README.
 *
 * Paths are emitted without a leading slash; the page prefixes them with
 * import.meta.env.BASE_URL so they survive a change of base path.
 */
function scanGalleries(galleryRoot) {
  if (!existsSync(galleryRoot)) return {}

  const galleries = {}

  for (const slug of readdirSync(galleryRoot).sort(byName)) {
    const dir = join(galleryRoot, slug)
    if (!statSync(dir).isDirectory()) continue

    const entries = readdirSync(dir)
    const thumbsDir = join(dir, 'thumbs')
    const thumbs = existsSync(thumbsDir)
      ? readdirSync(thumbsDir)
          .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
          .sort(byName)
      : []

    let meta = {}
    const metaPath = join(dir, 'meta.json')
    if (existsSync(metaPath)) {
      try {
        meta = JSON.parse(readFileSync(metaPath, 'utf8'))
      } catch (err) {
        this?.warn?.(`Ignoring malformed ${slug}/meta.json: ${err.message}`)
      }
    }

    const zip = entries.find((f) => extname(f).toLowerCase() === '.zip')

    const password = typeof meta.password === 'string' ? meta.password.trim() : ''

    galleries[slug.toLowerCase()] = {
      slug,
      title: meta.title ?? slug,
      text: meta.text ?? '',
      passwordHash: password ? createHash('sha256').update(password).digest('hex') : null,
      zip: zip ? `photography/${slug}/${zip}` : null,
      photos: thumbs.map((file) => ({
        name: file,
        thumb: `photography/${slug}/thumbs/${file}`,
        // A file of the same name next to thumbs/ is treated as the full-size original.
        full: entries.includes(file) ? `photography/${slug}/${file}` : null,
      })),
    }
  }

  return galleries
}

export default function galleries() {
  let galleryRoot
  let outDir

  return {
    name: 'galleries',

    configResolved(config) {
      galleryRoot = resolve(config.root, 'public/photography')
      outDir = resolve(config.root, config.build.outDir)
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },

    load(id) {
      if (id !== RESOLVED_ID) return null
      return `export default ${JSON.stringify(scanGalleries.call(this, galleryRoot))}`
    },

    // Each gallery is also a real directory in the published site. Without an
    // index.html, Pages redirects to add a trailing slash and then answers 404
    // (serving 404.html, so the SPA still renders, but with a 404 status).
    // Dropping a copy of index.html into each folder makes them return 200.
    closeBundle() {
      const indexHtml = join(outDir, 'index.html')
      if (!existsSync(indexHtml)) return

      for (const slug of Object.values(scanGalleries(galleryRoot)).map((g) => g.slug)) {
        const dir = join(outDir, 'photography', slug)
        mkdirSync(dir, { recursive: true })
        copyFileSync(indexHtml, join(dir, 'index.html'))

        // publicDir copies meta.json verbatim, which would publish the plain-text
        // password. Rewrite the copy in dist/ without it.
        const metaOut = join(dir, 'meta.json')
        if (!existsSync(metaOut)) continue
        try {
          const meta = JSON.parse(readFileSync(metaOut, 'utf8'))
          if (!('password' in meta)) continue
          delete meta.password
          writeFileSync(metaOut, JSON.stringify(meta, null, 2) + '\n')
        } catch {
          // Malformed meta.json was already warned about during the scan.
        }
      }
    },

    configureServer(server) {
      server.watcher.add(galleryRoot)

      const refresh = (file) => {
        if (!resolve(file).startsWith(galleryRoot + sep)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (!mod) return
        server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
      server.watcher.on('change', refresh)
    },
  }
}
