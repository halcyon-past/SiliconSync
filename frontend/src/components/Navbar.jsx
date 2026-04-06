import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Navbar({ items = [] }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Max 10 items as requested
  const menuItems = items.slice(0, 10)

  return (
    <header className={`navbar ${isScrolled ? 'is-sticky' : ''}`}>
      <button className="logo" onClick={() => {
        navigate('/')
        setIsMenuOpen(false)
      }}>
        SILICON<span>SYNC</span>
      </button>

      <div className="nav-controls">
        <button 
          className={`hamburger ${isMenuOpen ? 'is-active' : ''}`} 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <div className="cross-icon">
              <span className="line"></span>
              <span className="line"></span>
            </div>
          ) : (
            <>
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </>
          )}
        </button>
      </div>

      <nav className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="mobile-menu-content">
          <h3>Recent Updates</h3>
          <ul>
            {menuItems.map(item => (
              <li key={item.date}>
                <Link 
                  to={`/news/${item.date}`} 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="menu-date">{item.date}</span>
                  <span className="menu-headline">{item.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link 
            to="/news" 
            className="menu-view-all"
            onClick={() => setIsMenuOpen(false)}
          >
            View News Archive
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
