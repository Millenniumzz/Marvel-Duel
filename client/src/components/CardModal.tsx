import { X, Swords, Shield, Zap } from 'lucide-react'
import { useState } from 'react'
import type { Card } from '../types'
import { useCardImage } from '../hooks/useCardImage'

interface CardModalProps {
  card: Card
  onClose: () => void
}

type Tab = 'details' | 'multiverse'

export default function CardModal({ card, onClose }: CardModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const { imageUrl, loading } = useCardImage(card)

  // Parse keywords if it's a string
  const keywordsArray = typeof card.keywords === 'string' 
    ? card.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : Array.isArray(card.keywords) ? card.keywords : []

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left: Card Image */}
          <div className="md:w-1/2 bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 flex items-center justify-center relative">
            {/* Cost Badge */}
            <div className="absolute top-4 left-4 w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg border-2 border-red-400">
              <span className="text-3xl font-black text-white">{card.cost}</span>
            </div>

            {/* Star Badge (rarity indicator) */}
            {card.rarity && (
              <div className="absolute top-4 right-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  card.rarity === 'Legendary' ? 'bg-yellow-500/20 border-2 border-yellow-400' :
                  card.rarity === 'Epic' ? 'bg-purple-500/20 border-2 border-purple-400' :
                  card.rarity === 'Rare' ? 'bg-blue-500/20 border-2 border-blue-400' : 
                  'bg-gray-500/20 border-2 border-gray-400'
                }`}>
                  <span className="text-2xl">★</span>
                </div>
              </div>
            )}

            {/* Card Image */}
            {loading ? (
              <div className="relative max-w-md w-full aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
                  <span className="text-white text-lg">Loading image...</span>
                </div>
              </div>
            ) : imageUrl ? (
              <div className="relative max-w-md w-full">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700">
                  <img 
                    src={imageUrl} 
                    alt={card.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if proxy fails
                      e.currentTarget.src = '/placeholder-card.png';
                    }}
                  />
                </div>
                
                {/* Attack/Armor badges at bottom */}
                {card.type === 'Character' && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <div className="bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg border-2 border-red-400">
                      <Swords size={20} className="text-white" />
                      <span className="text-2xl font-black text-white">{card.attack || card.power || 0}</span>
                    </div>
                    <div className="bg-blue-600/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg border-2 border-blue-400">
                      <Shield size={20} className="text-white" />
                      <span className="text-2xl font-black text-white">{card.armor || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-md aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-gray-500">
                <span className="text-6xl">🃏</span>
              </div>
            )}
          </div>

          {/* Right: Details Panel */}
          <div className="md:w-1/2 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 bg-black/30">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-6 py-3 font-bold transition-colors relative ${
                  activeTab === 'details' 
                    ? 'text-white bg-red-600/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Details
                {activeTab === 'details' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('multiverse')}
                className={`flex-1 px-6 py-3 font-bold transition-colors relative ${
                  activeTab === 'multiverse' 
                    ? 'text-white bg-red-600/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Multiverse
                {activeTab === 'multiverse' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === 'details' && (
                <>
                  {/* Card Name */}
                  <div className="mb-6">
                    <h2 className="text-3xl font-black text-white mb-1">{card.name}</h2>
                    {card.nameTh && card.nameTh !== card.name && (
                      <p className="text-gray-400 text-lg">{card.nameTh}</p>
                    )}
                  </div>

                  {/* Keywords Badge */}
                  {keywordsArray.length > 0 && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="text-gray-400 font-semibold">Keyword:</span>
                      <div className="flex flex-wrap gap-2">
                        {keywordsArray.map((keyword, idx) => (
                          <span 
                            key={idx}
                            className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-md font-semibold"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Battle Style Badge */}
                  {card.battle_style && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="text-gray-400 font-semibold">Battle Style:</span>
                      <span className="bg-red-600/20 text-red-300 border border-red-600/40 px-3 py-1.5 rounded-md font-bold flex items-center gap-2">
                        <Swords size={16} />
                        {card.battle_style}
                      </span>
                    </div>
                  )}

                  {/* Ability Text (Triumph) */}
                  {card.ability_text && (
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="mb-2">
                        <span className="text-orange-400 font-bold text-sm">Triumph:</span>
                      </div>
                      <p className="text-white leading-relaxed whitespace-pre-wrap">
                        {card.ability_text}
                      </p>
                    </div>
                  )}

                  {/* Unity Text */}
                  {card.unity_text && (
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-orange-400 font-bold text-sm">Unity:</span>
                        {/* Unity character icons would go here if available */}
                      </div>
                      <p className="text-white leading-relaxed whitespace-pre-wrap">
                        {card.unity_text}
                      </p>
                    </div>
                  )}

                  {/* Description/Flavor Text */}
                  {card.description && (
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-gray-300 text-sm italic leading-relaxed">
                        {card.description}
                      </p>
                      {card.descriptionTh && card.descriptionTh !== card.description && (
                        <p className="text-gray-400 text-xs italic leading-relaxed mt-2">
                          {card.descriptionTh}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Faction & Deck Info */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                    {card.faction && (
                      <span className="bg-blue-600/20 text-blue-300 border border-blue-600/40 px-3 py-1.5 rounded-md text-sm font-semibold">
                        {card.faction}
                      </span>
                    )}
                    {card.deck_group && card.deck_group !== card.faction && (
                      <span className="bg-purple-600/20 text-purple-300 border border-purple-600/40 px-3 py-1.5 rounded-md text-sm font-semibold">
                        {card.deck_group}
                      </span>
                    )}
                    {card.type && (
                      <span className="bg-gray-700/50 text-gray-300 border border-gray-600 px-3 py-1.5 rounded-md text-sm">
                        {card.type}
                      </span>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'multiverse' && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-4">🌌 Multiverse Variants</p>
                  <p className="text-gray-500 text-sm">
                    Coming soon... This section will show different versions of this card.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
