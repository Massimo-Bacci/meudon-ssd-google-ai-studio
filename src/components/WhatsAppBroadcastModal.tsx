import React, { useState } from 'react';
import { SpotOpenedEvent } from '../types/football';
import { buildSpotOpenedMessage, createWhatsAppShareLink, dispatchWhatsAppShare } from '../lib/whatsapp';
import { X, Share2, Copy, Check, Radio, ExternalLink, Users } from 'lucide-react';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SpotOpenedEvent | null;
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [copied, setCopied] = useState(false);
  const [dispatchedGroup, setDispatchedGroup] = useState(false);

  if (!isOpen || !event) return null;

  const message = buildSpotOpenedMessage(event);
  const hasGroupUrl = Boolean(event.whatsappGroupUrl && event.whatsappGroupUrl.trim().length > 0);
  const sharePickerUrl = createWhatsAppShareLink(message);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenGroupDirectly = async () => {
    setDispatchedGroup(true);
    await dispatchWhatsAppShare(message, event.whatsappGroupUrl);
    setTimeout(() => setDispatchedGroup(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#141C24] border border-emerald-500/30 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] absolute top-4 right-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Football Announcement Badge */}
        <div className="mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs w-fit">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Alerte Place Libérée</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
            Place libérée : Alerter le groupe
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {event.departingPlayerName
              ? `${event.departingPlayerName} vient de se désister.`
              : 'Une place titulaire est disponible.'}{' '}
            {event.nextWaitingPlayerName ? (
              <span className="text-amber-300 font-semibold">
                @{event.nextWaitingPlayerName} est prioritaire sur la liste d'attente !
              </span>
            ) : (
              'La place est désormais disponible pour tout le monde.'
            )}
          </p>
        </div>

        {/* Dispatched notification banner */}
        {dispatchedGroup && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Message copié dans le presse-papier ! Discussion du groupe ouverte, colle simplement le message (Ctrl+V).
            </span>
          </div>
        )}

        {/* Message Preview Box with Terrain Number */}
        <div className="relative my-4 p-4 rounded-2xl bg-[#090D11] border border-white/10 text-slate-200 text-xs sm:text-sm font-sans whitespace-pre-line leading-relaxed selection:bg-emerald-500 selection:text-white">
          {message}

          <button
            onClick={handleCopyText}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Copier le texte"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          {hasGroupUrl ? (
            <>
              {/* Primary: Direct Group Opener with automatic copy */}
              <button
                type="button"
                onClick={handleOpenGroupDirectly}
                className="min-h-[48px] w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base bg-[#25D366] hover:bg-[#20ba59] text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Ouvrir le groupe & Copier le message</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Secondary fallback: WhatsApp selector if organizer wants to send to an individual */}
              <a
                href={sharePickerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ou partager via le sélecteur WhatsApp classique</span>
              </a>
            </>
          ) : (
            /* Standard WhatsApp Share Anchor when no group link is set */
            <a
              href={sharePickerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base bg-[#25D366] hover:bg-[#20ba59] text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager sur le groupe WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}

          <button
            onClick={onClose}
            className="min-h-[40px] w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

