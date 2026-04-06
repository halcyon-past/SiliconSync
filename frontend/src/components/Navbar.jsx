import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${isScrolled ? 'is-sticky' : ''}`}>
      <button className="logo" onClick={() => navigate('/')}>
        SILICON<span>SYNC</span>
      </button>
    </header>
  )
}

export default Navbar
