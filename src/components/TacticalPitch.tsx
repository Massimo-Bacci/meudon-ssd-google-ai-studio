import React from 'react';
import { Player, TeamType } from '../types/football';
import { Shuffle, ArrowLeftRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface TacticalPitchProps {
  players: Player[];
  terrain?: string;
  onSlotClick: () => void;
  onSwitchTeam: (playerId: string, currentTeam: TeamType) => void;
  onShuffleTeams?: () => void;
  isOrganizer: boolean;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  players,
  terrain,
  onSlotClick,
  onSwitchTeam,
  onShuffleTeams,
  isOrganizer,
}) => {
  const activePlayers = players.filter((p) => !p.isWaitingList);
  
  // Separate players by team, assigning any unassigned player to the smaller team
  const rawTeamA = activePlayers.filter((p) => p.team === 'A');
  const rawTeamB = activePlayers.filter((p) => p.team === 'B');
  const unassigned = activePlayers.filter((p) => !p.team || p.team === 'unassigned');

  const teamAPlayers: Player[] = [...rawTeamA];
  const teamBPlayers: Player[] = [...rawTeamB];

  // Distribute any unassigned players
  unassigned.forEach((p) => {
    if (teamAPlayers.length <= teamBPlayers.length) {
      teamAPlayers.push(p);
    } else {
      teamBPlayers.push(p);
    }
  });

  // Calculate missing spots from 10 players total
  const spotsAvailable = Math.max(0, 10 - activePlayers.length);

  // Dynamic slots for Team A: always include all team A players + free slots if space remains
  const teamAList: (Player | null)[] = [...teamAPlayers];
  const targetSlotsA = Math.max(5, teamAPlayers.length);
  const neededFreeA = Math.max(0, 5 - teamAPlayers.length);
  const addFreeA = Math.min(neededFreeA, spotsAvailable);
  for (let i = 0; i < addFreeA; i++) {
    teamAList.push(null);
  }

  // Dynamic slots for Team B: always include all team B players + free slots if space remains
  const teamBList: (Player | null)[] = [...teamBPlayers];
  const targetSlotsB = Math.max(5, teamBPlayers.length);
  const remainingSpotsForB = Math.max(0, spotsAvailable - addFreeA);
  const neededFreeB = Math.max(0, 5 - teamBPlayers.length);
  const addFreeB = Math.min(neededFreeB, remainingSpotsForB);
  for (let i = 0; i < addFreeB; i++) {
    teamBList.push(null);
  }

  const isAsymmetric = teamAPlayers.length !== teamBPlayers.length && activePlayers.length > 1;

  return (
    <section id="pitch" className="bg-[#11171E] rounded-3xl border border-white/10 p-4 sm:p-6 overflow-hidden">
      {/* Header with Title and Team Balancer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Composition du match (5 vs 5)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tabular-nums">
              {activePlayers.length}/10 Titulaires
            </span>
            {terrain && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-extrabold">
                🏟️ {terrain}
              </span>
            )}
            {isAsymmetric && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{teamAPlayers.length} vs {teamBPlayers.length}</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualisation tactique du Five. Cliquez sur "Changer" pour transférer un joueur d'une équipe à l'autre.
          </p>
        </div>

        {activePlayers.length > 1 && onShuffleTeams && (
          <button
            onClick={onShuffleTeams}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            title="Tirer au sort et rééquilibrer les deux équipes 5 contre 5"
          >
            <Shuffle className="w-4 h-4 text-emerald-400" />
            <span>Équilibrer les équipes</span>
          </button>
        )}
      </div>

      {/* The 5-a-side Football Pitch Field */}
      <div className="relative w-full rounded-2xl bg-gradient-to-r from-[#0c3823] via-[#0f462c] to-[#0c3823] border-4 border-white/30 shadow-inner overflow-hidden p-3 sm:p-6 min-h-[380px] flex items-center">
        {/* Pitch Turf Pattern Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.06)_40px,rgba(255,255,255,0.06)_80px)]" />

        {/* Pitch Markings: Center Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/40 pointer-events-none" />

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 h-28 sm:h-36 rounded-full border border-white/40 pointer-events-none flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white/50" />
        </div>

        {/* Goal Areas Left & Right */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 sm:w-16 h-36 sm:h-48 border-r border-t border-b border-white/40 rounded-r-xl pointer-events-none" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 sm:w-16 h-36 sm:h-48 border-l border-t border-b border-white/40 rounded-l-xl pointer-events-none" />

        {/* Two Teams Grid Overlay */}
        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Team A (Chasubles Jaunes / Neon) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-lime-400 shadow-md shadow-lime-400/50" />
                <span className="text-xs sm:text-sm font-extrabold text-lime-300 uppercase tracking-wider">
                  Équipe A (Chasubles)
                </span>
              </div>
              <span className={`text-xs font-mono font-bold ${teamAPlayers.length > 5 ? 'text-amber-300' : 'text-lime-400'}`}>
                {teamAPlayers.length} joueur{teamAPlayers.length > 1 ? 's' : ''} {teamAPlayers.length > 5 && '(surplus)'}
              </span>
            </div>

            <div className="space-y-2">
              {teamAList.map((player, idx) => (
                <PlayerPitchSlot
                  key={`teamA_${idx}_${player?.id || `empty_${idx}`}`}
                  player={player}
                  teamLabel="A"
                  accentClass="bg-lime-400/10 text-lime-300 border-lime-400/30 hover:border-lime-400"
                  badgeClass="bg-lime-400 text-slate-950"
                  onSlotClick={onSlotClick}
                  onSwitchTeam={() => player && onSwitchTeam(player.id, 'A')}
                />
              ))}
            </div>
          </div>

          {/* Team B (Sans Chasubles / Cyan) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
                <span className="text-xs sm:text-sm font-extrabold text-cyan-300 uppercase tracking-wider">
                  Équipe B (No Chasuble)
                </span>
              </div>
              <span className={`text-xs font-mono font-bold ${teamBPlayers.length > 5 ? 'text-amber-300' : 'text-cyan-400'}`}>
                {teamBPlayers.length} joueur{teamBPlayers.length > 1 ? 's' : ''} {teamBPlayers.length > 5 && '(surplus)'}
              </span>
            </div>

            <div className="space-y-2">
              {teamBList.map((player, idx) => (
                <PlayerPitchSlot
                  key={`teamB_${idx}_${player?.id || `empty_${idx}`}`}
                  player={player}
                  teamLabel="B"
                  accentClass="bg-cyan-400/10 text-cyan-300 border-cyan-400/30 hover:border-cyan-400"
                  badgeClass="bg-cyan-400 text-slate-950"
                  onSlotClick={onSlotClick}
                  onSwitchTeam={() => player && onSwitchTeam(player.id, 'B')}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface PlayerPitchSlotProps {
  player: Player | null;
  teamLabel: TeamType;
  accentClass: string;
  badgeClass: string;
  onSlotClick: () => void;
  onSwitchTeam: () => void;
}

const PlayerPitchSlot: React.FC<PlayerPitchSlotProps> = ({
  player,
  teamLabel,
  accentClass,
  badgeClass,
  onSlotClick,
  onSwitchTeam,
}) => {
  if (!player) {
    return (
      <button
        onClick={onSlotClick}
        className="w-full min-h-[46px] rounded-xl border border-dashed border-white/25 bg-black/30 hover:bg-black/50 hover:border-white/40 flex items-center justify-center gap-1.5 text-xs text-white/70 hover:text-white transition-all cursor-pointer group"
      >
        <span className="text-emerald-400 font-bold group-hover:scale-110 transition-transform">+</span>
        <span className="font-medium">Place libre</span>
      </button>
    );
  }

  const isPaid = player.paymentStatus === 'paid';

  return (
    <div
      className={`w-full min-h-[46px] rounded-xl border backdrop-blur-md px-3 py-1.5 flex items-center justify-between gap-2 shadow-sm transition-all ${accentClass}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${badgeClass}`}>
          {player.name.charAt(0).toUpperCase()}
        </span>
        <div className="truncate">
          <p className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
            {player.name}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-slate-300">
            {isPaid ? (
              <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Payé
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-amber-300 font-medium">
                <Clock className="w-2.5 h-2.5" />
                {player.paymentMethod === 'cash' ? 'Espèces sur place' : 'En attente'}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onSwitchTeam}
        className="min-h-[32px] px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/60 text-[10px] font-semibold text-slate-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0 border border-white/10"
        title={`Changer vers l'équipe ${teamLabel === 'A' ? 'B' : 'A'}`}
      >
        <ArrowLeftRight className="w-3 h-3 text-emerald-400" />
        <span>Changer d'équipe</span>
      </button>
    </div>
  );
};
