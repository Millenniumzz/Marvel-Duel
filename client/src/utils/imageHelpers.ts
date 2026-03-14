/**
 * Image URL helpers
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get card image URL by card number (NEW METHOD)
 * Fetches image URL from backend API using card_number
 * 
 * @param cardNumber - The card number (e.g., "0645", "0001")
 * @returns Promise<string> - The image URL or empty string if not found
 */
export async function getCardImageByNumber(cardNumber: string | undefined): Promise<string> {
  if (!cardNumber) return '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/images/card/${cardNumber}`);
    
    if (!response.ok) {
      console.warn(`Card image not found for card number: ${cardNumber}`);
      return '';
    }
    
    const data = await response.json();
    return data.imageUrl || '';
  } catch (error) {
    console.error('Error fetching card image:', error);
    return '';
  }
}

/**
 * Get proxied card image URL by card number
 * Combines getCardImageByNumber + proxy
 * 
 * @param cardNumber - The card number (e.g., "0645", "0001")
 * @returns Promise<string> - The proxied image URL
 */
export async function getProxiedCardImageByNumber(cardNumber: string | undefined): Promise<string> {
  if (!cardNumber) return '';
  
  const imageUrl = await getCardImageByNumber(cardNumber);
  if (!imageUrl) return '';
  
  return getProxiedImageUrl(imageUrl);
}

/**
 * Get proxied image URL
 * Converts direct Wikia URL to use our backend proxy
 */
export function getProxiedImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return '';
  
  // If already using proxy, return as-is
  if (imageUrl.startsWith('/api/images/proxy')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // If it's a Wikia URL, proxy it
  if (imageUrl.startsWith('https://static.wikia.nocookie.net/')) {
    return `${API_BASE_URL}/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
  }
  
  // Otherwise return original
  return imageUrl;
}

/**
 * Get card image with fallback (LEGACY - uses image_url field)
 */
export function getCardImageUrl(card: { image?: string; name?: string }): string {
  const proxiedUrl = getProxiedImageUrl(card.image);
  return proxiedUrl || '/placeholder-card.png';
}

/**
 * Get card image using card_number field (RECOMMENDED)
 * This is the new way - uses card_number instead of image_url
 */
export async function getCardImageUrlByNumber(card: { 
  card_number?: string; 
  image?: string; 
  name?: string 
}): Promise<string> {
  // Try using card_number first (new method)
  if (card.card_number) {
    const imageUrl = await getProxiedCardImageByNumber(card.card_number);
    if (imageUrl) return imageUrl;
  }
  
  // Fallback to legacy method if no card_number
  return getCardImageUrl(card);
}
