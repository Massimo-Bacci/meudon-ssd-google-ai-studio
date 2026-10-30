import React from 'react';
import { Game } from '../types/football';
import { ShieldCheck, Wallet, Clock, Users, Flame, HelpCircle } from 'lucide-react';

interface RulesAndInfoProps {
  game: Game;
}

export const RulesAndInfo: React.FC<RulesAndInfoProps> = ({ game }) => {
  return (
    <section id="rules" className="bg-[#11171E] rounded-3xl border border-white/10 p-5 sm:p-7 space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Règlement & Fonctionnement</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tout ce qu'il faut savoir pour que le match de dimanche à Meudon se passe dans les meilleures conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 10 Players Rule */}
        <div className="p-4 rounded-2xl bg-[#17202A] border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-white">Strictement 10 Joueurs</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pour garantir un 5 vs 5 fluide et intense, les 10 premières inscriptions validées forment l'effectif titulaire. Dès le 11ème, l'inscription bascule en liste d'attente.
          </p>
        </div>

        {/* Card 2: Waiting List & Dropouts */}
        <div className="p-4 rounded-2xl bg-[#17202A] border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-white">Liste d'Attente Gratuite</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Aucun paiement n'est exigé pour être en liste d'attente. Si un titulaire se désiste, une alerte WhatsApp est déclenchée pour le 1er remplaçant disponible.
          </p>
        </div>

        {/* Card 3: Fair-Play Payments & Refund Policy */}
        <div className="p-4 rounded-2xl bg-[#17202A] border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-white">Paiement & Remboursement Garanti</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Règlement de <strong>{game.pricePerPlayer} €</strong> par PayPal, Revolut ou espèces. Si tu as payé et dois annuler ta venue, ton paiement t'est <strong>intégralement remboursé</strong> sur ton tag PayPal ou Revolut.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Fair-play, ponctualité à {game.startTime} et respect du terrain !</span>
        </div>
        <span className="text-slate-400">
          Chasubles & ballons prévus sur place.
        </span>
      </div>
    </section>
  );
};
