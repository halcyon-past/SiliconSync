import { useEffect, useRef, useState } from 'react'
import useScrollAnimation from '../hooks/useScrollAnimation'
import { useBookmarks } from '../hooks/useBookmarks'

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
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const [copied, setCopied] = useState(false)

  if (!post) return null

  const paragraphs = post.summary.split(/\n\s*\n/).filter(Boolean)
  const wordCount = post.summary.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleShare = async () => {
    try {
      const [yyyy, mm, dd] = post.date.split('-');
      const dateObj = new Date(yyyy, mm - 1, dd);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      const messages = [
        `🚀 Here's your daily tech catch-up for ${formattedDate}. See what's disrupting the industry today on SiliconSync!`,
        `📰 Dive into the top tech stories of ${formattedDate}. Stay ahead of the curve with SiliconSync!`,
        `⚡ Don't miss out on today's tech breakthroughs (${formattedDate}). Read the full summary on SiliconSync!`,
        `💡 Curious about what happened in tech on ${formattedDate}? Check out the latest updates on SiliconSync.`
      ];
      const shareMessage = messages[Math.floor(Math.random() * messages.length)];
      
      if (navigator.share) {
        await navigator.share({
          title: post.headline,
          text: shareMessage,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert(shareMessage + "\n\nLink copied to clipboard!")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (e) {
      console.error(e)
    }
  }

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
        <div className="meta-left">
          <span className="date-badge">{post.date}</span>
          <span className="read-time-badge">{readingTime} min read</span>
          <span>{post.articles.length} source stories</span>
        </div>
        <div className="meta-right">
          <button 
            className={`action-btn ${isBookmarked(post.date) ? 'active' : ''}`}
            onClick={() => toggleBookmark(post.date)}
            title="Save for later"
          >
            {isBookmarked(post.date) ? '★ Saved' : '☆ Save'}
          </button>
          <button className="action-btn" onClick={handleShare} title="Share">
            {copied ? '✓ Copied' : '➦ Share'}
          </button>
        </div>
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
          <ul className="source-list">
            {post.articles.map((article) => {
              let domain = ''
              try {
                domain = new URL(article.url).hostname
              } catch(e) {}
              return (
                <li key={article.url} className="source-item">
                  <div className="source-details">
                    <a href={article.url} target="_blank" rel="noreferrer">
                      {article.title}
                    </a>
                    <div className="source-meta">
                      {domain && (
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                          alt="" 
                          className="source-favicon" 
                        />
                      )}
                      <span className="source-domain">{article.source}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </article>
  )
}

export default BlogPost
