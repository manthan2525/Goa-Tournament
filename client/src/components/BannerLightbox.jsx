import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const BannerLightbox = ({ imageUrl, altText = 'Tournament Banner', onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-hidden cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full Tournament Banner Image Viewer"
    >
      {/* Lightbox Container */}
      <div
        className="relative max-w-5xl max-h-[92vh] w-auto h-auto flex items-center justify-center cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close image viewer"
          className="absolute -top-12 right-0 sm:top-3 sm:right-3 z-10 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-2xl transition-all hover:scale-105 active:scale-95"
          title="Close image viewer (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Full Image with object-contain to preserve full aspect ratio */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-h-[85vh] max-w-[92vw] sm:max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-slate-800/80"
        />
      </div>
    </div>
  );
};

export default BannerLightbox;
