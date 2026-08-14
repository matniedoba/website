import { Link } from 'react-router-dom'
import usePageTitle from '../usePageTitle.js'

export default function NotFound() {
  usePageTitle('Page not found')

  return (
    <div className="container">
      <div className="text-block">
        <h1>Page not found</h1>
        <p>
          That page doesn&rsquo;t exist. <Link to="/">Back to the start</Link>.
        </p>
      </div>
    </div>
  )
}
