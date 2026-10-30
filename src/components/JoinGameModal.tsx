import React, { useState } from 'react';
import { Game, PaymentMethod } from '../types/football';
import { X, ExternalLink, Check, AlertTriangle, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  activeCount: number;
  onConfirmRegistration: (data: {
    name: string;
    paymentMethod: PaymentMethod;
    paymentStatus: 'paid' | 'pending' | 'exempt';
  }) => Promise<void>;
}

export const JoinGameModal: React.FC<JoinGameModalProps> = ({
  isOpen,
  onClose,
  game,
  activeCount,
  onConfirmRegistration,
}) => {
  const [name, setName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    game.allowCash ? 'cash' : game.paypalLink ? 'paypal' : game.revolutLink ? 'revolut' : 'cash'
  );
  const [hasConfirmedPaid, setHasConfirmedPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isFull = activeCount >= 10;

  // Builds direct payment links with amount included if URL syntax allows
  const getPaymentUrl = (method: PaymentMethod): string => {
    if (method === 'paypal' && game.paypalLink) {
      const base = game.paypalLink.replace(/\/$/, '');
      return `${base}/${game.pricePerPlayer}EUR`;
    }
    if (method === 'revolut' && game.revolutLink) {
      return game.revolutLink;
    }
    return '';
  };

  const handleOpenPaymentApp = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Veuillez entrer votre prénom ou nom.');
      return;
    }

    if (!isFull) {
      if ((selectedMethod === 'paypal' || selectedMethod === 'revolut') && !hasConfirmedPaid) {
        setErrorMsg('Veuillez confirmer que vous avez bien effectué le paiement.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onConfirmRegistration({
        name: name.trim(),
        paymentMethod: isFull ? 'none' : selectedMethod,
        paymentStatus: isFull ? 'exempt' : selectedMethod === 'cash' ? 'pending' : 'paid',
      });

      // Confetti burst for football excitement!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: isFull ? ['#F59E0B', '#FBBF24', '#FFFFFF'] : ['#10B981', '#34D399', '#6EE7B7'],
      });

      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l’inscription');
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] absolute top-4 right-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            isFull ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {isFull ? "Liste d'attente (Gratuit)" : `Titulaire (${activeCount + 1}/10)`}
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            {isFull ? "Rejoindre la liste d'attente" : "Réserver ma place pour dimanche"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isFull
              ? "Le match est complet (10/10). Inscris-toi sans payer : tu seras prévenu dès qu'une place se libère !"
              : `Match à Meudon · Participation : ${game.pricePerPlayer} € par joueur`}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Player Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
              Prénom et Nom <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Maxime B."
              maxLength={50}
              className="w-full h-12 px-4 rounded-xl bg-[#090D11] border border-white/10 focus:border-emerald-500 focus:outline-none text-white text-sm placeholder:text-slate-600 transition-colors"
            />
          </div>

          {/* Step 2: Payment Section (Only if Active Roster, Bypassed for Waiting List!) */}
          {!isFull ? (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                Mode de règlement ({game.pricePerPlayer} €)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {game.paypalLink && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('paypal');
                      setHasConfirmedPaid(false);
                    }}
                    className={`min-h-[52px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === 'paypal'
                        ? 'bg-blue-500/20 border-blue-400 text-white shadow-md shadow-blue-500/10'
                        : 'bg-[#090D11] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm">PayPal</span>
                    <span className="text-[11px] opacity-80">En ligne</span>
                  </button>
                )}

                {game.revolutLink && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('revolut');
                      setHasConfirmedPaid(false);
                    }}
                    className={`min-h-[52px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === 'revolut'
                        ? 'bg-pink-500/20 border-pink-400 text-white shadow-md shadow-pink-500/10'
                        : 'bg-[#090D11] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm">Revolut</span>
                    <span className="text-[11px] opacity-80">Virement</span>
                  </button>
                )}

                {game.allowCash && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('cash');
                      setHasConfirmedPaid(true);
                    }}
                    className={`min-h-[52px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === 'cash'
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                        : 'bg-[#090D11] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm">Espèces</span>
                    <span className="text-[11px] opacity-80">Sur le terrain</span>
                  </button>
                )}
              </div>

              {/* Digital Payment Redirection & Mandatory Confirmation */}
              {(selectedMethod === 'paypal' || selectedMethod === 'revolut') && (
                <div className="mt-3 p-4 rounded-2xl bg-[#090D11] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">
                        Lien de paiement de l'organisateur
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Montant à régler : <strong className="text-white">{game.pricePerPlayer} €</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPaymentApp(getPaymentUrl(selectedMethod))}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Ouvrir {selectedMethod === 'paypal' ? 'PayPal' : 'Revolut'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mandatory "I have paid" confirmation checkbox */}
                  <label className="flex items-start gap-2.5 pt-2 border-t border-white/5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasConfirmedPaid}
                      onChange={(e) => setHasConfirmedPaid(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-emerald-400 bg-black cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 leading-snug">
                      J'ai bien envoyé les <strong className="text-white">{game.pricePerPlayer} €</strong> via {selectedMethod === 'paypal' ? 'PayPal' : 'Revolut'}.
                    </span>
                  </label>
                </div>
              )}

              {selectedMethod === 'cash' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Vous donnerez <strong>{game.pricePerPlayer} €</strong> en main propre à l'organisateur directement au Five dimanche.
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Waiting List Mode Notice: Explicitly Bypasses Payment! */
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Paiement reporté — Aucun frais requis</span>
              </div>
              <p className="text-xs text-slate-300">
                Vous n'avez rien à payer maintenant. Si l'un des 10 titulaires se désiste, vous recevrez une alerte WhatsApp prioritaire pour confirmer votre place et votre paiement.
              </p>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`min-h-[48px] w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] cursor-pointer ${
                isFull
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>Enregistrement en cours...</span>
              ) : isFull ? (
                <>
                  <span>Confirmer mon inscription en attente</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Valider mon inscription ({game.pricePerPlayer} €)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
