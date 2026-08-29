import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Share2, Mail, ExternalLink } from 'lucide-react';

const ShareModal = ({ tournament, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!tournament) return null;

  // Build the canonical tournament URL
  const shareUrl = `${window.location.origin}/tournaments/${tournament._id}`;
  const title = tournament.name || 'Goa Tournament';
  const textMessage = `🏆 Goa Tournament\n\nCheck out this tournament:\n${title}\n\n${shareUrl}`;

  // Copy Link Handler
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  // Social Share URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${title} on Goa Tournament!`)}&url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Check out this tournament - ${title}`)}&body=${encodeURIComponent(`Check out this tournament on Goa Tournament:\n\n${title}\n\n${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md my-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 space-y-5 overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Share Tournament</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Bar */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tournament Direct Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-200 truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 min-h-[42px] ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Tournament link copied to clipboard!
            </p>
          )}
        </div>

        {/* Sharing Apps Grid */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Share via Social &amp; Messaging</p>
          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 transition-all font-semibold text-xs group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="truncate">WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 transition-all font-semibold text-xs group"
            >
              <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                <ExternalLink className="w-4 h-4" />
              </div>
              <span className="truncate">Facebook</span>
            </a>

            {/* X / Twitter */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all font-semibold text-xs group"
            >
              <div className="p-1.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white shadow-xs">
                <span className="font-mono text-xs font-bold">X</span>
              </div>
              <span className="truncate">X / Twitter</span>
            </a>

            {/* Email */}
            <a
              href={emailUrl}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/50 text-teal-800 dark:text-teal-300 transition-all font-semibold text-xs group"
            >
              <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <span className="truncate">Email</span>
            </a>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 min-h-[42px] rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
