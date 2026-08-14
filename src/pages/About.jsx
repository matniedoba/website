import usePageTitle from '../usePageTitle.js'
import profile from '../assets/profile.jpg'
import travel from '../assets/travel.jpg'

export default function About() {
  usePageTitle('About')

  return (
    <>
      <div className="container">
        <div className="text-block about-split">
          <div className="about-text">
            <h1>Hey, I&rsquo;m Matthäus</h1>
            <p className="accent">Currently working on Anchorpoint</p>
            <p>
              I like building things: software, music, photographs. As a product designer I spent years making complex enterprise tools usable. Now I run Anchorpoint, a bootstrapped company with the mission to bring proper collaboration workflows to people who never wanted to learn version control.
            </p>
            <p>
              Currently, I am building Anchorpoint,{' '}
              <a href="https://www.anchorpoint.app/" target="_blank" rel="noopener noreferrer">
                a version control solution for 3D projects
              </a>
              .
            </p>
          </div>
          <div className="about-img">
            <img src={profile} width="602" height="1024" alt="Matthäus Niedoba" />
          </div>
        </div>
      </div>

      <section className="text-block-wide">
        <div className="container">
          <p className="accent">Previous work</p>

          <h3>Maxon Cinema 4D</h3>
          <p className="measure">
            My challenge was to make a complex 3D software accessible for artists who want to
            design and not to deal with technical constraints.
          </p>

          <h3>ZDF &ndash; Second German Television</h3>
          <p className="measure">
            I created 3D illustrations and animation for the prime time news. They were used as a
            hologram in a virtual studio to assist the newscaster.
          </p>

          <h3>University of Applied Sciences Mainz</h3>
          <p className="measure">
            I graduated 2016 at University of Applied Sciences Mainz with Lingit &ndash; a language
            learning app. It got rewarded at{' '}
            <a
              href="https://germanupa.de/events/ux-challenge-2020/rueckblick-ux-challenge-2019"
              target="_blank"
              rel="noopener noreferrer"
            >
              UX Challenge 2019
            </a>
            .
          </p>
        </div>
      </section>

      <div className="container">
        <div className="text-block">
          <img
            className="travel-img"
            src={travel}
            width="1024"
            height="576"
            alt="Exploring Eastern Europe and Central Asia"
          />
          <h6>Exploring Eastern Europe and Central Asia</h6>
        </div>
      </div>
    </>
  )
}
