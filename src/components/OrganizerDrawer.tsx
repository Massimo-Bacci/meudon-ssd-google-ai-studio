import React, { useState, useEffect } from 'react';
import { Game, RefundRequest } from '../types/football';
import {
  X,
  Lock,
  KeyRound,
  Check,
  Calendar,
  Clock,
  MapPin,
  Euro,
  ShieldAlert,
  RotateCcw,
  Hash,
  Share2,
  ExternalLink,
  Copy,
  MessageCircle,
  CheckCheck,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { getNextSundayDate } from '../lib/gameService';
import { buildRefundConfirmedMessage, openWhatsAppDirectly } from '../lib/whatsapp';

interface OrganizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  refunds: RefundRequest[];
  isUnlocked: boolean;
  onUnlock: (pin: string) => boolean;
  onSaveGame: (updated: Game, pin: string) => Promise<void>;
  onResetSession: (newDate: string, startTime: string, endTime: string, pin: string) => Promise<void>;
  onMarkRefundCompleted: (refundId: string) => Promise<void>;
}

export const OrganizerDrawer: React.FC<OrganizerDrawerProps> = ({
  isOpen,
  onClose,
  game,
  refunds,
  isUnlocked,
  onUnlock,
  onSaveGame,
  onResetSession,
  onMarkRefundCompleted,
}) => {
  // PIN entry state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'settings' | 'refunds'>('settings');

  // Form states
  const [formData, setFormData] = useState<Game>({
    ...game,
    terrain: game.terrain || 'Terrain 3',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionError, setActionError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingRefundId, setProcessingRefundId] = useState<string | null>(null);

  // Reset session dialog
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [nextDate, setNextDate] = useState(getNextSundayDate());
  const [isResetting, setIsResetting] = useState(false);

  // Keep formData synced with latest game prop
  useEffect(() => {
    setFormData({
      ...game,
      terrain: game.terrain || 'Terrain 3',
    });
  }, [game]);

  if (!isOpen) return null;

  // Active Tab: 'refunds' or 'settings'
  const pendingRefunds = refunds.filter((r) => r.status === 'pending');
  const completedRefunds = refunds.filter((r) => r.status === 'completed');

  const pitchPresets = ['Terrain 1', 'Terrain 2', 'Terrain 3', 'Terrain 4', 'Terrain 5', 'Terrain synthé'];

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const success = onUnlock(pinInput);
    if (!success) {
      setPinError('Code PIN incorrect. Le code par défaut est 2026.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setSaveSuccess(false);

    try {
      setIsSaving(true);
      await onSaveGame(formData, pinInput || game.organizerPin);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    setActionError('');
    try {
      setIsResetting(true);
      await onResetSession(nextDate, formData.startTime, formData.endTime, pinInput || game.organizerPin);
      setShowResetDialog(false);
      onClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la réinitialisation');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCompleteRefund = async (refund: RefundRequest) => {
    try {
      setProcessingRefundId(refund.id);
      await onMarkRefundCompleted(refund.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la validation du remboursement');
    } finally {
      setProcessingRefundId(null);
    }
  };

  const handleNotifyPlayerRefunded = (refund: RefundRequest) => {
    const msg = buildRefundConfirmedMessage(refund.playerName, refund.amount, refund.currency);
    openWhatsAppDirectly(msg);
  };

  // Format payment URL if handle looks like a tag or username
  const getDirectPaymentUrl = (method: 'paypal' | 'revolut', handle: string): string => {
    const clean = handle.trim().replace(/^@/, '');
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    if (method === 'paypal') {
      if (clean.includes('@')) {
        // Email address
        return `https://www.paypal.com/myaccount/transfer/homepage`;
      }
      return `https://paypal.me/${clean}`;
    }
    return `https://revolut.me/${clean}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl h-full bg-[#11171E] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#11171E] z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-white">Espace Organisateur</h2>
              <p className="text-xs text-slate-400">Match, remboursements et terrain</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unlocked Tabs Navigation */}
        {isUnlocked && (
          <div className="px-5 sm:px-6 pt-3 border-b border-white/5 flex items-center gap-2 bg-[#11171E]">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`min-h-[44px] pb-2.5 px-3 border-b-2 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-emerald-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres du match</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('refunds')}
              className={`min-h-[44px] pb-2.5 px-3 border-b-2 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'refunds'
                  ? 'border-emerald-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Euro className="w-4 h-4" />
              <span>Remboursements</span>
              {pendingRefunds.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {pendingRefunds.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Drawer Content */}
        <div className="p-5 sm:p-6 flex-1 space-y-6">
          {!isUnlocked ? (
            /* Locked State: PIN Input */
            <form onSubmit={handlePinSubmit} className="max-w-sm mx-auto text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-300">
                <KeyRound className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Entrez le code PIN Organisateur</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ce code protège les paramètres et la file des remboursements.
                </p>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {pinError}
                </div>
              )}

              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="ex: 2026"
                maxLength={8}
                className="w-48 h-12 text-center text-xl font-mono tracking-widest rounded-xl bg-[#090D11] border border-white/20 focus:border-emerald-500 focus:outline-none text-white mx-auto block"
                autoFocus
              />

              <button
                type="submit"
                className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-transform active:scale-[0.98] cursor-pointer"
              >
                Déverrouiller
              </button>

              <p className="text-[11px] text-slate-500">
                Code par défaut : <strong className="text-slate-400">2026</strong> (modifiable dans les paramètres)
              </p>
            </form>
          ) : activeTab === 'refunds' ? (
            /* TAB 1: REFUNDS QUEUE */
            <div className="space-y-6">
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {actionError}
                </div>
              )}

              {/* Pending Refunds Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>File des remboursements</span>
                    {pendingRefunds.length > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
                        {pendingRefunds.length} en attente
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                        À jour
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Joueurs ayant annulé après confirmation de paiement PayPal ou Revolut
                  </p>
                </div>
              </div>

              {/* Pending List */}
              {pendingRefunds.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-white">Aucun remboursement en attente !</p>
                  <p className="text-[11px] text-slate-400">
                    Dès qu'un joueur titulaire ayant payé annule sa place, ses coordonnées et son montant apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRefunds.map((refund) => {
                    const isPaypal = refund.refundMethod === 'paypal';
                    const directUrl = getDirectPaymentUrl(refund.refundMethod, refund.refundHandle);

                    return (
                      <div
                        key={refund.id}
                        className="p-4 rounded-2xl bg-[#0d1319] border border-amber-500/30 shadow-lg space-y-3"
                      >
                        {/* Top row: Player name & amount */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{refund.playerName}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                  isPaypal
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                }`}
                              >
                                {isPaypal ? 'PayPal' : 'Revolut'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Demande reçue le {new Date(refund.createdAt).toLocaleDateString('fr-FR')} à{' '}
                              {new Date(refund.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-amber-400">
                              {refund.amount} {refund.currency}
                            </span>
                            <span className="block text-[10px] text-slate-400 uppercase font-semibold">à reverser</span>
                          </div>
                        </div>

                        {/* Coordonnées box with copy & link */}
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              {isPaypal ? 'Compte PayPal :' : 'Compte Revolut :'}
                            </span>
                            <span className="font-mono text-xs text-white truncate block font-bold">
                              {refund.refundHandle}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopy(refund.refundHandle, refund.id)}
                              className="min-h-[36px] min-w-[36px] px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Copier le tag"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{copiedId === refund.id ? 'Copié !' : 'Copier'}</span>
                            </button>

                            <a
                              href={directUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[36px] px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Ouvrir le lien de paiement"
                            >
                              <span>Payer</span>
                              <ExternalLink className="w-3 h-3 text-emerald-400" />
                            </a>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleNotifyPlayerRefunded(refund)}
                            className="min-h-[40px] flex-1 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Envoyer confirmation au joueur sur WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Aviser sur WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            disabled={processingRefundId === refund.id}
                            onClick={() => handleCompleteRefund(refund)}
                            className="min-h-[40px] flex-1 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{processingRefundId === refund.id ? 'Validation...' : 'Marquer remboursé'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completed Refunds History */}
              {completedRefunds.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Historique des remboursements effectués ({completedRefunds.length})
                  </h4>

                  <div className="space-y-2">
                    {completedRefunds.map((cr) => (
                      <div
                        key={cr.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-bold text-white">{cr.playerName}</span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              via {cr.refundMethod === 'paypal' ? 'PayPal' : 'Revolut'} ({cr.refundHandle})
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-300">
                            {cr.amount} {cr.currency}
                          </span>
                          {cr.refundedAt && (
                            <span className="block text-[10px] text-slate-500">
                              {new Date(cr.refundedAt).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: CONFIGURATION FORM */
            <form onSubmit={handleSave} className="space-y-6">
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {actionError}
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Paramètres du match sauvegardés avec succès !</span>
                </div>
              )}

              {/* SECTION 1: Lieu, Terrain & Planning */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-1 border-b border-white/5">
                  1. Lieu, N° de Terrain et Horaires
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Titre du match
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Complexe & Terrain Number */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Complexe sportif (Adresse)
                    </label>
                    <input
                      type="text"
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      placeholder="Five Meudon - Complexe Marcel Bec..."
                      className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-emerald-400" />
                        N° du Terrain
                      </span>
                      <span className="text-[11px] text-slate-500">Ex: Terrain 3, Terrain 5...</span>
                    </label>
                    <input
                      type="text"
                      value={formData.terrain || ''}
                      onChange={(e) => setFormData({ ...formData, terrain: e.target.value })}
                      placeholder="Terrain 3"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />

                    {/* Quick presets for terrain numbers */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] text-slate-500 mr-1">Raccourcis :</span>
                      {pitchPresets.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, terrain: p })}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                            formData.terrain === p
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Début
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Fin
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lien Google Maps (Itinéraire)
                  </label>
                  <input
                    type="url"
                    value={formData.fieldMapUrl || ''}
                    onChange={(e) => setFormData({ ...formData, fieldMapUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=Complexe+Marcel+Bec+Meudon..."
                    className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 2: Tarification & Paiements */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-1 border-b border-white/5">
                  2. Tarification & Liens de Paiement
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5 text-emerald-400" />
                    Prix par joueur (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.pricePerPlayer}
                    onChange={(e) => setFormData({ ...formData, pricePerPlayer: parseFloat(e.target.value) || 0 })}
                    className="w-32 h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lien PayPal Organisateur (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.paypalLink || ''}
                    onChange={(e) => setFormData({ ...formData, paypalLink: e.target.value })}
                    placeholder="https://paypal.me/moncompte"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lien Revolut Organisateur (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.revolutLink || ''}
                    onChange={(e) => setFormData({ ...formData, revolutLink: e.target.value })}
                    placeholder="https://revolut.me/moncompte"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Mandatory Cash Toggle */}
                <div className="p-3.5 rounded-xl bg-[#090D11] border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Paiement en espèces sur le terrain autorisé
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Permet aux joueurs de payer à l'organisateur directement au Five
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allowCash}
                    onChange={(e) => setFormData({ ...formData, allowCash: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 text-emerald-500 focus:ring-emerald-400 bg-black cursor-pointer"
                  />
                </div>
              </div>

              {/* SECTION 3: Groupe WhatsApp */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    3. Groupe WhatsApp
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Partage 1-Clic
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lien d'invitation au groupe WhatsApp (Optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.whatsappGroupUrl || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappGroupUrl: e.target.value })}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>Ouverture directe du groupe & Copie automatique</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    En renseignant ce lien de groupe (ex : <span className="text-emerald-400 font-mono">https://chat.whatsapp.com/...</span>), chaque mise à jour, invitation et alerte de place libérée ouvre directement ce groupe avec le message préformaté copié dans le presse-papier, prêt à être collé en un clic.
                  </p>
                </div>
              </div>

              {/* SECTION 4: Code PIN */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-1 border-b border-white/5">
                  4. Sécurité & Code PIN
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Code PIN Organisateur
                  </label>
                  <input
                    type="text"
                    value={formData.organizerPin}
                    onChange={(e) => setFormData({ ...formData, organizerPin: e.target.value })}
                    maxLength={8}
                    className="w-40 h-11 px-3.5 rounded-xl bg-[#090D11] border border-white/10 text-white text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-[46px] w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>

              {/* Reset Session Section */}
              <div className="mt-8 pt-6 border-t border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Zone de réinitialisation hebdomadaire</span>
                </div>
                <p className="text-xs text-slate-400">
                  Après le match, vous pouvez vider l'effectif actuel pour lancer les inscriptions du dimanche suivant.
                </p>

                {!showResetDialog ? (
                  <button
                    type="button"
                    onClick={() => setShowResetDialog(true)}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Préparer la session du dimanche suivant</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                    <p className="text-xs font-bold text-white">
                      Sélectionnez la date du prochain match :
                    </p>
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#090D11] border border-white/10 text-white text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowResetDialog(false)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        disabled={isResetting}
                        onClick={handleConfirmReset}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        {isResetting ? 'Réinitialisation...' : 'Confirmer et vider la liste'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
