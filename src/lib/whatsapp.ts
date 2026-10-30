import { Game, SpotOpenedEvent } from '../types/football';

/**
 * Formats a clean, exciting French announcement for the WhatsApp group
 */
export function buildSpotOpenedMessage(event: SpotOpenedEvent): string {
  const dateFormatted = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const nextUpText = event.nextWaitingPlayerName
    ? `🎯 @${event.nextWaitingPlayerName}, tu es 1er sur la liste d'attente, viens la réclamer en priorité !`
    : `⚡ Premier arrivé, premier servi !`;

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://meudon-stars-du-dimanche.web.app';

  return `⚽ *ALERTE FOOT À 5 — MEUDON, STARS DU DIMANCHE* ⚽

Une place vient tout juste de se libérer pour le match de ce *${dateFormatted}* (${event.time}) !

📍 *Complexe :* ${event.field}
🏟️ *N° de Terrain :* ${event.terrain || 'Terrain 3'}

${nextUpText}

👉 Réserve ta place ici : ${appUrl}
(Seulement 10 places titulaires sur le terrain)`.trim();
}

/**
 * Formats a game announcement message for organizing
 */
export function buildGameInviteMessage(game: Game, playersCount: number): string {
  const dateFormatted = new Date(game.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const remaining = Math.max(0, 10 - playersCount);
  const statusLine = remaining === 0
    ? `🚨 *COMPLET (10/10)* — Les inscriptions suivantes vont en liste d'attente (gratuit).`
    : `🔥 *${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}* sur 10 !`;

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://meudon-stars-du-dimanche.web.app';

  return `⚽ *MATCH DU DIMANCHE — MEUDON* ⚽

📅 *Date :* ${dateFormatted}
⏰ *Horaire :* ${game.startTime} - ${game.endTime}
📍 *Complexe :* ${game.field}
🏟️ *N° de Terrain :* ${game.terrain || 'Terrain 3'}
💰 *Tarif :* ${game.pricePerPlayer} € / joueur (PayPal, Revolut ou Espèces)

${statusLine}

👉 Inscris-toi ici : ${appUrl}`.trim();
}

/**
 * Formats a clean refund notification WhatsApp message for the organizer
 */
export function buildRefundWhatsAppMessage(refund: {
  playerName: string;
  amount: number;
  currency: string;
  refundMethod: 'paypal' | 'revolut';
  refundHandle: string;
  date: string;
}): string {
  const methodLabel = refund.refundMethod === 'paypal' ? 'PayPal' : 'Revolut';
  return `💬 *DEMANDE DE REMBOURSEMENT — MEUDON, STARS DU DIMANCHE* ⚽

Salut ! J'ai dû annuler ma présence pour le match de dimanche (${refund.date}).
Comme j'avais déjà réglé ma part de *${refund.amount} ${refund.currency}*, voici mes coordonnées pour le remboursement :

💳 *Moyen :* ${methodLabel}
👤 *Mon compte / identifiant :* ${refund.refundHandle}
⚽ *Joueur :* ${refund.playerName}

Merci beaucoup d'avance !`.trim();
}

/**
 * Formats a message sent by organizer confirming a refund has been made
 */
export function buildRefundConfirmedMessage(playerName: string, amount: number, currency: string): string {
  return `✅ *REMBOURSEMENT EFFECTUÉ — MEUDON, STARS DU DIMANCHE* ⚽

Salut ${playerName} ! Ton remboursement de *${amount} ${currency}* pour le match a bien été envoyé.

À bientôt sur le terrain !`.trim();
}

/**
 * Creates a universal WhatsApp share link
 */
export function createWhatsAppShareLink(message: string, directPhone?: string): string {
  const encodedText = encodeURIComponent(message);
  if (directPhone) {
    const cleanPhone = directPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  // This URL reliably opens WhatsApp on iOS, Android, and Desktop WhatsApp Web
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Directly launches WhatsApp on mobile and desktop without getting blocked by popup blocker
 */
export function openWhatsAppDirectly(message: string, directPhone?: string): void {
  const url = createWhatsAppShareLink(message, directPhone);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Dispatches a WhatsApp share action:
 * - If groupUrl is provided: copies the message directly to clipboard and opens the WhatsApp group.
 * - If no groupUrl is provided: opens WhatsApp with the message pre-filled via standard share link.
 */
export async function dispatchWhatsAppShare(
  message: string,
  groupUrl?: string,
  directPhone?: string
): Promise<{ openedGroup: boolean; copied: boolean }> {
  let copied = false;
  const hasGroup = !!(groupUrl && groupUrl.trim().length > 0);

  if (hasGroup) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        copied = true;
      }
    } catch {
      // Clipboard write failed or permissions blocked
    }

    const cleanGroupUrl = groupUrl!.trim();
    const anchor = document.createElement('a');
    anchor.href = cleanGroupUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    return { openedGroup: true, copied };
  }

  openWhatsAppDirectly(message, directPhone);
  return { openedGroup: false, copied: false };
}

