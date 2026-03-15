import {X, Swords, Shield} from 'lucide-react'
import { useState } from 'react'
import type { Card } from '../types'
import { useCardImage } from '../hooks/useCardImage'
import { BATTLE_STYLE_ICONS } from '../constants/icons'

const BATTLE_STYLE_COLORS: Record<string, string> = {
  Attack: 'bg-red-600/20 text-red-300 border-2 border-red-500',
  Guardian: 'bg-blue-600/20 text-blue-300 border-2 border-blue-500',
  Support: 'bg-yellow-600/20 text-yellow-300 border-2 border-yellow-500',
  Pow: 'bg-purple-600/20 text-purple-300 border-2 border-purple-500',
  'Tactics Card': 'bg-green-600/20 text-green-300 border-2 border-green-500',
}

const TYPE_COLORS: Record<string, string> = {
  Character: 'bg-red-500/20 text-red-300 border border-red-500/50',
  Equipment: 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
  Pow: 'bg-purple-500/20 text-purple-300 border border-purple-500/50',
  'Tactics Card': 'bg-green-500/20 text-green-300 border border-green-500/50',
  Action: 'bg-green-500/20 text-green-300 border border-green-500/50',
}

// Keywords to highlight in ability text (yellow)
const KEYWORD_MECHANICS = [
  'Invocation', 'Unity', 'Last Words', 'Bounty', 'Bounty Hunter', 'Triumph',
  'Assault', 'Defeat', 'Stunned', 'Tried and True', 'Decay', 'Guard',
  'Iron Will', 'Retaliate', 'Burst', 'Awaken', 'Pierce', 'Collection',
  'Illusion', 'Critical Hit', 'Reinforcement', 'Assemble', 'Annihilate',
  'Speed Strike', 'Lore', 'Special Action', 'Forerunner', 'Visionary',
  'Cloaked', 'Puncture', 'Flanker', 'Enhance', 'unique effect', 'Teleport',
  'Inhibited', 'Beast', 'Sacrifice', 'Maverick', 'Quest', 'Inhibition Layer',
  'Lock-On', 'Alpha Power', 'Ranged', 'Intelligence', 'Time reversion',
  'Inspire', 'Ongoing', 'Resurrect', 'Big Idea', 'Genius Idea', 'Triple Alliance',
  'Magnetic Equipment', 'Magnetic Warrior', 'On Reveal', 'Miracle', 'Infinity Stones',
  'Surge', 'Shark Treasure','United Front',
  // Special Character names
  'Groot Character', 'Thor Character', 'Frost Character', 'Spider-Man Character',
  'Vishanti Character', 'Scarlet Witch Character'
]

// Faction names to highlight in ability text (blue)
const FACTION_KEYWORDS = [
  'GotG', 'Asgardian', 'Intergalactic war', 'Stark Industries', 'Spider-Verse',
  'Marvel Knight', 'Agents', 'Mystic', 'Dark Dimension', 'Eternals',
  'X-Men', 'Brotherhood', 'Deadpool Corps', 'Avengers', 'S.H.I.E.L.D',
  'Hydra', 'Black Order', 'WotS', 'Fantastic Four'
]

// Battle Style keywords to highlight (separate colors)
const BATTLE_STYLE_KEYWORDS = [
  { keyword: 'Tactics Card', color: 'text-green-400' },
  { keyword: 'Attack', color: 'text-red-400' },
  { keyword: 'Guardian', color: 'text-blue-400' },
  { keyword: 'Support', color: 'text-yellow-400' },
  { keyword: 'Pow', color: 'text-purple-400' }
]



// Helper function to highlight keywords in text
const highlightKeywords = (text: string) => {
  if (!text) return null
  
  let processedText = text
  const replacements: { keyword: string; placeholder: string; originalMatch: string; colorClass: string }[] = []
  let placeholderIndex = 0
  
  // Sort all keywords by length (longest first) to avoid partial matches
  const allKeywords = [
    ...KEYWORD_MECHANICS.map(k => ({ keyword: k, colorClass: 'text-yellow-400 font-bold', useWordBoundary: true })),
    ...FACTION_KEYWORDS.map(k => ({ keyword: k, colorClass: 'text-cyan-400 font-bold', useWordBoundary: false })),
    ...BATTLE_STYLE_KEYWORDS.map(k => ({ keyword: k.keyword, colorClass: `${k.color} font-bold`, useWordBoundary: true }))
  ].sort((a, b) => b.keyword.length - a.keyword.length)
  
  // Replace keywords with placeholders
  allKeywords.forEach(({ keyword, colorClass, useWordBoundary }) => {
    // For special character names, create variations
    const isSpecialChar = keyword.includes(' Character')
    const patterns = isSpecialChar 
      ? [keyword + 's', keyword] // Try plural first, then singular
      : [keyword]
    
    patterns.forEach(pattern => {
      // Case-insensitive global replace with optional word boundary
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regexPattern = useWordBoundary ? `\\b${escapedPattern}\\b` : escapedPattern
      const regex = new RegExp(regexPattern, 'gi')
      
      let match
      while ((match = regex.exec(processedText)) !== null) {
        const placeholder = `__KW${placeholderIndex}__`
        const matchedText = match[0]
        
        // Replace this occurrence
        processedText = processedText.substring(0, match.index) + 
                       placeholder + 
                       processedText.substring(match.index + matchedText.length)
        
        replacements.push({ 
          keyword: matchedText, 
          placeholder, 
          originalMatch: matchedText,
          colorClass
        })
        
        placeholderIndex++
        
        // Reset regex after replacement
        regex.lastIndex = 0
      }
    })
  })
  
  // Split text and create elements
  const parts = processedText.split(/(__KW\d+__)/)
  
  return (
    <>
      {parts.map((part, index) => {
        const replacement = replacements.find(r => r.placeholder === part)
        if (replacement) {
          return (
            <span key={index} className={replacement.colorClass}>
              {replacement.keyword}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}

// Helper function to get display type
const getDisplayType = (card: Card): string => {
  return card.type
}

const getBattleStyle = (card: Card): string => {
  return card.battle_style || ''
}

interface CardModalProps {
  card: Card
  onClose: () => void
}

type Tab = 'details' | 'multiverse'

export default function CardModal({ card, onClose }: CardModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const { imageUrl, loading } = useCardImage(card)

  // Get display type based on card type and battle_style
  const displayType = getDisplayType(card)
  const battleStyle = getBattleStyle(card)
  const IconBS = BATTLE_STYLE_ICONS[battleStyle] || Shield

  // Parse keywords if it's a string
  const keywordsArray = typeof card.keywords === 'string' 
    ? card.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : Array.isArray(card.keywords) ? card.keywords : []
  
  const battleStyleColor = card.battle_style ? BATTLE_STYLE_COLORS[card.battle_style] : null
  
  // Check if this is a special character (has "Character" suffix)
  const isSpecialCharacter = card.name && card.name.includes(' Character')
  const displayName = isSpecialCharacter ? card.name.replace(' Character', '') : card.name

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
            <div className="absolute top-4 left-1 w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg border-2 border-red-400">
              <span className="text-3xl font-black text-white">{card.cost}</span>
            </div>


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
                    className="w-full h-full object-contain bg-gradient-to-br from-gray-800 to-black"
                    onError={(e) => {
                      // Fallback to placeholder if proxy fails
                      e.currentTarget.src = '/placeholder-card.png';
                    }}
                  />
                </div>
                
                {/* Attack/Armor badges at bottom */}
                {displayType === 'Character' && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <div className="bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg border-2 border-red-400">
                      <Swords size={20} className="text-white" />
                      <span className="text-2xl font-black text-white">{card.attack || 0}</span>
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
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'details' && (
                <>
                  {/* Card Name */}
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-3xl font-black text-white leading-tight">{displayName}</h2>
                      {isSpecialCharacter && (
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-black tracking-wider shadow-lg">
                          ⚡ SPECIAL CHARACTER
                        </span>
                      )}
                    </div>
                    {card.nameTh && card.nameTh !== card.name && (
                      <p className="text-gray-400 text-lg mt-1">{card.nameTh}</p>
                    )}
                  </div>

                  {/* Battle Style Badge - More prominent */}
                  {card.battle_style && battleStyleColor && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-semibold text-sm">Battle Style:</span>
                      <span className={`px-4 py-2 rounded-lg font-bold text-base ${battleStyleColor} flex items-center gap-2`}>
                        <IconBS size={18} />
                        {card.battle_style}
                      </span>
                    </div>
                  )}

                  {/* Ability Text  - More prominent */}
                  {(card.ability || card.ability_text) && (
                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 rounded-xl p-5 border-2 border-orange-700/50 shadow-lg">
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {highlightKeywords(card.ability || card.ability_text || '')}
                      </p>
                    </div>
                  )}

                  {/* Sub Skill 1 */}
                  {card.sub_skill_1 && (
                    <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-950/30 rounded-xl p-5 border-2 border-cyan-700/50 shadow-lg">
                      <div className="mb-1 flex items-center gap-2">
                      </div>
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {highlightKeywords(card.sub_skill_1)}
                      </p>
                    </div>
                  )}

                  {/* Sub Skill 2 */}
                  {card.sub_skill_2 && (
                    <div className="bg-gradient-to-br from-teal-900/30 to-teal-950/30 rounded-xl p-5 border-2 border-teal-700/50 shadow-lg">
                      <div className="mb-3 flex items-center gap-2">
                      </div>
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {highlightKeywords(card.sub_skill_2)}
                      </p>
                    </div>
                  )}

                  {/* Unity Effect - Only show if has_unity is true */}
                  {card.has_unity && (card.unity_effect || card.unity_text) && (
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 rounded-xl p-5 border-2 border-purple-700/50 shadow-lg">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-400 font-black text-base tracking-wide">UNITY</span>
                      </div>
                      {card.unity_member && (
                        <div className="mb-3 text-purple-300 text-sm space-y-1">
                          {Array.isArray(card.unity_member) ? (
                            card.unity_member.map((member, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-purple-500">•</span>
                                <span>{member}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-500">•</span>
                              <span>{card.unity_member}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {highlightKeywords(card.unity_effect || card.unity_text || '')}
                      </p>
                    </div>
                  )}

                  {/* Unity Effect 2 */}
                  {card.has_unity && card.unity_effect_2 && (
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 rounded-xl p-5 border-2 border-purple-700/50 shadow-lg">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-400 font-black text-base tracking-wide">UNITY 2</span>
                      </div>
                      {card.unity_member_2 && (
                        <div className="mb-3 text-purple-300 text-sm space-y-1">
                          {Array.isArray(card.unity_member_2) ? (
                            card.unity_member_2.map((member, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-purple-500">•</span>
                                <span>{member}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-500">•</span>
                              <span>{card.unity_member_2}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {highlightKeywords(card.unity_effect_2)}
                      </p>
                    </div>
                  )}

                  {/* Unity Effect 3 */}
                  {card.has_unity && card.unity_effect_3 && (
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 rounded-xl p-5 border-2 border-purple-700/50 shadow-lg">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-400 font-black text-base tracking-wide">UNITY 3</span>
                      </div>
                      {card.unity_member_3 && (
                        <div className="mb-3 text-purple-300 text-sm space-y-1">
                          {Array.isArray(card.unity_member_3) ? (
                            card.unity_member_3.map((member, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-purple-500">•</span>
                                <span>{member}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-500">•</span>
                              <span>{card.unity_member_3}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {highlightKeywords(card.unity_effect_3)}
                      </p>
                    </div>
                  )}

                  {/* Keywords */}
                  {keywordsArray.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-300 font-bold text-sm">KEYWORDS</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {keywordsArray.map((keyword, idx) => (
                          <span 
                            key={idx}
                            className="bg-blue-600/20 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-lg font-semibold text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
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
                    {card.rarity && (
                      <span className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                        card.rarity.toLowerCase() === 'multiverse'
                          ? 'bg-pink-600/20 text-pink-300 border border-pink-600/40'
                          : card.rarity.toLowerCase() === 'legendary'
                          ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/40'
                          : card.rarity.toLowerCase() === 'epic'
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-600/40'
                          : card.rarity.toLowerCase() === 'rare'
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-600/40'
                          : 'bg-gray-600/20 text-gray-300 border border-gray-600/40' // Common
                      }`}>
                        {card.rarity}
                      </span>
                    )}
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
                    {displayType &&(
                      <span className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                        TYPE_COLORS[displayType] || 'bg-gray-700/50 text-gray-300 border border-gray-600'
                      }`}>
                        {displayType}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
