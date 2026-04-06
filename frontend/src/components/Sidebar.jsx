import { Link } from 'react-router-dom'

function Sidebar({ items = [], activeDate }) {
  const recent = items.slice(0, 10)

  return (
    <aside className="sidebar reveal-on-scroll is-visible">
      <h3>Recent Posts</h3>
      <ul>
        {recent.map((item) => (
          <li key={item.date} className={activeDate === item.date ? 'active' : ''}>
            <Link to={`/news/${item.date}`}>
              <span className="sidebar-date">{item.date}</span>
              <span className="sidebar-headline">{item.headline.slice(0, 50)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
