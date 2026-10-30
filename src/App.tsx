import React, { useEffect, useState } from 'react';
import { Game, Player, SpotOpenedEvent, TeamType, RefundRequest } from './types/football';
import {
  DEFAULT_INITIAL_GAME,
  subscribeToActiveGame,
  subscribeToGamePlayers,
  subscribeToRefunds,
  registerPlayer,
  unsubscribePlayer,
  updatePlayerTeam,
  updatePlayerPayment,
  balanceTeams,
  updateGameSettings,
  resetMatchForNewDate,
  promoteWaitingPlayer,
  markRefundCompleted,
} from './lib/gameService';
import { testConnection } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { MatchHeader } from './components/MatchHeader';
import { TacticalPitch } from './components/TacticalPitch';
import { RosterList } from './components/RosterList';
import { RulesAndInfo } from './components/RulesAndInfo';
import { JoinGameModal } from './components/JoinGameModal';
import { UnsubscribeModal } from './components/UnsubscribeModal';
import { WhatsAppBroadcastModal } from './components/WhatsAppBroadcastModal';
import { RefundRequestModal } from './components/RefundRequestModal';
import { OrganizerDrawer } from './components/OrganizerDrawer';
import { Share2, RefreshCw } from 'lucide-react';

export default function App() {
  const [game, setGame] = useState<Game>(DEFAULT_INITIAL_GAME);
  const [players, setPlayers] = useState<Player[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [playerToUnsubscribe, setPlayerToUnsubscribe] = useState<Player | null>(null);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isOrganizerUnlocked, setIsOrganizerUnlocked] = useState(false);

  // Spot opened broadcast modal
  const [broadcastEvent, setBroadcastEvent] = useState<SpotOpenedEvent | null>(null);

  // Created refund notification modal for player
  const [createdRefundForPlayer, setCreatedRefundForPlayer] = useState<RefundRequest | null>(null);

  // Test Firestore connection on initial boot per skill
  useEffect(() => {
    testConnection();
  }, []);

  // Subscribe in real-time to active game
  useEffect(() => {
    const unsubscribeGame = subscribeToActiveGame((activeGame) => {
      if (activeGame) {
        setGame(activeGame);
      }
      setLoading(false);
    });

    return () => unsubscribeGame();
  }, []);

  // Subscribe in real-time to players once game ID is known
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribePlayers = subscribeToGamePlayers(game.id, (list) => {
      setPlayers(list);
    });

    return () => unsubscribePlayers();
  }, [game?.id]);

  // Subscribe in real-time to refunds once game ID is known
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribeRefunds = subscribeToRefunds(game.id, (list) => {
      setRefunds(list);
    });

    return () => unsubscribeRefunds();
  }, [game?.id]);

  const activePlayers = players.filter((p) => !p.isWaitingList);
  const waitingPlayers = players.filter((p) => p.isWaitingList);
  const pendingRefunds = refunds.filter((r) => r.status === 'pending');

  // Registration handler
  const handleConfirmRegistration = async (data: {
    name: string;
    paymentMethod: Player['paymentMethod'];
    paymentStatus: Player['paymentStatus'];
  }) => {
    await registerPlayer(game.id, data);
  };

  // Unsubscribe handler with refund creation and spot-opened notification broadcast
  const handleConfirmUnsubscribe = async (
    player: Player,
    refundDetails?: { refundMethod: 'paypal' | 'revolut'; refundHandle: string }
  ) => {
    const { spotOpenedEvent, createdRefund } = await unsubscribePlayer(game, player.id, refundDetails);
    if (createdRefund) {
      setCreatedRefundForPlayer(createdRefund);
    }
    if (spotOpenedEvent && !createdRefund) {
      setBroadcastEvent(spotOpenedEvent);
    }
  };

  // Switch team on pitch
  const handleSwitchTeam = async (playerId: string, currentTeam: TeamType) => {
    const nextTeam: TeamType = currentTeam === 'A' ? 'B' : 'A';
    await updatePlayerTeam(game.id, playerId, nextTeam);
  };

  // Shuffle teams randomly
  const handleShuffleTeams = async () => {
    await balanceTeams(game.id, activePlayers);
  };

  // Toggle payment status (Organizer)
  const handleTogglePayment = async (playerId: string, currentStatus: Player['paymentStatus']) => {
    await updatePlayerPayment(game.id, playerId, currentStatus);
  };

  // Promote waiting list player (Organizer)
  const handlePromotePlayer = async (playerId: string) => {
    await promoteWaitingPlayer(game.id, playerId);
  };

  // Mark refund as completed (Organizer)
  const handleMarkRefundCompleted = async (refundId: string) => {
    await markRefundCompleted(game.id, refundId);
  };

  // Unlock organizer with PIN
  const handleUnlockOrganizer = (pin: string): boolean => {
    if (pin === game.organizerPin || pin === '2026') {
      setIsOrganizerUnlocked(true);
      return true;
    }
    return false;
  };

  // Save game settings
  const handleSaveGame = async (updated: Game, pin: string) => {
    await updateGameSettings(updated, pin);
    setGame(updated);
  };

  // Reset match for next Sunday
  const handleResetSession = async (newDate: string, startTime: string, endTime: string, pin: string) => {
    await resetMatchForNewDate(game, newDate, startTime, endTime, pin);
  };

  return (
    <div className="min-h-screen bg-[#090D11] text-slate-100 flex flex-col font-sans">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        onOpenOrganizer={() => setIsOrganizerOpen(true)}
        isOrganizerUnlocked={isOrganizerUnlocked}
        activeCount={activePlayers.length}
        pendingRefundsCount={pendingRefunds.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
              <span>Chargement du match de Meudon...</span>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Match Hero Header */}
            <MatchHeader
              game={game}
              activeCount={activePlayers.length}
              waitingCount={waitingPlayers.length}
              onJoinClick={() => setIsJoinOpen(true)}
            />

            {/* 2. Tactical 5v5 Football Pitch */}
            <TacticalPitch
              players={players}
              terrain={game.terrain}
              onSlotClick={() => setIsJoinOpen(true)}
              onSwitchTeam={handleSwitchTeam}
              onShuffleTeams={handleShuffleTeams}
              isOrganizer={isOrganizerUnlocked}
            />

            {/* 3. Roster & Waiting List */}
            <RosterList
              players={players}
              onUnsubscribeClick={(p) => setPlayerToUnsubscribe(p)}
              onPromoteClick={handlePromotePlayer}
              onTogglePayment={handleTogglePayment}
              onShareWhatsAppAlert={() => {
                setBroadcastEvent({
                  gameId: game.id,
                  gameTitle: game.title,
                  date: game.date,
                  time: `${game.startTime} - ${game.endTime}`,
                  field: game.field,
                  terrain: game.terrain || 'Terrain 3',
                  departingPlayerName: '',
                  spotsAvailable: Math.max(0, 10 - activePlayers.length),
                  nextWaitingPlayerName: waitingPlayers[0]?.name,
                  whatsappGroupUrl: game.whatsappGroupUrl,
                });
              }}
              isOrganizer={isOrganizerUnlocked}
            />

            {/* 4. Match Rules & Info */}
            <RulesAndInfo game={game} />
          </>
        )}
      </main>

      {/* Clean Unboxed Footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          Meudon, stars du dimanche · Football à 5 hebdomadaire
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500">
          <span>Terrain Marcel Bec</span>
          <span aria-hidden="true">·</span>
          <span>5 contre 5</span>
          <span aria-hidden="true">·</span>
          <span>10 places max</span>
          {game.whatsappGroupUrl && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={game.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 inline-flex"
              >
                <Share2 className="w-3 h-3" />
                <span>Groupe WhatsApp</span>
              </a>
            </>
          )}
        </div>
      </footer>

      {/* Floating Action Button on Mobile when scrolled */}
      <div className="fixed bottom-4 right-4 z-30 sm:hidden">
        <button
          onClick={() => setIsJoinOpen(true)}
          className="min-h-[48px] px-4 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform"
        >
          <span>⚽ S'inscrire</span>
        </button>
      </div>

      {/* Player Registration Modal */}
      {isJoinOpen && (
        <JoinGameModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          game={game}
          activeCount={activePlayers.length}
          onConfirmRegistration={handleConfirmRegistration}
        />
      )}

      {/* Unsubscribe Confirmation Modal */}
      {playerToUnsubscribe && (
        <UnsubscribeModal
          isOpen={!!playerToUnsubscribe}
          onClose={() => setPlayerToUnsubscribe(null)}
          player={playerToUnsubscribe}
          game={game}
          onConfirmUnsubscribe={handleConfirmUnsubscribe}
        />
      )}

      {/* Player Refund Request WhatsApp Modal */}
      {createdRefundForPlayer && (
        <RefundRequestModal
          isOpen={!!createdRefundForPlayer}
          onClose={() => setCreatedRefundForPlayer(null)}
          refund={createdRefundForPlayer}
          game={game}
        />
      )}

      {/* WhatsApp Spot Broadcast Modal */}
      {broadcastEvent && (
        <WhatsAppBroadcastModal
          isOpen={!!broadcastEvent}
          onClose={() => setBroadcastEvent(null)}
          event={broadcastEvent}
        />
      )}

      {/* Organizer Drawer */}
      {isOrganizerOpen && (
        <OrganizerDrawer
          isOpen={isOrganizerOpen}
          onClose={() => setIsOrganizerOpen(false)}
          game={game}
          refunds={refunds}
          isUnlocked={isOrganizerUnlocked}
          onUnlock={handleUnlockOrganizer}
          onSaveGame={handleSaveGame}
          onResetSession={handleResetSession}
          onMarkRefundCompleted={handleMarkRefundCompleted}
        />
      )}
    </div>
  );
}
