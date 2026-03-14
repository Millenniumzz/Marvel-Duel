import { useState, useEffect, useCallback } from 'react'
import { cardsApi, decksApi } from '../services/api'
import CardItem from '../components/CardItem'
import CardFilter from '../components/CardFilter'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { X, Save, Trash2, Plus, Minus, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import type { Card, CardFilters, Deck, DeckCard } from '../types'

const MAX_DECK_SIZE = 30
const MAX_COPIES = 3

export default function DeckBuilderPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [deck, setDeck] = useState<DeckCard[]>([])
  const [deckName, setDeckName] = useState('เดคของฉัน')
  const [deckDesc, setDeckDesc] = useState('')
  const [savedDecks, setSavedDecks] = useState<Deck[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const [filters, setFilters] = useState<CardFilters>({
    search: '',
    faction: 'all',
    cost: 'all',
    type: 'all',
    rarity: 'all',
    sort: 'cost_asc',
    page: 1,
    limit: 30,
  })

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { ...filters }
      if (params.faction === 'all') delete params.faction
      if (params.cost === 'all') delete params.cost
      if (params.type === 'all') delete params.type
      if (params.rarity === 'all') delete params.rarity

      const res = await cardsApi.getCards(params)
      setCards(res.data.cards)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  useEffect(() => {
    loadSavedDecks()
  }, [])

  const loadSavedDecks = async () => {
    try {
      const res = await decksApi.getDecks()
      setSavedDecks(res.data)
    } catch {}
  }

  const totalCards = deck.reduce((sum, entry) => sum + entry.quantity, 0)

  const addCard = (card: Card) => {
    if (totalCards >= MAX_DECK_SIZE) {
      toast.error(`เดคมีการ์ดครบ ${MAX_DECK_SIZE} ใบแล้ว`)
      return
    }
    setDeck((prev) => {
      const existing = prev.find((e) => e.card._id === card._id)
      if (existing) {
        if (existing.quantity >= MAX_COPIES) {
          toast.error(`ใส่การ์ดนี้ได้สูงสุด ${MAX_COPIES} ใบ`)
          return prev
        }
        return prev.map((e) =>
          e.card._id === card._id ? { ...e, quantity: e.quantity + 1 } : e
        )
      }
      return [...prev, { card, quantity: 1 }]
    })
  }

  const removeOne = (cardId: string) => {
    setDeck((prev) => {
      const entry = prev.find((e) => e.card._id === cardId)
      if (!entry) return prev
      if (entry.quantity <= 1) return prev.filter((e) => e.card._id !== cardId)
      return prev.map((e) =>
        e.card._id === cardId ? { ...e, quantity: e.quantity - 1 } : e
      )
    })
  }

  const removeCard = (cardId: string) => {
    setDeck((prev) => prev.filter((e) => e.card._id !== cardId))
  }

  const clearDeck = () => {
    setDeck([])
    toast.success('ล้างเดคแล้ว')
  }

  const saveDeck = async () => {
    if (!deckName.trim()) {
      toast.error('กรุณาตั้งชื่อเดค')
      return
    }
    if (deck.length === 0) {
      toast.error('เดคยังไม่มีการ์ด')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        name: deckName,
        description: deckDesc,
        faction: getDeckFaction(),
        cards: deck.map((e) => ({ card: e.card._id, quantity: e.quantity })),
      }
      await decksApi.saveDeck(payload)
      toast.success('บันทึกเดคสำเร็จ! 🎉')
      loadSavedDecks()
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  const loadDeck = (savedDeck: Deck) => {
    setDeckName(savedDeck.name)
    setDeckDesc(savedDeck.description || '')
    setDeck(
      savedDeck.cards.map((e) => ({ card: e.card, quantity: e.quantity }))
    )
    setShowSaved(false)
    toast.success(`โหลดเดค "${savedDeck.name}" แล้ว`)
  }

  const deleteSavedDeck = async (id: string, name: string) => {
    if (!confirm(`ลบเดค "${name}"?`)) return
    try {
      await decksApi.deleteDeck(id)
      toast.success('ลบเดคแล้ว')
      loadSavedDecks()
    } catch {
      toast.error('ลบไม่สำเร็จ')
    }
  }

  const getDeckFaction = () => {
    const factionCounts: Record<string, number> = {}
    deck.forEach(({ card, quantity }) => {
      if (card.faction !== 'Neutral') {
        factionCounts[card.faction] = (factionCounts[card.faction] || 0) + quantity
      }
    })
    if (Object.keys(factionCounts).length === 0) return 'Neutral'
    const dominant = Object.entries(factionCounts).sort((a, b) => b[1] - a[1])[0]
    return dominant ? dominant[0] : 'Mixed'
  }

  // Cost curve data
  const costCurve = Array.from({ length: 10 }, (_, i) => ({
    cost: i,
    count: deck.filter((e) => e.card.cost === i).reduce((s, e) => s + e.quantity, 0),
  }))
  const maxCurve = Math.max(...costCurve.map((c) => c.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">สร้างเดค</h1>
          <p className="text-gray-400 text-sm mt-1">Deck Builder</p>
        </div>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="btn-secondary flex items-center gap-2"
        >
          <BookOpen size={16} />
          เดคที่บันทึก ({savedDecks.length})
          {showSaved ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Saved Decks Panel */}
      {showSaved && (
        <div className="bg-marvel-card border border-marvel-border rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">เดคที่บันทึกไว้</h3>
          {savedDecks.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีเดคที่บันทึก</p>
          ) : (
            <div className="space-y-2">
              {savedDecks.map((d) => (
                <div
                  key={d._id}
                  className="flex items-center gap-3 p-3 bg-black/30 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{d.name}</p>
                    <p className="text-gray-400 text-xs">
                      {d.faction} • {d.totalCards} การ์ด
                    </p>
                  </div>
                  <button
                    onClick={() => loadDeck(d)}
                    className="text-xs px-3 py-1.5 bg-marvel-red rounded-lg text-white hover:bg-marvel-darkred transition-colors"
                  >
                    โหลด
                  </button>
                  <button
                    onClick={() => deleteSavedDeck(d._id, d.name)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Card Pool */}
        <div className="lg:col-span-2 space-y-4">
          <CardFilter filters={filters} onChange={setFilters} />
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cards.map((card) => (
                <CardItem key={card._id} card={card} deckMode onAddToDeck={addCard} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Deck */}
        <div className="space-y-4">
          <div className="bg-marvel-card border border-marvel-border rounded-xl p-4 sticky top-20 space-y-4">
            {/* Deck Name */}
            <div>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="ชื่อเดค"
                className="w-full bg-black/30 border border-marvel-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-marvel-red text-sm"
              />
              <input
                type="text"
                value={deckDesc}
                onChange={(e) => setDeckDesc(e.target.value)}
                placeholder="คำอธิบายเดค (ไม่บังคับ)"
                className="w-full bg-black/30 border border-marvel-border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-marvel-red text-sm mt-2"
              />
            </div>

            {/* Deck Stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">การ์ดในเดค</span>
              <span className={`font-bold ${totalCards >= MAX_DECK_SIZE ? 'text-marvel-red' : 'text-white'}`}>
                {totalCards} / {MAX_DECK_SIZE}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-marvel-red h-2 rounded-full transition-all"
                style={{ width: `${(totalCards / MAX_DECK_SIZE) * 100}%` }}
              />
            </div>

            {/* Cost Curve */}
            {deck.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Cost Curve</p>
                <div className="flex items-end gap-1 h-12">
                  {costCurve.map(({ cost, count }) => (
                    <div key={cost} className="flex flex-col items-center flex-1 gap-0.5">
                      <div
                        className="w-full bg-marvel-red/60 rounded-t transition-all"
                        style={{ height: `${(count / maxCurve) * 40}px` }}
                      />
                      <span className="text-xs text-gray-600">{cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card List */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {deck.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  ยังไม่มีการ์ดในเดค<br />
                  <span className="text-xs">กดปุ่ม "+ เพิ่มลงเดค" เพื่อเพิ่มการ์ด</span>
                </p>
              ) : (
                deck
                  .sort((a, b) => a.card.cost - b.card.cost)
                  .map(({ card, quantity }) => (
                    <div
                      key={card._id}
                      className="flex items-center gap-2 p-2 bg-black/20 rounded-lg group"
                    >
                      <div className="w-5 h-5 bg-marvel-red rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                        {card.cost}
                      </div>
                      <span className="flex-1 text-sm text-white truncate">{card.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => removeOne(card._id)}
                          className="p-0.5 text-gray-400 hover:text-white"
                        >
                          <Minus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-marvel-gold w-4 text-center">
                        x{quantity}
                      </span>
                      <button
                        onClick={() => addCard(card)}
                        className="p-0.5 text-gray-400 hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeCard(card._id)}
                        className="p-0.5 text-gray-400 hover:text-marvel-red opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={saveDeck}
                disabled={saving || deck.length === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'กำลังบันทึก...' : 'บันทึกเดค'}
              </button>
              <button
                onClick={clearDeck}
                className="p-2 btn-secondary"
                title="ล้างเดค"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
