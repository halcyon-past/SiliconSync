import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import DatePage from './pages/DatePage'
import NewsList from './pages/NewsList'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<NewsList />} />
        <Route path="/news/:date" element={<DatePage />} />
      </Routes>
      <div className="site-credit">
        This website is owned by <a href="https://aritro.cloud" target="_blank" rel="noreferrer">aritro.cloud</a>
      </div>
    </>
  )
}

export default App
