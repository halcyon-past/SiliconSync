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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Max 10 items as requested
  const menuItems = items.slice(0, 10)

  return (
    <>
      <header className={`navbar ${isScrolled ? 'is-sticky' : ''}`}>
        <button className="logo" onClick={() => {
          navigate('/')
          setIsMenuOpen(false)
        }}>
        SILICON<span>SYNC</span>
      </button>

      <div className="nav-controls">
        <Link to="/saved" className="nav-saved-btn desktop-only">
          ★ Saved
        </Link>
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
      </header>

      <nav 
        className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
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
          <Link 
            to="/saved" 
            className="menu-view-all"
            style={{ marginTop: '0.5rem' }}
            onClick={() => setIsMenuOpen(false)}
          >
            View Saved Articles
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Navbar
