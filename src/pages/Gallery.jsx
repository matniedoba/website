import { Link, useParams } from 'react-router-dom'
import galleries from 'virtual:galleries'
import usePageTitle from '../usePageTitle.js'

const BASE = import.meta.env.BASE_URL

// Square images would otherwise have nothing to zoom into on hover.
const MIN_ZOOM = 1.08

export default function Gallery() {
  const { galleryName = '' } = useParams()
  const gallery = galleries[galleryName.toLowerCase()]

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
    <div className="gallery-page">
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
            <Thumb key={photo.name} photo={photo} />
          ))}
        </div>
      ) : (
        <p className="gallery-empty">
          No photos yet — drop images into <code>public/gallery/{gallery.slug}/thumbs/</code>.
        </p>
      )}
    </div>
  )
}

function Thumb({ photo }) {
  // object-fit can't be transitioned, so the tile stays "contain" and we scale
  // by exactly the factor that turns contain into cover: the image's long side
  // divided by its short side. That makes the hover a smooth crop-to-fill.
  const setZoom = (event) => {
    const { naturalWidth: w, naturalHeight: h } = event.currentTarget
    if (!w || !h) return
    const zoom = Math.max(w, h) / Math.min(w, h)
    event.currentTarget.style.setProperty('--zoom', String(Math.max(zoom, MIN_ZOOM)))
  }

  const image = <img src={BASE + photo.thumb} alt="" loading="lazy" onLoad={setZoom} />

  return (
    <figure className="photo-tile">
      {photo.full ? (
        <a href={BASE + photo.full} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : (
        image
      )}
    </figure>
  )
}
