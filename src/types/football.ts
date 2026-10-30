export type PaymentMethod = 'paypal' | 'revolut' | 'cash' | 'none';
export type PaymentStatus = 'paid' | 'pending' | 'exempt';
export type TeamType = 'A' | 'B' | 'unassigned';

export interface Game {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  field: string; // Complex name e.g. Five Meudon - Complexe Marcel Bec
  terrain: string; // Pitch number e.g. "Terrain 3"
  fieldMapUrl?: string;
  pricePerPlayer: number;
  currency: string;
  paypalLink?: string;
  revolutLink?: string;
  allowCash: boolean;
  organizerPin: string;
  whatsappGroupUrl?: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  gameId: string;
  name: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isWaitingList: boolean;
  team?: TeamType;
  order: number;
  createdAt: string;
}

export interface SpotOpenedEvent {
  gameId: string;
  gameTitle: string;
  date: string;
  time: string;
  field: string;
  terrain: string;
  departingPlayerName: string;
  spotsAvailable: number;
  nextWaitingPlayerName?: string;
  whatsappGroupUrl?: string;
}

export interface RefundRequest {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  amount: number;
  currency: string;
  originalPaymentMethod: PaymentMethod;
  refundMethod: 'paypal' | 'revolut';
  refundHandle: string;
  status: 'pending' | 'completed';
  createdAt: string;
  refundedAt?: string;
}
