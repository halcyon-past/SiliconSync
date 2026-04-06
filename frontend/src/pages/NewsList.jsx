import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { getNewsIndex } from '../utils/api'
import { Trie } from '../utils/trie'

function NewsList() {
  const [index, setIndex] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 10

  const trie = useMemo(() => {
    const t = new Trie()
    index.forEach((item, i) => {
      // Index headline and date keywords
      const words = `${item.headline} ${item.date}`.split(/\s+/)
      words.forEach(word => {
        // Clean words (remove special characters)
        const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, '')
        if (cleanWord.length > 1) {
          t.insert(cleanWord, i)
        }
      })
    })
    return t
  }, [index])

  useEffect(() => {
    getNewsIndex()
      .then(data => {
        setIndex(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return index
    
    const words = searchQuery.trim().toLowerCase().split(/\s+/)
    if (words.length === 0) return index

    // Get indices for each word and find intersection
    const results = words.map(word => trie.search(word))
    const commonIndices = results.reduce((acc, current) => {
      if (acc === null) return current
      return acc.filter(idx => current.includes(idx))
    }, null)

    return (commonIndices || []).map(idx => index[idx])
  }, [searchQuery, index, trie])

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / postsPerPage)
  const currentNews = filteredNews.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  if (loading) return <div className="page-shell"><Navbar /><LoadingSpinner /></div>

  return (
    <div className="page-shell">
      <Navbar />
      <main className="archive-layout">
        <header className="archive-header">
          <h1>News <span>Archive</span></h1>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search news by headline or date..." 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </header>

        <div className="news-list">
          {currentNews.length > 0 ? (
            currentNews.map(item => (
              <Link to={`/news/${item.date}`} key={item.date} className="news-item-card">
                <div className="news-item-content">
                  <span className="news-item-date">{item.date}</span>
                  <h3>{item.headline}</h3>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-results">No news found matching "{searchQuery}"</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default NewsList
