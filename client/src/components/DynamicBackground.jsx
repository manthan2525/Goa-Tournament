import React, { useEffect, useRef } from 'react';

/**
 * DynamicBackground — Dark mode only, stronger effect.
 *
 * Layers (back to front):
 *  1. Deep dark gradient base
 *  2. Three slow-drifting radial glow orbs (emerald / teal / indigo)
 *  3. Subtle grid
 *  4. Floating particles (dots + small diamonds)
 *  5. Slow diagonal shimmer streaks
 *
 * pointer-events: none — never blocks any UI element.
 */
const DynamicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = motionQuery.matches;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    // ── Particles ──────────────────────────────────────────
    const PARTICLE_COUNT = isReducedMotion ? 0 : isMobile ? 20 : 55;
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.55 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.45 - 0.1,
      // Alternate emerald / teal / indigo
      color: ['16,185,129', '20,184,166', '99,102,241'][i % 3],
      // Some particles are diamonds (rotated squares)
      isDiamond: i % 5 === 0,
    }));

    // ── Shimmer streaks ─────────────────────────────────────
    const STREAK_COUNT = isReducedMotion ? 0 : isMobile ? 3 : 7;
    const streaks = Array.from({ length: STREAK_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 180 + 80,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
      speed: Math.random() * 0.3 + 0.1,
      alpha: Math.random() * 0.06 + 0.02,
      width: Math.random() * 1.2 + 0.4,
    }));

    // ── Orbs ───────────────────────────────────────────────
    let orbT = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ── Render ──────────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Light base gradient
      const base = ctx.createLinearGradient(0, 0, width, height);
      base.addColorStop(0,   '#f8fafc');
      base.addColorStop(0.4, '#f1f5f9');
      base.addColorStop(1,   '#f8fafc');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      if (!isReducedMotion) orbT += 0.0025;

      // 2. Three subtle light glow orbs
      const orbDefs = [
        { cx: 0.18, cy: 0.25, r: 0.55, dt: 1.0,  color0: 'rgba(16,185,129,0.08)',  color1: 'rgba(248,250,252,0)' },
        { cx: 0.82, cy: 0.70, r: 0.60, dt: 0.75, color0: 'rgba(20,184,166,0.07)',  color1: 'rgba(248,250,252,0)' },
        { cx: 0.50, cy: 0.85, r: 0.50, dt: 1.30, color0: 'rgba(14,165,233,0.05)',  color1: 'rgba(248,250,252,0)' },
      ];

      orbDefs.forEach(({ cx, cy, r, dt, color0, color1 }) => {
        const ox = width  * cx + Math.cos(orbT * dt) * width  * 0.06;
        const oy = height * cy + Math.sin(orbT * dt) * height * 0.06;
        const rad = Math.max(width, height) * r;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rad);
        g.addColorStop(0, color0);
        g.addColorStop(0.55, color0.replace(/[\d.]+\)$/, '0.02)'));
        g.addColorStop(1, color1);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      });

      // 3. Grid
      ctx.strokeStyle = 'rgba(0,0,0,0.025)';
      ctx.lineWidth = 1;
      const gridSize = isMobile ? 48 : 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // 4. Particles
      if (!isReducedMotion) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -5)      p.y = height + 5;
          if (p.x < -5)      p.x = width + 5;
          if (p.x > width+5) p.x = -5;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = `rgb(${p.color})`;

          if (p.isDiamond) {
            // Small rotated square (diamond)
            ctx.translate(p.x, p.y);
            ctx.rotate(Math.PI / 4);
            const s = p.radius * 1.6;
            ctx.fillRect(-s / 2, -s / 2, s, s);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // 5. Shimmer streaks
      if (!isReducedMotion) {
        streaks.forEach((s) => {
          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          // Wrap around
          if (s.x > width + 200)  { s.x = -200; s.y = Math.random() * height; }
          if (s.y > height + 200) { s.y = -200; s.x = Math.random() * width;  }

          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.strokeStyle = 'rgba(16,185,129,1)';
          ctx.lineWidth = s.width;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(
            s.x - Math.cos(s.angle) * s.length,
            s.y - Math.sin(s.angle) * s.length,
          );
          ctx.stroke();
          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default DynamicBackground;
