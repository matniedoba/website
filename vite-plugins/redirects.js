import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Turns redirects.json ({ "some-path": "https://target" }) into static redirect
 * pages at dist/<some-path>/index.html.
 *
 * GitHub Pages cannot issue a real 301, so each page uses a meta refresh with a
 * script fallback and a visible link. Serving a real file means Pages answers 200
 * directly instead of falling through 404.html and booting the SPA first.
 */

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const normalisePath = (path) => path.replace(/^\/+|\/+$/g, '')

function redirectPage(target) {
  const attr = escapeHtml(target)
  const js = JSON.stringify(target).replace(/</g, '\\u003c')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta http-equiv="refresh" content="0; url=${attr}" />
    <link rel="canonical" href="${attr}" />
    <script>
      location.replace(${js})
    </script>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 16px;
        color: #333;
      }
      a {
        color: #33a3a3;
      }
    </style>
  </head>
  <body>
    <p>Redirecting to <a href="${attr}">the shared folder</a>…</p>
  </body>
</html>
`
}

function loadRedirects(configPath, warn) {
  if (!existsSync(configPath)) return {}

  let raw
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf8'))
  } catch (err) {
    warn?.(`Ignoring malformed redirects.json: ${err.message}`)
    return {}
  }

  const redirects = {}
  for (const [from, to] of Object.entries(raw)) {
    const path = normalisePath(from)
    if (!path) {
      warn?.('Skipping redirect with an empty path')
      continue
    }
    if (typeof to !== 'string' || !/^https?:\/\//i.test(to)) {
      warn?.(`Skipping redirect "${from}": target must be an absolute http(s) URL`)
      continue
    }
    redirects[path] = to
  }
  return redirects
}

export default function redirects() {
  let configPath
  let outDir

  return {
    name: 'redirects',

    configResolved(config) {
      configPath = resolve(config.root, 'redirects.json')
      outDir = resolve(config.root, config.build.outDir)
    },

    closeBundle() {
      for (const [path, target] of Object.entries(loadRedirects(configPath, this.warn.bind(this)))) {
        const dir = join(outDir, path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), redirectPage(target))
      }
    },

    // Mirror the behaviour in dev so the paths are testable locally.
    configureServer(server) {
      server.watcher.add(configPath)

      server.middlewares.use((req, res, next) => {
        const path = normalisePath((req.url ?? '').split('?')[0])
        const target = loadRedirects(configPath)[path]
        if (!target) return next()
        res.writeHead(302, { Location: target })
        res.end()
      })
    },
  }
}
