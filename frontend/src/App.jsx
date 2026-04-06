import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import DatePage from './pages/DatePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/news/:date" element={<DatePage />} />
    </Routes>
  )
}

export default App
