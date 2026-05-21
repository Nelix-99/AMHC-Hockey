import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Lineup from './pages/Lineup'
import Matches from './pages/Matches'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/lineup" element={<ProtectedRoute><Lineup /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="*" element={<div className="max-w-2xl mx-auto px-4 py-16 text-center"><h1 className="text-4xl font-bold text-gray-300">404</h1><p className="text-gray-500 mt-2">Page not found</p></div>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AppProvider>
  )
}
