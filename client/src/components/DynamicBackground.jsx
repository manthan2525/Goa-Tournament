import React, { useEffect, useRef } from 'react';

const DynamicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = motionQuery.matches;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const particleCount = isReducedMotion ? 0 : isMobile ? 10 : 24;

    // Particles array
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.4 - 0.1,
        color: i % 2 === 0 ? '16, 185, 129' : '20, 184, 166', // Emerald / Teal
      });
    }

    // Ambient Glowing Orbs
    let orbAngle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Sports Dark Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#071120');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Animated Glowing Orbs
      orbAngle += isReducedMotion ? 0 : 0.003;
      const orb1X = width * 0.2 + Math.cos(orbAngle) * 40;
      const orb1Y = height * 0.3 + Math.sin(orbAngle) * 40;
      const orb2X = width * 0.8 + Math.sin(orbAngle * 0.8) * 50;
      const orb2Y = height * 0.7 + Math.cos(orbAngle * 0.8) * 50;

      // Orb 1 (Emerald)
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, Math.max(width, height) * 0.4);
      grad1.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
      grad1.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Orb 2 (Teal)
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, Math.max(width, height) * 0.45);
      grad2.addColorStop(0, 'rgba(20, 184, 166, 0.06)');
      grad2.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Subtle Sports Grid Lines (Pitch lines motif)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Floating Particles
      if (!isReducedMotion) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          ctx.fill();
        });
      }

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default DynamicBackground;
