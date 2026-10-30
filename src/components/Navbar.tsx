import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenOrganizer: () => void;
  isOrganizerUnlocked: boolean;
  activeCount: number;
  pendingRefundsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOrganizer,
  isOrganizerUnlocked,
  activeCount,
  pendingRefundsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090D11]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a href="#" className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-sm shadow-inner">
            ⚽
          </span>
          <span className="font-extrabold tracking-tight">Meudon, stars du dimanche</span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#pitch" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Terrain 5v5
          </a>
          <a href="#roster" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Titulaires ({activeCount}/10)
          </a>
          <a href="#waitlist" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Liste d'attente
          </a>
          <a href="#rules" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Règlement & Paiements
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenOrganizer}
            className={`min-h-[44px] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 relative ${
              pendingRefundsCount > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : isOrganizerUnlocked
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
            title="Espace Organisateur (Code PIN)"
          >
            {isOrganizerUnlocked ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Actif</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Organisateur</span>
              </>
            )}

            {pendingRefundsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse" title={`${pendingRefundsCount} remboursement(s) en attente`}>
                {pendingRefundsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
