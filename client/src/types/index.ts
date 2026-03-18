export type CardType = 'Character' | 'Equipment' | 'Pow' | 'Tactics Card'

export type Faction =
  | 'Avengers'
  | 'Guardians of the Galaxy'
  | 'X-Men'
  | 'Hydra'
  | 'Villains'
  | 'Wakanda'
  | 'Asgardian'
  | 'S.H.I.E.L.D.'
  | 'Neutral'

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'| 'Multiverse'

export interface Card {
  // Core identifiers
  _id: string
  card_id?: string
  record_id?: number
  
  // Names
  name: string
  nameTh?: string
  base_card_name?: string
  display_name?: string
  
  // Faction & Deck
  faction: Faction
  deck_name?: string
  deck_group?: string
  
  // Card Type & Cost
  cost: number
  type: CardType
  
  // Stats
  attack?: number
  armor?: number
  
  // Description & Abilities
  description: string
  descriptionTh?: string
  description_th?: string
  flavor_text?: string
  flavor_text_th?: string
  ability?: string
  ability_text?: string
  sub_skill_1?: string
  sub_skill_2?: string
  
  // Unity
  unity_text?: string
  unity_effect?: string
  unity_member?: string | string[] | null
  unity_effect_2?: string
  unity_member_2?: string | string[] | null
  unity_effect_3?: string
  unity_member_3?: string | string[] | null
  has_unity?: boolean
  
  // Image
  image?: string
  image_url?: string
  card_number?: string  // Card number for automatic image lookup (e.g., "0645", "0001")
  
  // Rarity & Style
  rarity: Rarity
  battle_style?: string
  
  // Keywords
  keywords: string | string[]
  keywords_mechanic?: string[]
  keywords_team?: string[]
  
  // Variant Info
  variant_type?: string
  variant_label?: string
  
  // Status & Meta
  isBanned?: boolean
  availability_status?: string
  patch_version?: string
  source_type?: string
  source_section?: string
  source_url?: string
  inference_confidence?: string
  needs_manual_verification?: boolean
  
  // Flags
  inferred_variant_flag?: boolean
  inferred_multiverse_flag?: boolean
  
  // Timestamps
  createdAt?: string
  updatedAt?: string
  last_verified?: string
  
  // Other
  completeness?: string
  notes?: string
}

export interface DeckCard {
  card: Card
  quantity: number
}

export interface Deck {
  _id: string
  name: string
  description?: string
  faction: string
  cards: DeckCard[]
  totalCards: number
  author: string
  likes: number
  createdAt?: string
  updatedAt?: string
}

export interface MetaDeckCard {
  card: Card
  quantity: number
  role?: string
}

export type Tier = 'S' | 'A' | 'B' | 'C'

export interface MetaDeck {
  _id: string
  name: string
  description?: string
  descriptionTh?: string
  faction: string
  tier: Tier
  winRate: number
  playstyle: string
  cards: MetaDeckCard[]
  coverImage?: string
  patch: string
  createdAt?: string
  updatedAt?: string
}

export interface CardFilters {
  search: string
  faction: string
  cost: string
  type: string
  rarity: string
  battle_style: string
  sort: string
  page: number
  limit: number
}

export interface CardsResponse {
  cards: Card[]
  total: number
  page: number
  totalPages: number
}
