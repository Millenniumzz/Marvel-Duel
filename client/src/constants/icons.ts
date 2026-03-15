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
