import React from 'react';
import { Player } from '../types/football';
import { CheckCircle2, Clock, Trash2, ArrowUpRight, DollarSign } from 'lucide-react';

interface RosterListProps {
  players: Player[];
  onUnsubscribeClick: (player: Player) => void;
  onPromoteClick?: (playerId: string) => void;
  onTogglePayment?: (playerId: string, currentStatus: Player['paymentStatus']) => void;
  onShareWhatsAppAlert?: () => void;
  isOrganizer: boolean;
}

export const RosterList: React.FC<RosterListProps> = ({
  players,
  onUnsubscribeClick,
  onPromoteClick,
  onTogglePayment,
  onShareWhatsAppAlert,
  isOrganizer,
}) => {
  const activePlayers = players.filter((p) => !p.isWaitingList);
  const waitingList = players.filter((p) => p.isWaitingList);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Active 10-Player Roster Column */}
      <section id="roster" className="lg:col-span-8 bg-[#11171E] rounded-3xl border border-white/10 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Les 10 Titulaires
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tabular-nums">
                {activePlayers.length} / 10
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Joueurs officiellement inscrits avec paiement validé ou en espèces sur place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activePlayers.length === 10 ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Effectif Complet
              </span>
            ) : onShareWhatsAppAlert ? (
              <button
                onClick={onShareWhatsAppAlert}
                className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Partager l'alerte de places disponibles sur le groupe WhatsApp"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span>Alerter le groupe ({10 - activePlayers.length} dispo)</span>
              </button>
            ) : null}
          </div>
        </div>

        {activePlayers.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
            <p className="text-sm font-semibold text-slate-300">Aucun titulaire pour le moment</p>
            <p className="text-xs text-slate-500 mt-1">Sois le premier à réserver ta place pour dimanche !</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activePlayers.map((player, index) => {
              const isPaid = player.paymentStatus === 'paid';
              return (
                <div
                  key={player.id}
                  className="rounded-2xl bg-[#17202A] border border-white/5 hover:border-white/15 px-3.5 sm:px-4 py-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Position Number */}
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-slate-400 shrink-0 tabular-nums">
                      {index + 1}
                    </span>

                    {/* Player Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-bold text-white truncate">
                          {player.name}
                        </p>
                        {player.team === 'A' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-300 border border-lime-400/30">
                            Chasuble
                          </span>
                        )}
                        {player.team === 'B' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                            Sans Chasuble
                          </span>
                        )}
                      </div>

                      {/* Payment Tag */}
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="text-slate-400 font-medium capitalize">
                          {player.paymentMethod === 'paypal' && 'PayPal'}
                          {player.paymentMethod === 'revolut' && 'Revolut'}
                          {player.paymentMethod === 'cash' && 'Espèces en main'}
                          {player.paymentMethod === 'none' && 'Gratuit'}
                        </span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        {isPaid ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Paiement validé
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            À régler sur place
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOrganizer && onTogglePayment && (
                      <button
                        onClick={() => onTogglePayment(player.id, isPaid ? 'pending' : 'paid')}
                        className={`min-h-[36px] px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                          isPaid
                            ? 'bg-white/5 hover:bg-white/10 text-slate-400'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                        }`}
                        title={isPaid ? 'Marquer comme non payé' : 'Confirmer encaissement espèces'}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isPaid ? 'Payé' : 'Encaisser'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onUnsubscribeClick(player)}
                      className="min-h-[36px] px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Se désinscrire et libérer la place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Désinscription</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Waiting List Column */}
      <section id="waitlist" className="lg:col-span-4 bg-[#11171E] rounded-3xl border border-white/10 p-4 sm:p-6 space-y-4">
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Liste d'attente
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold tabular-nums">
              {waitingList.length} en attente
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rejoindre la liste d'attente est 100% gratuit. Les remplaçants sont alertés automatiquement si un titulaire se désiste.
          </p>
        </div>

        {waitingList.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
            <p className="text-xs font-medium text-slate-400">Aucun remplaçant en attente</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Si le match est plein, les nouveaux inscrits apparaissent ici.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {waitingList.map((player, index) => (
              <div
                key={player.id}
                className="rounded-2xl bg-[#17202A] border border-amber-500/20 px-3.5 py-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-bold text-white truncate leading-tight">
                      {player.name}
                    </p>
                    <p className="text-[11px] text-amber-300/80">
                      {index === 0 ? 'Prioritaire au prochain désistement' : `Position ${index + 1}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isOrganizer && onPromoteClick && (
                    <button
                      onClick={() => onPromoteClick(player.id)}
                      className="min-h-[32px] px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Promouvoir en titulaire"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Promouvoir</span>
                    </button>
                  )}

                  <button
                    onClick={() => onUnsubscribeClick(player)}
                    className="min-h-[32px] p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Quitter la liste d'attente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
