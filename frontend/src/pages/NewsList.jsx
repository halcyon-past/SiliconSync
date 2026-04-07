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
  const [searchDate, setSearchDate] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
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
    let finalResults = index;

    if (searchQuery.trim()) {
      const words = searchQuery.trim().toLowerCase().split(/\s+/);
      if (words.length > 0) {
        const results = words.map(word => trie.search(word));
        const commonIndices = results.reduce((acc, current) => {
          if (acc === null) return current;
          return acc.filter(idx => current.includes(idx));
        }, null);
        finalResults = (commonIndices || []).map(idx => index[idx]);
      }
    }
    
    if (searchDate) {
      finalResults = finalResults.filter(item => item.date === searchDate);
    }

    return [...finalResults].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [searchQuery, searchDate, sortOrder, index, trie]);

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

  const handleDateSearch = (e) => {
    setSearchDate(e.target.value)
    setCurrentPage(1)
  }

  const handleSortChange = (e) => {
    setSortOrder(e.target.value)
    setCurrentPage(1)
  }

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) return <div className="page-shell"><Navbar items={index} /><LoadingSpinner /></div>

  return (
    <div className="page-shell">
      <Navbar items={index} />
      <main className="archive-layout">
        <header className="archive-header">
          <h1>News <span>Archive</span></h1>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search news by headline..." 
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <div className="filter-group">
              <div className="date-picker-wrapper">
                <input 
                  type="text" 
                  value={searchDate ? new Date(searchDate).toLocaleDateString('en-GB') : ''}
                  placeholder="dd/mm/yyyy" 
                  readOnly 
                  className="search-input date-text-display" 
                />
                <input 
                  type="date"
                  value={searchDate}
                  onChange={handleDateSearch}
                  className="hidden-date-input"
                />
              </div>
              <div className="sort-select-wrapper">
                <select value={sortOrder} onChange={handleSortChange} className="sort-select">
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
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
            <p className="no-results">No news found matching your criteria</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-arrow"
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              &larr;
            </button>
            <div className="pagination-numbers">
              {getVisiblePages().map(page => (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              className="pagination-arrow"
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              &rarr;
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default NewsList
