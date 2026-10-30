import React from 'react';
import { RefundRequest, Game } from '../types/football';
import { X, CheckCircle2, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { buildRefundWhatsAppMessage, openWhatsAppDirectly } from '../lib/whatsapp';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  refund: RefundRequest | null;
  game: Game;
}

export const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  isOpen,
  onClose,
  refund,
  game,
}) => {
  if (!isOpen || !refund) return null;

  const handleSendWhatsAppNotice = () => {
    const message = buildRefundWhatsAppMessage({
      playerName: refund.playerName,
      amount: refund.amount,
      currency: refund.currency,
      refundMethod: refund.refundMethod,
      refundHandle: refund.refundHandle,
      date: game.date,
    });

    openWhatsAppDirectly(message);
    onClose();
  };

  const methodLabel = refund.refundMethod === 'paypal' ? 'PayPal' : 'Revolut';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-[#141C24] border border-white/10 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] absolute top-4 right-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white">
            Désinscription & Remboursement
          </h2>
          <p className="text-xs text-slate-300">
            Ta place a bien été libérée et ta demande de remboursement est enregistrée.
          </p>
        </div>

        {/* Refund Recap Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
            <span className="text-slate-400">Montant à rembourser :</span>
            <span className="font-extrabold text-white text-sm">
              {refund.amount} {refund.currency}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
            <span className="text-slate-400">Moyen choisi :</span>
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${refund.refundMethod === 'paypal' ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
              {methodLabel}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Compte / Tag :</span>
            <span className="font-mono text-white text-xs truncate max-w-[200px]" title={refund.refundHandle}>
              {refund.refundHandle}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-emerald-200/90">
            Envoie un petit mot sur WhatsApp à l'organisateur avec tes coordonnées préremplies pour accélérer le versement.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleSendWhatsAppNotice}
            className="min-h-[48px] w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/20 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950 text-transparent" />
            <span>Envoyer la demande sur WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
