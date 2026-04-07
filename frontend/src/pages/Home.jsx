import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
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
      <Helmet>
        <title>SiliconSync | Tech News & Summaries</title>
        <meta name="description" content="Read our latest curated tech news, insightful summaries, and latest industry updates from around the world." />
        <link rel="canonical" href="https://siliconsync.aritro.cloud/" />
      </Helmet>
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
