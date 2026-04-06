import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import DatePage from './pages/DatePage'
import NewsList from './pages/NewsList'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/news" element={<NewsList />} />
      <Route path="/news/:date" element={<DatePage />} />
    </Routes>
  )
}

export default App
