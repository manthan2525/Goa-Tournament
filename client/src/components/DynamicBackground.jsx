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
    const particleCount = isReducedMotion ? 0 : isMobile ? 12 : 32;

    // Particles array
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.45 + 0.15,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.5 - 0.15,
        color: i % 2 === 0 ? '16, 185, 129' : '20, 184, 166', // Emerald / Teal
      });
    }

    let orbAngle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      const isLightMode = document.documentElement.classList.contains('light');
      ctx.clearRect(0, 0, width, height);

      if (isLightMode) {
        // Light Mode Background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#f1f5f9');
        bgGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Light Ambient Orbs
        orbAngle += isReducedMotion ? 0 : 0.002;
        const orb1X = width * 0.25 + Math.cos(orbAngle) * 45;
        const orb1Y = height * 0.3 + Math.sin(orbAngle) * 45;
        const orb2X = width * 0.75 + Math.sin(orbAngle * 0.7) * 55;
        const orb2Y = height * 0.7 + Math.cos(orbAngle * 0.7) * 55;

        const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, Math.max(width, height) * 0.45);
        grad1.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
        grad1.addColorStop(1, 'rgba(248, 250, 252, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, Math.max(width, height) * 0.5);
        grad2.addColorStop(0, 'rgba(14, 165, 233, 0.05)');
        grad2.addColorStop(1, 'rgba(248, 250, 252, 0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);

        // Light Mode Grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 65;
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
      } else {
        // Dark Mode Background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.5, '#071120');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Animated Glowing Orbs (More visible)
        orbAngle += isReducedMotion ? 0 : 0.003;
        const orb1X = width * 0.2 + Math.cos(orbAngle) * 50;
        const orb1Y = height * 0.3 + Math.sin(orbAngle) * 50;
        const orb2X = width * 0.8 + Math.sin(orbAngle * 0.8) * 60;
        const orb2Y = height * 0.7 + Math.cos(orbAngle * 0.8) * 60;

        const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, Math.max(width, height) * 0.45);
        grad1.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        grad1.addColorStop(0.6, 'rgba(16, 185, 129, 0.04)');
        grad1.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, Math.max(width, height) * 0.5);
        grad2.addColorStop(0, 'rgba(20, 184, 166, 0.12)');
        grad2.addColorStop(0.6, 'rgba(20, 184, 166, 0.03)');
        grad2.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);

        // Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
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
          ctx.fillStyle = isLightMode
            ? `rgba(5, 150, 105, ${p.alpha * 0.6})`
            : `rgba(${p.color}, ${p.alpha})`;
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
