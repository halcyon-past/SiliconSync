import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import BlogPost from '../components/BlogPost'
import LoadingSpinner from '../components/LoadingSpinner'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { getNewsByDate, getNewsIndex } from '../utils/api'

function DatePage() {
  const { date } = useParams()
  const [post, setPost] = useState(null)
  const [index, setIndex] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    setPost(null)
    setError('')

    Promise.all([getNewsByDate(date), getNewsIndex()])
      .then(([data, list]) => {
        setPost(data)
        setIndex(list)
      })
      .catch(() => {
        setError('No news found for this date')
      })
  }, [date])

  return (
    <div className="page-shell">
      {post ? (
        <Helmet>
          <title>{post.headline} - SiliconSync</title>
          <meta name="description" content={post.summaries?.[0]?.content?.substring(0, 150) + '...' || `tech news for ${date}`} />
          <meta property="og:title" content={`${post.headline} - SiliconSync`} />
          <meta property="og:description" content={post.summaries?.[0]?.content?.substring(0, 150) + '...' || `tech news for ${date}`} />
          <link rel="canonical" href={`https://siliconsync.aritro.cloud/news/${date}`} />
        </Helmet>
      ) : (
        <Helmet>
          <title>News for {date} - SiliconSync</title>
          <link rel="canonical" href={`https://siliconsync.aritro.cloud/news/${date}`} />
        </Helmet>
      )}
      <Navbar items={index} />
      {!post && !error ? <LoadingSpinner /> : null}
      {error ? (
        <div className="not-found">
          <h2>No news found for this date</h2>
          <Link to="/">Return to latest post</Link>
        </div>
      ) : null}
      {post ? (
        <main className="layout-grid">
          <BlogPost post={post} />
          <Sidebar items={index} activeDate={post.date} />
        </main>
      ) : null}
    </div>
  )
}

export default DatePage
