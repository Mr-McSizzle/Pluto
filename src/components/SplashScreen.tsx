import { useState, useEffect, useRef, useCallback } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState(0);
  const [gone, setGone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stableFinish = useCallback(onFinish, []);

  /* ── canvas: stars + wireframe globe ── */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let W = window.innerWidth;
    let H = window.innerHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.scale(dpr, dpr);

    /* stars */
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2, phase: Math.random() * Math.PI * 2,
    }));

    /* wireframe sphere points */
    const R = Math.min(W, H) * 0.11; // globe radius
    const cx = W / 2, cy = H / 2 - 30;

    let raf: number, t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.004;

      /* draw stars */
      for (const s of stars) {
        const a = 0.25 + 0.75 * Math.sin(t * 3 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.28);
        ctx.fillStyle = `rgba(180,200,240,${a * 0.6})`;
        ctx.fill();
      }

      /* wireframe globe — meridians & parallels */
      const rotY = t * 0.7; // slowly rotate

      // longitude lines (meridians)
      for (let i = 0; i < 12; i++) {
        const lon = (i / 12) * Math.PI * 2 + rotY;
        ctx.beginPath();
        for (let j = 0; j <= 40; j++) {
          const lat = (j / 40) * Math.PI - Math.PI / 2;
          const x3 = Math.cos(lat) * Math.sin(lon);
          const y3 = Math.sin(lat);
          const px = cx + x3 * R;
          const py = cy - y3 * R;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          // we'll draw the whole line then style it
        }
        ctx.strokeStyle = 'rgba(59,130,246,0.12)';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // re-draw front-facing segments brighter
        ctx.beginPath();
        let started = false;
        for (let j = 0; j <= 40; j++) {
          const lat = (j / 40) * Math.PI - Math.PI / 2;
          const x3 = Math.cos(lat) * Math.sin(lon);
          const z3 = Math.cos(lat) * Math.cos(lon);
          const y3 = Math.sin(lat);
          const px = cx + x3 * R;
          const py = cy - y3 * R;
          if (z3 > -0.05) {
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
          } else {
            started = false;
          }
        }
        ctx.strokeStyle = 'rgba(96,165,250,0.28)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // latitude lines (parallels)
      for (let i = 1; i < 8; i++) {
        const lat = (i / 8) * Math.PI - Math.PI / 2;
        const yy = cy - Math.sin(lat) * R;

        ctx.beginPath();
        for (let j = 0; j <= 60; j++) {
          const lon = (j / 60) * Math.PI * 2 + rotY;
          const x3 = Math.cos(lat) * Math.sin(lon);
          const px = cx + x3 * R;
          if (j === 0) ctx.moveTo(px, yy);
          else ctx.lineTo(px, yy);
        }
        ctx.strokeStyle = 'rgba(59,130,246,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // front half brighter
        ctx.beginPath();
        let started = false;
        for (let j = 0; j <= 60; j++) {
          const lon = (j / 60) * Math.PI * 2 + rotY;
          const x3 = Math.cos(lat) * Math.sin(lon);
          const z3 = Math.cos(lat) * Math.cos(lon);
          const px = cx + x3 * R;
          if (z3 > -0.05) {
            if (!started) { ctx.moveTo(px, yy); started = true; }
            else ctx.lineTo(px, yy);
          } else { started = false; }
        }
        ctx.strokeStyle = 'rgba(96,165,250,0.22)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 6.28);
      ctx.strokeStyle = 'rgba(96,165,250,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // subtle glow at center
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3);
      g.addColorStop(0, 'rgba(59,130,246,0.06)');
      g.addColorStop(0.5, 'rgba(6,182,212,0.03)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(cx - R * 1.5, cy - R * 1.5, R * 3, R * 3);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── timeline ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 250),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1700),
      setTimeout(() => setPhase(4), 2800),
      setTimeout(() => setPhase(5), 4000),
      setTimeout(() => { setGone(true); stableFinish(); }, 4700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [stableFinish]);

  if (gone) return null;

  const show = (p: number) => phase >= p;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#000000',
      opacity: phase >= 5 ? 0 : 1,
      transform: phase >= 5 ? 'scale(1.05)' : 'scale(1)',
      transition: 'opacity .7s ease, transform .7s ease',
      overflow: 'hidden',
    }}>

      {/* canvas (stars + wireframe globe) */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: show(1) ? 1 : 0, transition: 'opacity 1.2s ease',
      }} />

      {/* subtle horizontal scan line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '100%', pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,.008) 3px, rgba(255,255,255,.008) 4px)',
        opacity: show(2) ? 1 : 0, transition: 'opacity 2s',
      }} />

      {/* spacer to push text below globe center */}
      <div style={{ height: show(2) ? '32vh' : '20vh', transition: 'height 1s ease' }} />

      {/* ── TEXT ── */}
      <div style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
        {/* PLUTO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.06em' }}>
          {'PLUTO'.split('').map((ch, i) => (
            <span key={i} style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 6vw, 3.2rem)',
              letterSpacing: '0.18em',
              lineHeight: 1,
              background: 'linear-gradient(180deg, rgba(255,255,255,.95) 0%, rgba(148,163,184,.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(59,130,246,.3))',
              opacity: show(3) ? 1 : 0,
              transform: show(3) ? 'translateY(0)' : 'translateY(18px)',
              transition: 'all .6s cubic-bezier(.16,1,.3,1)',
              transitionDelay: `${i * 75 + 100}ms`,
            }}>{ch}</span>
          ))}
        </div>

        {/* thin separator */}
        <div style={{
          margin: '14px auto 0', height: 1,
          width: show(3) ? 120 : 0,
          background: 'linear-gradient(90deg, transparent, rgba(96,165,250,.4), rgba(6,182,212,.5), rgba(96,165,250,.4), transparent)',
          boxShadow: '0 0 12px rgba(59,130,246,.2)',
          transition: 'width .9s cubic-bezier(.16,1,.3,1)',
          transitionDelay: '.5s',
        }} />

        {/* tagline */}
        <p style={{
          marginTop: 16,
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 300,
          fontSize: '.65rem',
          letterSpacing: '.4em',
          textTransform: 'uppercase' as const,
          color: 'rgba(100,116,139,.7)',
          opacity: show(4) ? 1 : 0,
          transform: show(4) ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all .6s ease',
          transitionDelay: '.1s',
        }}>Programmable Digital Finance</p>
      </div>

      {/* bottom */}
      <div style={{
        position: 'absolute', bottom: 28, display: 'flex', alignItems: 'center', gap: 8, zIndex: 3,
        opacity: show(4) ? 1 : 0, transition: 'opacity .8s ease', transitionDelay: '.3s',
      }}>
        <span style={{
          width: 4, height: 4, borderRadius: '50%', background: '#34d399',
          boxShadow: '0 0 6px rgba(52,211,153,.5)',
          animation: 'splashNodePulse 1.8s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: 'Space Grotesk', fontSize: 9,
          letterSpacing: '.22em', color: 'rgba(100,116,139,.35)',
          textTransform: 'uppercase' as const,
        }}>CBDC · v1.0</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes splashNodePulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
      `}} />
    </div>
  );
}
