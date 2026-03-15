import { useState, useEffect } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { CardFilters } from '../types'

// ใช้ Deck Groups เป็นหลัก (มีข้อมูลครบกว่า faction)
const FACTIONS = [
  'all',
  'Agents',
  'Asgard',
  'Brotherhood',
  'Collaboration',
  'Deadpool Corps',
  'Eternals',
  'Guardians of the Galaxy',
  'Intergalactic War',
  'Marvel Knights',
  'Mystics',
  'Neutral',
  'Ragnarok',
  'Special',
  'Spider-Verse',
  'Stark Industries',
  'X-Men',
]

const COSTS = ['all','2', '3', '4', '5', '6']

const TYPES = ['all', 'Character', 'Equipment', 'Pow', 'Tactics Card']

const BATTLE_STYLES = ['all', 'Attack', 'Guardian', 'Support']

const RARITIES = ['all', 'Common', 'Rare', 'Epic', 'Legendary','Multiverse']



interface CardFilterProps {
  filters: CardFilters
  onChange: (filters: CardFilters) => void
}

export default function CardFilter({ filters, onChange }: CardFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChange({ ...filters, search: localSearch, page: 1 })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch])

  const handleChange = (key: keyof CardFilters, value: string | number) => {
    onChange({ ...filters, [key]: value, page: 1 })
  }

  const clearAll = () => {
    setLocalSearch('')
    onChange({ search: '', faction: 'all', cost: 'all', type: 'all', rarity: 'all', battle_style: 'all', sort: 'name', page: 1, limit: 24 })
  }

  const hasActiveFilters =
    filters.search ||
    filters.faction !== 'all' ||
    filters.cost !== 'all' ||
    filters.type !== 'all' ||
    filters.rarity !== 'all' ||
    filters.battle_style !== 'all'

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="ค้นหาการ์ด... (ชื่อ, ภาษาไทย, คำอธิบาย)"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full bg-marvel-card border border-marvel-border rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-marvel-red transition-colors"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(''); handleChange('search', '') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
            showAdvanced
              ? 'bg-marvel-red border-marvel-red text-white'
              : 'bg-marvel-card border-marvel-border text-gray-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={16} />
          ตัวกรอง
          <ChevronDown
            size={14}
            className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Quick Faction Tags */}
        <div className="flex flex-wrap gap-1">
          {FACTIONS.slice(0, 5).map((f) => (
            <button
              key={f}
              onClick={() => handleChange('faction', f)}
              className={`filter-tag ${
                filters.faction === f ? 'filter-tag-active' : 'filter-tag-inactive'
              }`}
            >
              {f === 'all' ? 'ทั้งหมด' : f}
            </button>
          ))}
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-marvel-red transition-colors ml-auto"
          >
            <X size={14} />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-marvel-card border border-marvel-border rounded-xl p-4 space-y-4">
          {/* All Factions */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">กลุ่มการ์ด (Faction)</p>
            <div className="flex flex-wrap gap-1.5">
              {FACTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => handleChange('faction', f)}
                  className={`filter-tag ${
                    filters.faction === f ? 'filter-tag-active' : 'filter-tag-inactive'
                  }`}
                >
                  {f === 'all' ? 'ทั้งหมด' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Cost */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">ต้นทุน (Energy Cost)</p>
            <div className="flex flex-wrap gap-1.5">
              {COSTS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleChange('cost', c)}
                  className={`w-9 h-9 rounded-full text-sm font-bold border transition-all ${
                    filters.cost === c
                      ? 'bg-marvel-red border-marvel-red text-white'
                      : 'bg-marvel-cardHover border-marvel-border text-gray-400 hover:border-marvel-red hover:text-white'
                  }`}
                >
                  {c === 'all' ? '∞' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">ประเภทการ์ด (Type)</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => handleChange('type', t)}
                  className={`filter-tag ${
                    filters.type === t ? 'filter-tag-active' : 'filter-tag-inactive'
                  }`}
                >
                  {t === 'all' ? 'ทั้งหมด' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Battle Style */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">รูปแบบการต่อสู้ (Battle Style)</p>
            <div className="flex flex-wrap gap-1.5">
              {BATTLE_STYLES.map((bs) => (
                <button
                  key={bs}
                  onClick={() => handleChange('battle_style', bs)}
                  className={`filter-tag ${
                    filters.battle_style === bs ? 'filter-tag-active' : 'filter-tag-inactive'
                  }`}
                >
                  {bs === 'all' ? 'ทั้งหมด' : bs}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">ความหายาก (Rarity)</p>
            <div className="flex flex-wrap gap-1.5">
              {RARITIES.map((r) => (
                <button
                  key={r}
                  onClick={() => handleChange('rarity', r)}
                  className={`filter-tag ${
                    filters.rarity === r ? 'filter-tag-active' : 'filter-tag-inactive'
                  }`}
                >
                  {r === 'all' ? 'ทั้งหมด' : r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
