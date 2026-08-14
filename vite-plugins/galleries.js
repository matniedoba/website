import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'

const VIRTUAL_ID = 'virtual:galleries'
const RESOLVED_ID = '\0' + VIRTUAL_ID

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'])

const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

/**
 * Scans public/gallery/<slug>/ and returns a map keyed by lowercased slug:
 *
 *   public/gallery/<slug>/thumbs/*.jpg   -> grid images
 *   public/gallery/<slug>/*.jpg          -> optional full-size version of a thumb
 *   public/gallery/<slug>/*.zip          -> optional download bundle
 *   public/gallery/<slug>/meta.json      -> optional { title, text }
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

    galleries[slug.toLowerCase()] = {
      slug,
      title: meta.title ?? slug,
      text: meta.text ?? '',
      zip: zip ? `gallery/${slug}/${zip}` : null,
      photos: thumbs.map((file) => ({
        name: file,
        thumb: `gallery/${slug}/thumbs/${file}`,
        // A file of the same name next to thumbs/ is treated as the full-size original.
        full: entries.includes(file) ? `gallery/${slug}/${file}` : null,
      })),
    }
  }

  return galleries
}

export default function galleries() {
  let galleryRoot

  return {
    name: 'galleries',

    configResolved(config) {
      galleryRoot = resolve(config.root, 'public/gallery')
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },

    load(id) {
      if (id !== RESOLVED_ID) return null
      return `export default ${JSON.stringify(scanGalleries.call(this, galleryRoot))}`
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
