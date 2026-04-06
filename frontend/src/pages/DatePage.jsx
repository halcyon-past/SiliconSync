import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
      <Navbar />
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
