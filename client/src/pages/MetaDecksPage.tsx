import { useState, useEffect } from 'react'
import { metaDecksApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import type { MetaDeck, Tier } from '../types'

const TIER_COLORS: Record<Tier, string> = {
  S: 'bg-red-900/60 border-red-500 text-red-400',
  A: 'bg-orange-900/60 border-orange-500 text-orange-400',
  B: 'bg-yellow-900/60 border-yellow-500 text-yellow-400',
  C: 'bg-gray-900/60 border-gray-500 text-gray-400',
}

const TIER_BADGE: Record<Tier, string> = {
  S: 'bg-red-500 text-white',
  A: 'bg-orange-500 text-white',
  B: 'bg-yellow-500 text-black',
  C: 'bg-gray-500 text-white',
}

const FACTION_COLORS: Record<string, string> = {
  Avengers: 'text-blue-400',
  'Guardians of the Galaxy': 'text-green-400',
  'X-Men': 'text-yellow-400',
  Hydra: 'text-red-400',
  Villains: 'text-purple-400',
  Wakanda: 'text-orange-400',
  Asgard: 'text-cyan-400',
  'S.H.I.E.L.D.': 'text-gray-400',
  Neutral: 'text-slate-400',
}

const PLAYSTYLE_ICONS: Record<string, string> = {
  Aggro: '⚔️',
  Control: '🛡️',
  Midrange: '⚖️',
  Swarm: '🐝',
  Combo: '✨',
}

export default function MetaDecksPage() {
  const [metaDecks, setMetaDecks] = useState<MetaDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchMetaDecks()
  }, [tierFilter])

  const fetchMetaDecks = async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = {}
      if (tierFilter !== 'all') params.tier = tierFilter
      const res = await metaDecksApi.getMetaDecks(params)
      setMetaDecks(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Group by tier
  const grouped = (['S', 'A', 'B', 'C'] as Tier[]).reduce((acc, tier) => {
    acc[tier] = metaDecks.filter((d) => d.tier === tier)
    return acc
  }, {} as Record<Tier, MetaDeck[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Meta Decks</h1>
          <p className="text-gray-400 text-sm mt-1">
            เดคที่แนะนำสำหรับ Meta ปัจจุบัน • Patch 1.0
          </p>
        </div>
        {/* Tier Filter */}
        <div className="flex gap-2">
          {['all', 'S', 'A', 'B', 'C'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tierFilter === tier
                  ? 'bg-marvel-red text-white'
                  : 'bg-marvel-card border border-marvel-border text-gray-400 hover:text-white'
              }`}
            >
              {tier === 'all' ? 'ทั้งหมด' : `Tier ${tier}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="กำลังโหลด Meta Decks..." />
      ) : metaDecks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🃏</p>
          <p className="text-xl font-semibold">ไม่พบ Meta Decks</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(['S', 'A', 'B', 'C'] as Tier[]).map((tier) => {
            const decks = tierFilter === 'all' ? grouped[tier] : grouped[tier] || []
            if (decks.length === 0) return null
            return (
              <div key={tier}>
                {/* Tier Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl border-2 ${TIER_BADGE[tier]} ${TIER_COLORS[tier]}`}
                  >
                    {tier}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Tier {tier}</h2>
                    <p className="text-gray-500 text-sm">{decks.length} เดค</p>
                  </div>
                  <div className="flex-1 h-px bg-marvel-border ml-2" />
                </div>

                {/* Deck Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {decks.map((metaDeck) => (
                    <MetaDeckCard
                      key={metaDeck._id}
                      metaDeck={metaDeck}
                      expanded={expandedId === metaDeck._id}
                      onToggle={() =>
                        setExpandedId(expandedId === metaDeck._id ? null : metaDeck._id)
                      }
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface MetaDeckCardProps {
  metaDeck: MetaDeck
  expanded: boolean
  onToggle: () => void
}

function MetaDeckCard({ metaDeck, expanded, onToggle }: MetaDeckCardProps) {
  const tierColor = TIER_COLORS[metaDeck.tier] || 'border-gray-500'
  const tierBadge = TIER_BADGE[metaDeck.tier] || 'bg-gray-500 text-white'
  const factionColor = FACTION_COLORS[metaDeck.faction] || 'text-gray-400'
  const playstyleIcon = PLAYSTYLE_ICONS[metaDeck.playstyle] || '🎮'

  // Cost curve
  const costCurve = Array.from({ length: 9 }, (_, i) => ({
    cost: i,
    count: metaDeck.cards
      ? metaDeck.cards
          .filter((e) => e.card && e.card.cost === i)
          .reduce((s, e) => s + e.quantity, 0)
      : 0,
  }))
  const maxCurve = Math.max(...costCurve.map((c) => c.count), 1)

  return (
    <div className={`bg-marvel-card border ${tierColor.split(' ')[2] || 'border-marvel-border'} rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div
        className="p-5 cursor-pointer hover:bg-black/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-black ${tierBadge}`}>
                Tier {metaDeck.tier}
              </span>
              <span className="text-gray-500 text-xs">{playstyleIcon} {metaDeck.playstyle}</span>
            </div>
            <h3 className="font-black text-white text-lg leading-tight">{metaDeck.name}</h3>
            <p className={`text-sm font-semibold ${factionColor} mt-0.5`}>{metaDeck.faction}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {metaDeck.winRate > 0 && (
              <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                <TrendingUp size={14} />
                {metaDeck.winRate}%
              </div>
            )}
            {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>

        {/* Description */}
        {metaDeck.descriptionTh && (
          <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-2">
            {metaDeck.descriptionTh}
          </p>
        )}

        {/* Cost Curve preview */}
        <div className="flex items-end gap-0.5 h-8 mt-3">
          {costCurve.map(({ cost, count }) => (
            <div
              key={cost}
              className="flex-1 bg-marvel-red/50 rounded-t"
              style={{ height: count > 0 ? `${(count / maxCurve) * 28}px` : '2px' }}
              title={`Cost ${cost}: ${count} cards`}
            />
          ))}
        </div>
      </div>

      {/* Expanded Card List */}
      {expanded && metaDeck.cards && metaDeck.cards.length > 0 && (
        <div className="border-t border-marvel-border p-4 space-y-1 bg-black/20">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
            รายการการ์ด ({metaDeck.cards.reduce((s, e) => s + e.quantity, 0)} ใบ)
          </p>
          {metaDeck.cards
            .sort((a, b) => (a.card?.cost || 0) - (b.card?.cost || 0))
            .map((entry) => (
              <div
                key={entry.card?._id || Math.random()}
                className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-black/20 transition-colors"
              >
                <div className="w-6 h-6 bg-marvel-red rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                  {entry.card?.cost ?? '?'}
                </div>
                <span className="flex-1 text-sm text-white truncate">
                  {entry.card?.name || 'Unknown'}
                </span>
                {entry.card?.nameTh && (
                  <span className="text-xs text-gray-500 hidden sm:block">{entry.card.nameTh}</span>
                )}
                {entry.role && (
                  <span className="text-xs text-marvel-red bg-marvel-red/10 px-1.5 py-0.5 rounded">
                    {entry.role}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-400 w-6 text-right">
                  ×{entry.quantity}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
