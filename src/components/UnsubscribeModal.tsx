import React, { useState, useEffect } from 'react';
import { Game, Player } from '../types/football';
import { X, AlertTriangle, Euro, ArrowRight, ShieldCheck } from 'lucide-react';

interface UnsubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  game: Game;
  onConfirmUnsubscribe: (
    player: Player,
    refundDetails?: { refundMethod: 'paypal' | 'revolut'; refundHandle: string }
  ) => Promise<void>;
}

export const UnsubscribeModal: React.FC<UnsubscribeModalProps> = ({
  isOpen,
  onClose,
  player,
  game,
  onConfirmUnsubscribe,
}) => {
  const [refundMethod, setRefundMethod] = useState<'paypal' | 'revolut'>('paypal');
  const [refundHandle, setRefundHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync initial refund method with player's original payment method
  useEffect(() => {
    if (player) {
      if (player.paymentMethod === 'revolut') {
        setRefundMethod('revolut');
      } else {
        setRefundMethod('paypal');
      }
    }
    setRefundHandle('');
    setErrorMsg('');
  }, [player]);

  if (!isOpen || !player) return null;

  const isEligibleForRefund =
    player.paymentStatus === 'paid' &&
    (player.paymentMethod === 'paypal' || player.paymentMethod === 'revolut');

  const handleConfirm = async () => {
    setErrorMsg('');

    if (isEligibleForRefund) {
      if (!refundHandle.trim()) {
        setErrorMsg('Veuillez renseigner votre tag ou compte PayPal/Revolut pour recevoir votre remboursement.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const refundDetails = isEligibleForRefund
        ? {
            refundMethod,
            refundHandle: refundHandle.trim(),
          }
        : undefined;

      await onConfirmUnsubscribe(player, refundDetails);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de la désinscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#141C24] border border-white/10 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] absolute top-4 right-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Confirmer la désinscription
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Es-tu certain de vouloir retirer <strong className="text-white">{player.name}</strong> du match de dimanche ?
            {!player.isWaitingList && (
              <span className="block mt-1 text-emerald-400 font-semibold">
                ⚽ Ta place de titulaire sera instantanément libérée pour les remplaçants et annoncée sur WhatsApp.
              </span>
            )}
          </p>
        </div>

        {/* Refund Banner & Form for Paid Players */}
        {isEligibleForRefund && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Euro className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Remboursement garanti de {game.pricePerPlayer || 12} {game.currency || '€'}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                  Comme tu as déjà réglé ta place en ligne, l'organisateur va te reverser tes {game.pricePerPlayer || 12} €. Indique où t'envoyer l'argent.
                </p>
              </div>
            </div>

            {/* Method selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Mode de remboursement :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefundMethod('paypal')}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    refundMethod === 'paypal'
                      ? 'bg-blue-600/30 text-blue-200 border-blue-500/50 shadow-md'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span>PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundMethod('revolut')}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    refundMethod === 'revolut'
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-md'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  <span>Revolut</span>
                </button>
              </div>
            </div>

            {/* Handle/tag input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>
                  {refundMethod === 'paypal'
                    ? 'Lien PayPal.me ou pseudo / email :'
                    : 'Revtag (@pseudo) ou tél Revolut :'}
                </span>
                <span className="text-[10px] text-amber-300 font-normal">Requis</span>
              </label>
              <input
                type="text"
                value={refundHandle}
                onChange={(e) => setRefundHandle(e.target.value)}
                placeholder={
                  refundMethod === 'paypal'
                    ? 'ex: paypal.me/moncompte ou email@gmail.com'
                    : 'ex: @alexandre ou 0612345678'
                }
                className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-amber-500/30 focus:border-amber-400 focus:outline-none text-white text-xs sm:text-sm placeholder:text-slate-600 font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>La demande sera placée en tête de file de l'organisateur + message WhatsApp direct.</span>
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="min-h-[48px] flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-600/20 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? 'Traitement...' : isEligibleForRefund ? 'Demander le remboursement' : 'Libérer ma place'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
