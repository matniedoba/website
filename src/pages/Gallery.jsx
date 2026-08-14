import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import galleries from 'virtual:galleries'
import usePageTitle from '../usePageTitle.js'

const BASE = import.meta.env.BASE_URL

// Square images would otherwise have nothing to zoom into on hover.
const MIN_ZOOM = 1.08

// Falls back to the thumbnail when no full-size original sits next to thumbs/.
const fullSrc = (photo) => BASE + (photo.full ?? photo.thumb)

export default function Gallery() {
  const { galleryName = '' } = useParams()
  const gallery = galleries[galleryName.toLowerCase()]
  const [active, setActive] = useState(null)

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
