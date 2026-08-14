import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <Link className="logo" to="/">
            <img src={logo} width="50" height="46" alt="Matthäus Niedoba" />
          </Link>
          <p className="slogan">Matthäus is a Product Designer based around Frankfurt</p>
        </div>
      </div>
    </header>
  )
}
