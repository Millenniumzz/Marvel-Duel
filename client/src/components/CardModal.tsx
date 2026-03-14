import { X, Swords, Shield, Zap } from 'lucide-react'
import type { Card } from '../types'

interface CardModalProps {
  card: Card
  onClose: () => void
}

const TYPE_ICON: Record<string, typeof Swords> = {
  Character: Swords,
  Action: Zap,
  Equip: Shield,
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const Icon = TYPE_ICON[card.type] || Swords

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-marvel-card border-2 border-marvel-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-marvel-card border-b border-marvel-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-marvel-red rounded-full flex items-center justify-center font-black text-white">
              {card.cost}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{card.name}</h2>
              {card.nameTh && <p className="text-gray-400 text-sm">{card.nameTh}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-marvel-cardHover rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          {card.image && (
            <div className="w-full h-64 bg-gradient-to-br from-marvel-cardHover to-black rounded-xl overflow-hidden">
              <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/40 rounded-lg p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">ราคา</p>
              <p className="text-2xl font-black text-marvel-red">{card.cost}</p>
            </div>
            {card.type === 'Character' && (
              <>
                <div className="bg-black/40 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-xs mb-1">พลังโจมตี</p>
                  <p className="text-2xl font-black text-red-400">{card.attack || card.power}</p>
                </div>
                <div className="bg-black/40 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-xs mb-1">เกราะป้องกัน</p>
                  <p className="text-2xl font-black text-blue-400">{card.armor || 0}</p>
                </div>
              </>
            )}
            <div className="bg-black/40 rounded-lg p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">ความหายาก</p>
              <p className={`text-sm font-bold ${
                card.rarity === 'Legendary' ? 'text-yellow-400' :
                card.rarity === 'Epic' ? 'text-purple-400' :
                card.rarity === 'Rare' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {card.rarity}
              </p>
            </div>
          </div>

          {/* Type & Faction */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 bg-black/40 text-gray-300 px-3 py-1.5 rounded-lg text-sm">
              <Icon size={16} />
              {card.type}
            </span>
            <span className="bg-marvel-red/20 text-marvel-red border border-marvel-red/40 px-3 py-1.5 rounded-lg text-sm font-semibold">
              {card.faction}
            </span>
            {card.deck_group && (
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-3 py-1.5 rounded-lg text-sm font-semibold">
                {card.deck_group}
              </span>
            )}
            {card.battle_style && (
              <span className="bg-purple-500/20 text-purple-400 border border-purple-500/40 px-3 py-1.5 rounded-lg text-sm">
                {card.battle_style}
              </span>
            )}
          </div>

          {/* Ability Text */}
          {card.ability_text && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">ความสามารถ</h3>
              <p className="text-white leading-relaxed">{card.ability_text}</p>
            </div>
          )}

          {/* Unity Text */}
          {card.unity_text && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">🤝 Unity</h3>
              <p className="text-yellow-200 leading-relaxed">{card.unity_text}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">คำอธิบาย</h3>
            <p className="text-white leading-relaxed">{card.description}</p>
            {card.descriptionTh && card.descriptionTh !== card.description && (
              <p className="text-gray-400 text-sm leading-relaxed">{card.descriptionTh}</p>
            )}
          </div>

          {/* Keywords */}
          {card.keywords && card.keywords.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">คีย์เวิร์ด</h3>
              <div className="bg-marvel-red/10 text-marvel-red border border-marvel-red/30 px-3 py-2 rounded-lg text-sm">
                {card.keywords}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
