const SOCIAL = [
  { label: 'Linkedin', href: 'https://www.linkedin.com/in/matniedoba/' },
  { label: 'Email', href: 'mailto:matniedoba@gmail.com' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <ul className="footer-menu">
          {SOCIAL.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                {...(href.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
