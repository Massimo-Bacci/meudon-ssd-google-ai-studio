import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Euro, Share2, Users, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { Game } from '../types/football';
import { buildGameInviteMessage, dispatchWhatsAppShare } from '../lib/whatsapp';
import heroPitchImage from '../assets/images/meudon_pitch_hero_1793264521996.jpg';

interface MatchHeaderProps {
  game: Game;
  activeCount: number;
  waitingCount: number;
  onJoinClick: () => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  game,
  activeCount,
  waitingCount,
  onJoinClick,
}) => {
  const isFull = activeCount >= 10;
  const spotsLeft = Math.max(0, 10 - activeCount);
  const [imgSrc, setImgSrc] = useState<string>(heroPitchImage || '/images/meudon_pitch_hero.jpg');
  const [sharedToast, setSharedToast] = useState<string | null>(null);

  // Format date in French
  const formattedDate = new Date(game.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleShareWhatsApp = async () => {
    const message = buildGameInviteMessage(game, activeCount);
    const result = await dispatchWhatsAppShare(message, game.whatsappGroupUrl);
    if (result.openedGroup) {
      setSharedToast('Message copié ! Groupe ouvert');
      setTimeout(() => setSharedToast(null), 3000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#11171E] border border-white/10 shadow-2xl">
      {/* Background Hero Image with Measured Scrim */}
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-gradient-to-br from-[#0c3823] to-[#090D11]">
        <img
          src={imgSrc}
          onError={() => setImgSrc('/images/meudon_pitch_hero.jpg')}
          alt="Terrain de foot synthétique à Meudon"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-90 transform scale-105 transition-transform duration-700 hover:scale-100"
        />
        {/* Measured dark scrim for high contrast WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11171E] via-[#11171E]/70 to-black/30" />

        {/* Top Floating Badge Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Foot à 5 · Dimanche · {game.terrain || 'Terrain 3'}</span>
          </div>

          <div className="flex items-center gap-2">
            {sharedToast && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{sharedToast}</span>
              </span>
            )}
            <button
              onClick={handleShareWhatsApp}
              className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer"
              title={game.whatsappGroupUrl ? "Copier l'invitation et ouvrir le groupe WhatsApp" : "Partager le lien d'inscription sur WhatsApp"}
            >
              <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="hidden sm:inline">
                {game.whatsappGroupUrl ? 'Ouvrir groupe & Inviter' : 'Inviter sur WhatsApp'}
              </span>
              <span className="sm:hidden">
                {game.whatsappGroupUrl ? 'Groupe' : 'Partager'}
              </span>
            </button>
          </div>
        </div>


        {/* Title & Core Date Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
              {game.terrain || 'Terrain 3'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {game.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5 capitalize font-medium">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              {formattedDate}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              {game.startTime} - {game.endTime}
            </span>
          </div>
        </div>
      </div>

      {/* Details & Action Panel */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Information Strip */}
        <div className="md:col-span-8 space-y-3.5">
          {/* Venue Location & Field Number */}
          <div className="flex items-start gap-3 text-slate-300 text-sm">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{game.field}</p>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs">
                  🏟️ {game.terrain || 'Terrain 3'}
                </span>
              </div>
              {game.fieldMapUrl && (
                <a
                  href={game.fieldMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 inline-block"
                >
                  Ouvrir l'itinéraire GPS dans Google Maps →
                </a>
              )}
            </div>
          </div>

          {/* Pricing & Allowed Payment Methods */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Euro className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-bold tabular-nums text-white">
                {game.pricePerPlayer} {game.currency}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ joueur</span>
            </div>

            <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>

            <span className="text-slate-400 font-medium">Paiements acceptés :</span>
            <div className="flex items-center gap-2">
              {game.paypalLink && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">
                  PayPal
                </span>
              )}
              {game.revolutLink && (
                <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-300 font-medium">
                  Revolut
                </span>
              )}
              {game.allowCash && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                  Espèces en main
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right CTA & Roster Status Card */}
        <div className="md:col-span-4 bg-[#17202A] rounded-2xl p-4 border border-white/10 flex flex-col justify-between gap-3">
          {/* Status Meter */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              Effectif du match
            </span>
            <span className="text-sm font-extrabold tabular-nums text-white">
              {activeCount} / 10
            </span>
          </div>

          {/* Progress Bar (0 to 10) */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFull ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (activeCount / 10) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            {isFull ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Match Complet (10/10)
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {spotsLeft} place{spotsLeft > 1 ? 's' : ''} disponible{spotsLeft > 1 ? 's' : ''}
              </span>
            )}

            {waitingCount > 0 && (
              <span className="text-slate-400">
                {waitingCount} en attente
              </span>
            )}
          </div>

          {/* Big Thumb-Friendly Primary CTA Button */}
          <button
            onClick={onJoinClick}
            className={`min-h-[48px] w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] cursor-pointer ${
              isFull
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            {isFull ? (
              <>
                <span>Rejoindre la liste d'attente</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/20">
                  Gratuit
                </span>
              </>
            ) : (
              <>
                <span>Réserver ma place (Titulaire)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/20 tabular-nums">
                  {game.pricePerPlayer} €
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
