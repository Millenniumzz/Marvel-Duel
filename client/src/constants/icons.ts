import { Zap, Shield, Swords, HandFist, Flag, CircleArrowOutDownRight, Sword, User } from 'lucide-react'

// Battle Style Icons
export const BATTLE_STYLE_ICONS: Record<string, typeof Swords> = {
  Attack: HandFist,
  Guardian: Shield,
  Support: Flag,
  Pow: Zap,
  'Tactics Card': CircleArrowOutDownRight,
}

// Type Icons
export const TYPE_ICONS: Record<string, typeof Swords> = {
  Character: User,
  Equipment: Sword,
  Pow: Zap,
  'Tactics Card': CircleArrowOutDownRight,
}

// Faction Colors
export const FACTION_COLORS: Record<string, string> = {
  // Core Factions
  Agents: 'text-blue-400 bg-blue-900/30 border-blue-700',
  Asgardian: 'text-cyan-400 bg-cyan-900/30 border-cyan-700',
  Avengers: 'text-red-700 bg-blue-800/30 border-blue-600',
  Brotherhood: 'text-red-400 bg-red-900/30 border-red-700',
  Collaboration: 'text-teal-400 bg-teal-900/30 border-teal-700',
  'Deadpool Corps': 'text-rose-400 bg-rose-900/30 border-rose-700',
  'Dark Dimension': 'text-purple-400 bg-purple-900/30 border-purple-700',
  Eternals: 'text-amber-400 bg-amber-900/30 border-amber-700',
  'Guardians of the Galaxy': 'text-green-400 bg-green-900/30 border-green-700',
  Hydra: 'text-red-600 bg-red-950/30 border-red-800',
  'Intergalactic War': 'text-indigo-400 bg-indigo-900/30 border-indigo-700',
  'Marvel Knights': 'text-gray-400 bg-gray-900/30 border-gray-700',
  Mystics: 'text-violet-400 bg-violet-900/30 border-violet-700',
  Neutral: 'text-slate-400 bg-slate-900/30 border-slate-600',
  Ragnarok: 'text-orange-400 bg-orange-900/30 border-orange-700',
  'S.H.I.E.L.D.': 'text-blue-200 bg-blue-950/30 border-blue-800',
  Special: 'text-pink-400 bg-pink-900/30 border-pink-700',
  'Spider-Verse': 'text-red-400 bg-red-900/30 border-red-700',
  'Stark Industries': 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  'X-Men': 'text-yellow-300 bg-yellow-900/30 border-yellow-600',
}
