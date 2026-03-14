import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import CardsPage from './pages/CardsPage'
import DeckBuilderPage from './pages/DeckBuilderPage'
import MetaDecksPage from './pages/MetaDecksPage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-marvel-dark">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/deck-builder" element={<DeckBuilderPage />} />
            <Route path="/meta-decks" element={<MetaDecksPage />} />
          </Routes>
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#fff',
              border: '1px solid #2D2D4E',
            },
          }}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
