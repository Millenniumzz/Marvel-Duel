import { useState } from 'react'
import { Swords, Shield } from 'lucide-react'
import CardModal from './CardModal'
import type { Card } from '../types'
import { useCardImage } from '../hooks/useCardImage'
import { BATTLE_STYLE_ICONS, TYPE_ICONS } from '../constants/icons'

const FACTION_COLORS: Record<string, string> = {
  Avengers: 'text-blue-400 bg-blue-900/30 border-blue-700',
  'Guardians of the Galaxy': 'text-green-400 bg-green-900/30 border-green-700',
  'X-Men': 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  Hydra: 'text-red-400 bg-red-900/30 border-red-700',
  Villains: 'text-purple-400 bg-purple-900/30 border-purple-700',
  Wakanda: 'text-orange-400 bg-orange-900/30 border-orange-700',
  Asgardian: 'text-cyan-400 bg-cyan-900/30 border-cyan-700',
  'S.H.I.E.L.D.': 'text-gray-400 bg-gray-900/30 border-gray-600',
  Neutral: 'text-slate-400 bg-slate-900/30 border-slate-600',
}

const RARITY_BORDER: Record<string, string> = {
  Common: 'border-gray-600',
  Rare: 'border-blue-500',
  Epic: 'border-purple-500',
  Legendary: 'border-yellow-500',
  Multiverse: 'border-pink-500',
}

const RARITY_GLOW: Record<string, string> = {
  Common: '',
  Rare: 'shadow-blue-500/20',
  Epic: 'shadow-purple-500/30',
  Legendary: 'shadow-yellow-500/40',
  Multiverse: 'shadow-pink-500/40',
}

const RARITY_BADGE: Record<string, string> = {
  Common: 'bg-gray-700 text-gray-300',
  Rare: 'bg-blue-900 text-blue-300',
  Epic: 'bg-purple-900 text-purple-300',
  Legendary: 'bg-yellow-900 text-yellow-400',
  Multiverse: 'bg-pink-900 text-pink-300',
}

const BATTLE_STYLE_COLORS: Record<string, string> = {
  Attack: 'bg-red-900/50 text-red-300 border border-red-600',
  Guardian: 'bg-blue-900/50 text-blue-300 border border-blue-600',
  Support: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600',
  Pow: 'bg-purple-900/50 text-purple-300 border border-purple-600',
  'Tactics Card': 'bg-green-900/50 text-green-300 border border-green-600',
}

// Helper function to get display type
const getDisplayType = (card: Card): string => {
  return card.type
}

interface CardItemProps {
  card: Card
  onAddToDeck?: (card: Card) => void
  deckMode?: boolean
}

export default function CardItem({ card, onAddToDeck, deckMode = false }: CardItemProps) {
  const [showModal, setShowModal] = useState(false)
  const { imageUrl, loading } = useCardImage(card)
  
  // Get display type based on battle_style
  const displayType = getDisplayType(card)
  const Icon = TYPE_ICONS[displayType] || Swords
  const BattleStyleIcon = card.battle_style ? BATTLE_STYLE_ICONS[card.battle_style] : null
  const factionColor = FACTION_COLORS[card.faction] || 'text-gray-400 bg-gray-900/30 border-gray-600'
  const rarityBorder = RARITY_BORDER[card.rarity] || 'border-gray-600'
  const rarityGlow = RARITY_GLOW[card.rarity] || ''
  const rarityBadge = RARITY_BADGE[card.rarity] || 'bg-gray-700 text-gray-300'
  const battleStyleColor = card.battle_style ? BATTLE_STYLE_COLORS[card.battle_style] : null

  // Parse keywords to array
  const keywordsArray = Array.isArray(card.keywords) 
    ? card.keywords 
    : typeof card.keywords === 'string' 
    ? card.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : []

  return (
    <>
      <div
        className={`relative bg-marvel-card border-2 ${rarityBorder} rounded-xl overflow-hidden card-hover cursor-pointer shadow-lg ${rarityGlow ? `shadow-lg ${rarityGlow}` : ''}`}
        onClick={() => !deckMode && setShowModal(true)}
      >
        {/* Cost Badge */}
        <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-marvel-red rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg">
          {card.cost}
        </div>

        {/* Rarity badge */}
        <div className={`absolute top-2 right-2 z-10 text-xs px-2 py-0.5 rounded-full font-semibold ${rarityBadge}`}>
          {card.rarity}
        </div>

        {/* Battle Style badge */}
        {card.battle_style && battleStyleColor && BattleStyleIcon && (
          <div className={`absolute top-10 right-2 z-10 text-xs px-2 py-0.5 rounded font-semibold ${battleStyleColor} flex items-center gap-1`}>
            <BattleStyleIcon size={12} />
            {card.battle_style}
          </div>
        )}

        {/* Card Image */}
        <div className="w-full h-48 bg-gradient-to-br from-marvel-cardHover to-black flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-xs">Loading...</span>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={card.name}
              className="w-full h-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30">
              <Icon size={40} />
              <span className="text-xs">{displayType}</span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-3 space-y-2">
          {/* Name */}
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">{card.name}</h3>
            {card.nameTh && (
              <p className="text-gray-400 text-xs">{card.nameTh}</p>
            )}
          </div>

          {/* Type + Faction */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-black/30 rounded px-1.5 py-0.5">
              <Icon size={10} />
              {displayType}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${factionColor}`}>
              {card.faction}
            </span>
          </div>

          {/* Stats */}
          {displayType === 'Character' && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <Swords size={12} />
                {card.attack}
              </span>
              <span className="flex items-center gap-1 text-green-400 font-bold">
                <Shield size={12} />
                {card.armor}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {card.descriptionTh || card.description}
          </p>

          {/* Keywords */}
          {keywordsArray.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {keywordsArray.slice(0, 3).map((kw: string) => (
                <span key={kw} className="text-xs bg-black/40 text-gray-500 px-1.5 py-0.5 rounded">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Add to Deck Button */}
          {deckMode && onAddToDeck && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddToDeck(card)
              }}
              className="w-full btn-primary text-xs py-1.5 mt-1"
            >
              + เพิ่มลงเดค
            </button>
          )}
        </div>
      </div>

      {showModal && <CardModal card={card} onClose={() => setShowModal(false)} />}
    </>
  )
}
