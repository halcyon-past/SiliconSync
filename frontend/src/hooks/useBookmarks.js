import { useState, useEffect } from 'react'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('siliconsync-bookmarks')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('siliconsync-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const toggleBookmark = (date) => {
    setBookmarks(prev => {
      if (prev.includes(date)) return prev.filter(d => d !== date)
      return [...prev, date]
    })
  }

  const isBookmarked = (date) => bookmarks.includes(date)

  return { bookmarks, toggleBookmark, isBookmarked }
}
