export type CardType = 'Character' | 'Action' | 'Equip'

export type Faction =
  | 'Avengers'
  | 'Guardians of the Galaxy'
  | 'X-Men'
  | 'Hydra'
  | 'Villains'
  | 'Wakanda'
  | 'Asgard'
  | 'S.H.I.E.L.D.'
  | 'Neutral'

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface Card {
  _id: string
  name: string
  nameTh?: string
  faction: Faction
  cost: number
  type: CardType
  power: number
  health: number
  description: string
  descriptionTh?: string
  image?: string
  rarity: Rarity
  keywords: string
  isBanned: boolean
  // New fields from MongoDB
  deck_group?: string
  source_section?: string
  availability_status?: string
  cost_red_gem?: string
  attack?: string
  armor?: string
  battle_style?: string
  ability_text?: string
  unity_text?: string
  has_unity?: string
  source_url?: string
  last_verified?: string
  completeness?: string
  notes?: string
  inferred_variant_flag?: boolean
  inferred_multiverse_flag?: boolean
  createdAt?: string
  updatedAt?: string
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
