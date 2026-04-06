import { useEffect, useRef, useState } from 'react'
import useScrollAnimation from '../hooks/useScrollAnimation'

function AnimatedParagraph({ text }) {
  const ref = useScrollAnimation()
  return (
    <p ref={ref} className="reveal-on-scroll">
      {text}
    </p>
  )
}

function BlogPost({ post }) {
  const [showSources, setShowSources] = useState(false)
  const heroRef = useRef(null)

  if (!post) return null

  const paragraphs = post.summary.split(/\n\s*\n/).filter(Boolean)

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return
      heroRef.current.style.setProperty('--scroll-y', `${window.scrollY}px`)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <article className="post-shell">
      <div className="hero-image-wrap" ref={heroRef}>
        <img src={post.image_path} alt={post.headline} className="hero-image" />
      </div>

      <h1>{post.headline}</h1>
      <div className="meta-row">
        <span className="date-badge">{post.date}</span>
        <span>{post.articles.length} source stories</span>
      </div>

      <section className="summary-copy">
        {paragraphs.map((paragraph) => (
          <AnimatedParagraph key={paragraph.slice(0, 24)} text={paragraph} />
        ))}
      </section>

      <section className="sources">
        <button onClick={() => setShowSources((value) => !value)}>
          {showSources ? 'Hide sources' : 'Show sources'}
        </button>
        {showSources && (
          <ul>
            {post.articles.map((article) => (
              <li key={article.url}>
                <a href={article.url} target="_blank" rel="noreferrer">
                  {article.title}
                </a>
                <span>{article.source}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}

export default BlogPost
