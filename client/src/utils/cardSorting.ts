import type { Card } from '../types'

// Helper function to get card type for sorting
export const getCardTypeForSorting = (card: Card): string => {
  return card.type
}

// Helper function to get type sort order
export const getTypeSortOrder = (type: string): number => {
  const order: Record<string, number> = {
    'Character': 1,
    'Equip': 2,
    'Equipment': 2,
    'Pow': 3,
    'Action': 4,  // Tactics Card
    'Tactics Card': 4,
  }
  return order[type] || 999
}

// Helper function to get rarity sort order
export const getRaritySortOrder = (rarity: string): number => {
  const order: Record<string, number> = {
    'Legendary': 1,
    'Epic': 2,
    'Rare': 3,
    'Common': 4,
    'Multiverse': 5,
  }
  return order[rarity] || 999
}

// Helper function to get card ID for sorting
export const getCardIdForSorting = (card: Card): number => {
  // Try card_number first (e.g., "0645" -> 645)
  if (card.card_number) {
    const numStr = card.card_number.replace(/\D/g, '')
    const num = parseInt(numStr, 10)
    if (!isNaN(num)) return num
  }
  
  // Try record_id
  if (card.record_id) {
    return card.record_id
  }
  
  // Try _id if it's numeric
  if (card._id) {
    const num = parseInt(card._id, 10)
    if (!isNaN(num)) return num
  }
  
  return 999999
}

/**
 * Standard card sorting function
 * Order: Cost (asc) → Type → Rarity → Card ID
 */
export const sortCards = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => {
    // 1. Sort by cost (ascending)
    const costDiff = a.cost - b.cost
    if (costDiff !== 0) return costDiff
    
    // 2. Sort by type order (Character → Equipment → Pow → Tactics Card)
    const typeA = getCardTypeForSorting(a)
    const typeB = getCardTypeForSorting(b)
    const typeOrderA = getTypeSortOrder(typeA)
    const typeOrderB = getTypeSortOrder(typeB)
    const typeOrderDiff = typeOrderA - typeOrderB
    if (typeOrderDiff !== 0) return typeOrderDiff
    
    // 3. Sort by rarity (Legendary → Epic → Rare → Common → Multiverse)
    const rarityOrderA = getRaritySortOrder(a.rarity)
    const rarityOrderB = getRaritySortOrder(b.rarity)
    const rarityOrderDiff = rarityOrderA - rarityOrderB
    if (rarityOrderDiff !== 0) return rarityOrderDiff
    
    // 4. Sort by card ID (ascending)
    const cardIdA = getCardIdForSorting(a)
    const cardIdB = getCardIdForSorting(b)
    return cardIdA - cardIdB
  })
}

/**
 * Compare function for sorting cards (used for array.sort)
 */
export const compareCards = (a: Card, b: Card): number => {
  // 1. Sort by cost (ascending)
  const costDiff = a.cost - b.cost
  if (costDiff !== 0) return costDiff
  
  // 2. Sort by type order (Character → Equipment → Pow → Tactics Card)
  const typeA = getCardTypeForSorting(a)
  const typeB = getCardTypeForSorting(b)
  const typeOrderA = getTypeSortOrder(typeA)
  const typeOrderB = getTypeSortOrder(typeB)
  const typeOrderDiff = typeOrderA - typeOrderB
  if (typeOrderDiff !== 0) return typeOrderDiff
  
  // 3. Sort by rarity (Legendary → Epic → Rare → Common → Multiverse)
  const rarityOrderA = getRaritySortOrder(a.rarity)
  const rarityOrderB = getRaritySortOrder(b.rarity)
  const rarityOrderDiff = rarityOrderA - rarityOrderB
  if (rarityOrderDiff !== 0) return rarityOrderDiff
  
  // 4. Sort by card ID (ascending)
  const cardIdA = getCardIdForSorting(a)
  const cardIdB = getCardIdForSorting(b)
  return cardIdA - cardIdB
}
