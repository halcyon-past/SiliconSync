import { useEffect, useState } from 'react'
import BlogPost from '../components/BlogPost'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { getLatestNews, getNewsIndex } from '../utils/api'

function Home() {
  const [post, setPost] = useState(null)
  const [index, setIndex] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getLatestNews(), getNewsIndex()])
      .then(([latest, latestIndex]) => {
        setPost(latest)
        setIndex(latestIndex)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="page-shell">
      <Navbar items={index} />
      {error ? <p className="error-box">{error}</p> : null}
      {!post ? (
        <LoadingSpinner />
      ) : (
        <main className="layout-grid">
          <BlogPost post={post} />
          <Sidebar items={index} activeDate={post.date} />
        </main>
      )}
    </div>
  )
}

export default Home
