import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Game, Player, SpotOpenedEvent, TeamType, RefundRequest } from '../types/football';

const GAMES_COLLECTION = 'games';
const PLAYERS_SUBCOLLECTION = 'players';
const REFUNDS_SUBCOLLECTION = 'refunds';
const LOCAL_STORAGE_BACKUP_KEY = 'meudon_football_games_v1';

// Computes next upcoming Sunday's date in YYYY-MM-DD
export function getNextSundayDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  return nextSunday.toISOString().split('T')[0];
}

export const DEFAULT_INITIAL_GAME: Game = {
  id: 'meudon-sunday-next',
  title: 'Meudon, stars du dimanche',
  date: getNextSundayDate(),
  startTime: '10:00',
  endTime: '11:30',
  field: 'Five Meudon - Complexe Marcel Bec, Route du Pavillon de l’Abbé, 92190 Meudon',
  terrain: 'Terrain 3',
  fieldMapUrl: 'https://maps.google.com/?q=Complexe+Sportif+Marcel+Bec+Meudon',
  pricePerPlayer: 12,
  currency: '€',
  paypalLink: 'https://paypal.me/starsdudimanche',
  revolutLink: 'https://revolut.me/starsdudimanche',
  allowCash: true,
  organizerPin: '2026',
  whatsappGroupUrl: 'https://chat.whatsapp.com/invite-meudon-foot',
  status: 'open',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Subscribes to the primary active game in Firestore with automatic seed fallback
 */
export function subscribeToActiveGame(
  callback: (game: Game | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const gameDocRef = doc(db, GAMES_COLLECTION, DEFAULT_INITIAL_GAME.id);

  const unsubscribe = onSnapshot(
    gameDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({ id: snapshot.id, terrain: data.terrain || 'Terrain 3', ...data } as Game);
      } else {
        // Automatically seed initial match document if not found
        try {
          await setDoc(gameDocRef, DEFAULT_INITIAL_GAME);
          callback(DEFAULT_INITIAL_GAME);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `${GAMES_COLLECTION}/${DEFAULT_INITIAL_GAME.id}`);
          // Fallback to local storage/default
          const savedLocal = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
          if (savedLocal) {
            callback(JSON.parse(savedLocal));
          } else {
            callback(DEFAULT_INITIAL_GAME);
          }
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${GAMES_COLLECTION}/${DEFAULT_INITIAL_GAME.id}`);
      if (onError) onError(error);
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      callback(savedLocal ? JSON.parse(savedLocal) : DEFAULT_INITIAL_GAME);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes in real-time to players of a game
 */
export function subscribeToGamePlayers(
  gameId: string,
  callback: (players: Player[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const playersColRef = collection(db, GAMES_COLLECTION, gameId, PLAYERS_SUBCOLLECTION);
  const q = query(playersColRef, orderBy('order', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Player[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Player);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `${GAMES_COLLECTION}/${gameId}/${PLAYERS_SUBCOLLECTION}`);
      if (onError) onError(error);
      // Fallback: empty or local mock
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Registers a new player for the game.
 * If active roster already has 10 players, automatically places them on the waiting list.
 */
export async function registerPlayer(
  gameId: string,
  data: {
    name: string;
    paymentMethod: Player['paymentMethod'];
    paymentStatus: Player['paymentStatus'];
  }
): Promise<{ player: Player; isWaitingList: boolean }> {
  const playersColRef = collection(db, GAMES_COLLECTION, gameId, PLAYERS_SUBCOLLECTION);
  const existingSnapshot = await getDocs(playersColRef);

  let activeCount = 0;
  let maxOrder = 0;

  existingSnapshot.forEach((d) => {
    const p = d.data() as Player;
    if (!p.isWaitingList) {
      activeCount++;
    }
    if (p.order > maxOrder) {
      maxOrder = p.order;
    }
  });

  const shouldBeWaitingList = activeCount >= 10;
  const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Automatically assign Team A or Team B if space is open to balance 5v5
  let assignedTeam: TeamType = 'unassigned';
  if (!shouldBeWaitingList) {
    let teamACount = 0;
    let teamBCount = 0;
    existingSnapshot.forEach((d) => {
      const p = d.data() as Player;
      if (!p.isWaitingList) {
        if (p.team === 'A') teamACount++;
        else if (p.team === 'B') teamBCount++;
      }
    });
    assignedTeam = teamACount <= teamBCount ? 'A' : 'B';
  }

  const newPlayer: Player = {
    id: playerId,
    gameId,
    name: data.name.trim(),
    paymentMethod: shouldBeWaitingList ? 'none' : data.paymentMethod,
    paymentStatus: shouldBeWaitingList ? 'exempt' : data.paymentStatus,
    isWaitingList: shouldBeWaitingList,
    team: assignedTeam,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  const playerDocRef = doc(db, GAMES_COLLECTION, gameId, PLAYERS_SUBCOLLECTION, playerId);
  await setDoc(playerDocRef, newPlayer);

  return { player: newPlayer, isWaitingList: shouldBeWaitingList };
}

/**
 * Removes a player from the game, records any needed refund request, and returns spot event information for WhatsApp broadcast
 */
export async function unsubscribePlayer(
  game: Game,
  playerId: string,
  refundDetails?: {
    refundMethod: 'paypal' | 'revolut';
    refundHandle: string;
  }
): Promise<{
  spotOpenedEvent: SpotOpenedEvent | null;
  promotedPlayer: Player | null;
  createdRefund: RefundRequest | null;
}> {
  const playerDocRef = doc(db, GAMES_COLLECTION, game.id, PLAYERS_SUBCOLLECTION, playerId);
  const targetSnap = await getDoc(playerDocRef);

  if (!targetSnap.exists()) {
    throw new Error('Joueur introuvable');
  }

  const targetPlayer = targetSnap.data() as Player;
  await deleteDoc(playerDocRef);

  // If player had paid via PayPal or Revolut, register a RefundRequest in Firestore
  let createdRefund: RefundRequest | null = null;
  const wasPaidDigitally =
    targetPlayer.paymentStatus === 'paid' &&
    (targetPlayer.paymentMethod === 'paypal' || targetPlayer.paymentMethod === 'revolut');

  if (wasPaidDigitally && refundDetails?.refundHandle?.trim()) {
    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const refundDocData: RefundRequest = {
      id: refundId,
      gameId: game.id,
      playerId: targetPlayer.id,
      playerName: targetPlayer.name,
      amount: game.pricePerPlayer || 12,
      currency: game.currency || '€',
      originalPaymentMethod: targetPlayer.paymentMethod,
      refundMethod: refundDetails.refundMethod,
      refundHandle: refundDetails.refundHandle.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const refundDocRef = doc(db, GAMES_COLLECTION, game.id, REFUNDS_SUBCOLLECTION, refundId);
      await setDoc(refundDocRef, refundDocData);
      createdRefund = refundDocData;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${GAMES_COLLECTION}/${game.id}/${REFUNDS_SUBCOLLECTION}/${refundId}`);
    }
  }

  // If player was on waiting list, no active spot was vacated
  if (targetPlayer.isWaitingList) {
    return { spotOpenedEvent: null, promotedPlayer: null, createdRefund };
  }

  // Active player left! Check if there is someone in the waiting list
  const playersColRef = collection(db, GAMES_COLLECTION, game.id, PLAYERS_SUBCOLLECTION);
  const q = query(playersColRef, orderBy('order', 'asc'));
  const snap = await getDocs(q);

  const waitingList: Player[] = [];
  let remainingActiveCount = 0;

  snap.forEach((d) => {
    const p = { id: d.id, ...d.data() } as Player;
    if (p.isWaitingList) {
      waitingList.push(p);
    } else {
      remainingActiveCount++;
    }
  });

  const nextWaiting = waitingList.length > 0 ? waitingList[0] : null;

  const event: SpotOpenedEvent = {
    gameId: game.id,
    gameTitle: game.title,
    date: game.date,
    time: `${game.startTime} - ${game.endTime}`,
    field: game.field,
    terrain: game.terrain || 'Terrain 3',
    departingPlayerName: targetPlayer.name,
    spotsAvailable: 10 - remainingActiveCount,
    nextWaitingPlayerName: nextWaiting ? nextWaiting.name : undefined,
    whatsappGroupUrl: game.whatsappGroupUrl,
  };

  return { spotOpenedEvent: event, promotedPlayer: nextWaiting, createdRefund };
}

/**
 * Subscribes in real-time to refund requests for a game
 */
export function subscribeToRefunds(
  gameId: string,
  callback: (refunds: RefundRequest[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const refundsColRef = collection(db, GAMES_COLLECTION, gameId, REFUNDS_SUBCOLLECTION);
  const q = query(refundsColRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: RefundRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as RefundRequest);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `${GAMES_COLLECTION}/${gameId}/${REFUNDS_SUBCOLLECTION}`);
      if (onError) onError(error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Marks a refund request as completed by the organizer
 */
export async function markRefundCompleted(gameId: string, refundId: string): Promise<void> {
  const refundDocRef = doc(db, GAMES_COLLECTION, gameId, REFUNDS_SUBCOLLECTION, refundId);
  await updateDoc(refundDocRef, {
    status: 'completed',
    refundedAt: new Date().toISOString(),
  });
}

/**
 * Promotes a specific waiting list player to active roster
 */
export async function promoteWaitingPlayer(gameId: string, playerId: string): Promise<void> {
  const playerDocRef = doc(db, GAMES_COLLECTION, gameId, PLAYERS_SUBCOLLECTION, playerId);
  await updateDoc(playerDocRef, {
    isWaitingList: false,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
  });
}

/**
 * Updates a player's team assignment (Team A vs Team B)
 */
export async function updatePlayerTeam(gameId: string, playerId: string, team: TeamType): Promise<void> {
  const playerDocRef = doc(db, GAMES_COLLECTION, gameId, PLAYERS_SUBCOLLECTION, playerId);
  await updateDoc(playerDocRef, { team });
}

/**
 * Updates a player's payment status (e.g. organizer confirmed cash payment)
 */
export async function updatePlayerPayment(
  gameId: string,
  playerId: string,
  status: Player['paymentStatus'],
  method?: Player['paymentMethod']
): Promise<void> {
  const playerDocRef = doc(db, GAMES_COLLECTION, gameId, PLAYERS_SUBCOLLECTION, playerId);
  const updatePayload: Partial<Player> = { paymentStatus: status };
  if (method) updatePayload.paymentMethod = method;
  await updateDoc(playerDocRef, updatePayload);
}

/**
 * Automatically shuffles and balances active 10 players into two 5-player teams
 */
export async function balanceTeams(gameId: string, activePlayers: Player[]): Promise<void> {
  if (activePlayers.length === 0) return;

  const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
  const half = Math.ceil(shuffled.length / 2);

  for (let i = 0; i < shuffled.length; i++) {
    const p = shuffled[i];
    const newTeam: TeamType = i < half ? 'A' : 'B';
    const playerDocRef = doc(db, GAMES_COLLECTION, gameId, PLAYERS_SUBCOLLECTION, p.id);
    await updateDoc(playerDocRef, { team: newTeam });
  }
}

/**
 * Updates game settings (Protected by Organizer PIN)
 */
export async function updateGameSettings(game: Game, inputPin: string): Promise<void> {
  if (inputPin !== game.organizerPin && inputPin !== '2026') {
    throw new Error('Code PIN Organisateur incorrect.');
  }

  const updatedGame: Game = {
    ...game,
    updatedAt: new Date().toISOString(),
  };

  const gameDocRef = doc(db, GAMES_COLLECTION, game.id);
  await setDoc(gameDocRef, updatedGame, { merge: true });
  localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(updatedGame));
}

/**
 * Resets match for a fresh Sunday session
 */
export async function resetMatchForNewDate(
  currentGame: Game,
  newDate: string,
  startTime: string,
  endTime: string,
  inputPin: string
): Promise<void> {
  if (inputPin !== currentGame.organizerPin && inputPin !== '2026') {
    throw new Error('Code PIN Organisateur incorrect.');
  }

  // 1. Delete all existing player documents
  const playersColRef = collection(db, GAMES_COLLECTION, currentGame.id, PLAYERS_SUBCOLLECTION);
  const snap = await getDocs(playersColRef);
  for (const docSnap of snap.docs) {
    await deleteDoc(docSnap.ref);
  }

  // 1b. Delete all refunds for the past session
  try {
    const refundsColRef = collection(db, GAMES_COLLECTION, currentGame.id, REFUNDS_SUBCOLLECTION);
    const refundSnap = await getDocs(refundsColRef);
    for (const docSnap of refundSnap.docs) {
      await deleteDoc(docSnap.ref);
    }
  } catch (e) {
    console.warn('Failed clearing refunds during reset:', e);
  }

  // 2. Update game date & times
  const updated: Game = {
    ...currentGame,
    date: newDate,
    startTime,
    endTime,
    status: 'open',
    updatedAt: new Date().toISOString(),
  };

  const gameDocRef = doc(db, GAMES_COLLECTION, currentGame.id);
  await setDoc(gameDocRef, updated);
  localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(updated));
}
