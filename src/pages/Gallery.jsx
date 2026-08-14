import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import galleries from 'virtual:galleries'
import usePageTitle from '../usePageTitle.js'

const BASE = import.meta.env.BASE_URL

// Square images would otherwise have nothing to zoom into on hover.
const MIN_ZOOM = 1.08

// Falls back to the thumbnail when no full-size original sits next to thumbs/.
const fullSrc = (photo) => BASE + (photo.full ?? photo.thumb)

const unlockKey = (slug) => `photography-unlocked:${slug}`

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function Gallery() {
  const { galleryName = '' } = useParams()
  const gallery = galleries[galleryName.toLowerCase()]
  const [active, setActive] = useState(null)

  // Locked until proven otherwise, so photos never render behind the prompt.
  const [unlocked, setUnlocked] = useState(() => {
    if (!gallery?.passwordHash) return true
    return sessionStorage.getItem(unlockKey(gallery.slug)) === gallery.passwordHash
  })

  usePageTitle(gallery ? gallery.title : 'Gallery not found')

  if (!gallery) {
    return (
      <div className="container">
        <div className="text-block">
          <h1>Gallery not found</h1>
          <p>
            There is no gallery called &ldquo;{galleryName}&rdquo;.{' '}
            <Link to="/">Back to the start</Link>.
          </p>
        </div>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <PasswordPrompt
        gallery={gallery}
        onUnlock={() => {
          sessionStorage.setItem(unlockKey(gallery.slug), gallery.passwordHash)
          setUnlocked(true)
        }}
      />
    )
  }

  return (
    <div className="container gallery-page">
      <div className="gallery-intro">
        <h1>{gallery.title}</h1>
        {gallery.text && <p>{gallery.text}</p>}
        {gallery.zip && (
          <a className="download-button" href={BASE + gallery.zip} download>
            Download all photos
          </a>
        )}
      </div>

      {gallery.photos.length > 0 ? (
        <div className="photo-grid">
          {gallery.photos.map((photo) => (
            <Thumb key={photo.name} photo={photo} onOpen={() => setActive(photo)} />
          ))}
        </div>
      ) : (
        <p className="gallery-empty">
          No photos yet — drop images into <code>public/photography/{gallery.slug}/thumbs/</code>.
        </p>
      )}

      {active && <Lightbox photo={active} onClose={() => setActive(null)} />}
    </div>
  )
}

function PasswordPrompt({ gallery, onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (checking) return
    setChecking(true)
    const matches = (await sha256Hex(value)) === gallery.passwordHash
    setChecking(false)
    if (matches) {
      onUnlock()
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="password-overlay">
      <form className="password-dialog" onSubmit={submit}>
        <h2>{gallery.title}</h2>
        <p>This gallery is password protected.</p>
        <input
          type="password"
          autoFocus
          value={value}
          placeholder="Password"
          aria-label="Password"
          aria-invalid={error}
          onChange={(event) => {
            setValue(event.target.value)
            setError(false)
          }}
        />
        {error && (
          <p className="password-error" role="alert">
            That password is not right.
          </p>
        )}
        <button className="download-button" type="submit" disabled={!value || checking}>
          {checking ? 'Checking…' : 'View gallery'}
        </button>
      </form>
    </div>
  )
}

function Thumb({ photo, onOpen }) {
  // object-fit can't be transitioned, so the tile stays "contain" and we scale
  // by exactly the factor that turns contain into cover: the image's long side
  // divided by its short side. That makes the hover a smooth crop-to-fill.
  const setZoom = (event) => {
    const { naturalWidth: w, naturalHeight: h } = event.currentTarget
    if (!w || !h) return
    const zoom = Math.max(w, h) / Math.min(w, h)
    event.currentTarget.style.setProperty('--zoom', String(Math.max(zoom, MIN_ZOOM)))
  }

  // Kept as a real link so ctrl/middle-click still opens the file directly.
  return (
    <figure className="photo-tile">
      <a
        href={fullSrc(photo)}
        onClick={(event) => {
          event.preventDefault()
          onOpen()
        }}
      >
        <img src={BASE + photo.thumb} alt="" loading="lazy" onLoad={setZoom} />
      </a>
    </figure>
  )
}

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <img
        className="lightbox-image"
        src={fullSrc(photo)}
        alt=""
        // Clicks on the photo itself must not count as "outside".
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}
