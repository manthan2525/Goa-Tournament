import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const BannerLightbox = ({ imageUrl, altText = 'Tournament Banner', onClose }) => {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev || '';
    };
  }, [handleClose]);

  if (!imageUrl) return null;

  return (
    /*
     * Overlay — covers 100dvh so mobile address-bar doesn't cut it off.
     * Clicking the backdrop (but NOT the image) closes the viewer.
     */
    <div
      className="banner-lightbox-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full tournament banner image viewer"
    >
      {/*
       * Close button — fixed to the viewport so it is ALWAYS visible
       * regardless of how tall/wide the image is on any screen size.
       * 48×48 px touch target (≥44px requirement met).
       */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        aria-label="Close image viewer"
        title="Close (ESC)"
        className="banner-lightbox-close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Image container — stops click from propagating to the backdrop */}
      <div
        className="banner-lightbox-img-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="banner-lightbox-img"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default BannerLightbox;
