import { useState, useEffect } from 'react';
import { getCardImageUrlByNumber } from '../utils/imageHelpers';
import type { Card } from '../types';

/**
 * Custom hook to load card image URL
 * Supports both card_number (new) and image (legacy)
 */
export function useCardImage(card: Card | null | undefined): {
  imageUrl: string;
  loading: boolean;
  error: boolean;
} {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      if (!card) {
        setImageUrl('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const url = await getCardImageUrlByNumber(card);
        
        if (!cancelled) {
          if (url) {
            setImageUrl(url);
            setError(false);
          } else {
            setImageUrl('');
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading card image:', err);
        if (!cancelled) {
          setError(true);
          setImageUrl('');
          setLoading(false);
        }
      }
    }

    loadImage();

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, [card?.card_number, card?.image, card?.name]); // Re-run when card changes

  return { imageUrl, loading, error };
}
