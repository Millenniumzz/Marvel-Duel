import axios from 'axios'
import type { Card, CardsResponse, Deck, MetaDeck } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Cards API
export const cardsApi = {
  getCards: (params?: Record<string, any>) => 
    api.get<CardsResponse>('/cards', { params }),
  getCard: (id: string) => 
    api.get<Card>(`/cards/${id}`),
  getFactions: () => 
    api.get<string[]>('/cards/factions'),
}

// Decks API
export const decksApi = {
  getDecks: () => 
    api.get<Deck[]>('/decks'),
  getDeck: (id: string) => 
    api.get<Deck>(`/decks/${id}`),
  saveDeck: (deck: Partial<Deck>) => 
    api.post<Deck>('/decks', deck),
  updateDeck: (id: string, deck: Partial<Deck>) => 
    api.put<Deck>(`/decks/${id}`, deck),
  deleteDeck: (id: string) => 
    api.delete(`/decks/${id}`),
  likeDeck: (id: string) => 
    api.post<{ likes: number }>(`/decks/${id}/like`),
}

// Meta Decks API
export const metaDecksApi = {
  getMetaDecks: (params?: Record<string, any>) => 
    api.get<MetaDeck[]>('/meta-decks', { params }),
  getMetaDeck: (id: string) => 
    api.get<MetaDeck>(`/meta-decks/${id}`),
}

export default api
