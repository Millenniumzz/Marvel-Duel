import { useState, useEffect, useCallback } from 'react'
import { cardsApi } from '../services/api'
import CardItem from '../components/CardItem'
import CardFilter from '../components/CardFilter'
import CardModal from '../components/CardModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react'
import type { Card, CardFilters } from '../types'

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const [filters, setFilters] = useState<CardFilters>({
    search: '',
    faction: 'all',
    cost: 'all',
    type: 'all',
    rarity: 'all',
    battle_style: 'all',
    sort: 'name',
    page: 1,
    limit: 24,
  })

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { ...filters }
      if (params.faction === 'all') delete params.faction
      if (params.cost === 'all') delete params.cost
      if (params.type === 'all') delete params.type
      if (params.rarity === 'all') delete params.rarity
      if (params.battle_style === 'all') delete params.battle_style

      const res = await cardsApi.getCards(params)
      
      // Server already sorts the cards, no need to sort again
      setCards(res.data.cards)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error('Failed to fetch cards:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const handleFilterChange = (newFilters: CardFilters) => {
    setFilters(newFilters)
  }

  const changePage = (newPage: number) => {
    setFilters((f) => ({ ...f, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">การ์ดทั้งหมด</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'กำลังโหลด...' : `พบ ${total} การ์ด`}
          </p>
        </div>
        {/* View Toggle */}
        <div className="flex bg-marvel-card border border-marvel-border rounded-lg p-1 gap-1">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded transition-all ${
              view === 'grid' ? 'bg-marvel-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded transition-all ${
              view === 'list' ? 'bg-marvel-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <CardFilter filters={filters} onChange={handleFilterChange} />

      {/* Cards Grid */}
      {loading ? (
        <LoadingSpinner text="กำลังโหลดการ์ด..." />
      ) : cards.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🃏</p>
          <p className="text-xl font-semibold">ไม่พบการ์ดที่ค้นหา</p>
          <p className="text-sm mt-2">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {cards.map((card) => (
            <CardItem key={card._id} card={card} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <CardListItem key={card._id} card={card} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => changePage(filters.page - 1)}
            disabled={filters.page <= 1}
            className="p-2 bg-marvel-card border border-marvel-border rounded-lg disabled:opacity-30 hover:bg-marvel-cardHover transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => changePage(page)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                  filters.page === page
                    ? 'bg-marvel-red text-white'
                    : 'bg-marvel-card border border-marvel-border text-gray-400 hover:text-white hover:bg-marvel-cardHover'
                }`}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={() => changePage(filters.page + 1)}
            disabled={filters.page >= totalPages}
            className="p-2 bg-marvel-card border border-marvel-border rounded-lg disabled:opacity-30 hover:bg-marvel-cardHover transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

// List view item
interface CardListItemProps {
  card: Card
}

function CardListItem({ card }: CardListItemProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div
        className="flex items-center gap-4 bg-marvel-card border border-marvel-border rounded-xl p-4 cursor-pointer hover:bg-marvel-cardHover transition-all"
        onClick={() => setShowModal(true)}
      >
        <div className="w-8 h-8 bg-marvel-red rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
          {card.cost}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-white truncate">{card.name}</p>
            {card.nameTh && <span className="text-gray-400 text-sm truncate hidden sm:block">{card.nameTh}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{card.faction}</span>
            <span className="text-gray-700">•</span>
            <span className="text-xs text-gray-500">{card.type}</span>
            <span className="text-gray-700">•</span>
            <span className="text-xs text-gray-500">{card.rarity}</span>
          </div>
        </div>
        {card.type === 'Character' && (
          <div className="flex items-center gap-3 text-sm flex-shrink-0">
            <span className="text-red-400 font-bold">{card.attack}⚔</span>
            <span className="text-green-400 font-bold">{card.armor}🛡</span>
          </div>
        )}
      </div>
      {showModal && (
        <CardModal card={card} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
