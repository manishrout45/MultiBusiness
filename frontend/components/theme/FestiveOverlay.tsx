'use client';

import { useMemo, type CSSProperties } from 'react';
import { usePlatformTheme } from '@/hooks/usePlatformTheme';
import type { FestiveThemeId } from '@/lib/festiveThemes';

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

export function FestiveOverlay() {
  const { theme } = usePlatformTheme();
  const festive = theme.festiveTheme;

  if (festive === 'none') return null;

  return (
    <div
      className="festive-overlay pointer-events-none fixed inset-0 z-[40] overflow-hidden"
      aria-hidden
    >
      {festive === 'diwali' ? <DiwaliLayer /> : null}
      {festive === 'newyear' ? <ConfettiLayer variant="newyear" /> : null}
      {festive === 'holi' ? <HoliLayer /> : null}
      {festive === 'christmas' ? <SnowLayer /> : null}
      {festive === 'eid' ? <EidLayer /> : null}
      {festive === 'independence' ? <ConfettiLayer variant="independence" /> : null}
      {festive === 'valentine' ? <HeartsLayer /> : null}
    </div>
  );
}

function DiwaliLayer() {
  const sparks = useMemo(() => range(18), []);
  const diyas = useMemo(() => range(8), []);
  return (
    <>
      <div className="festive-diwali-glow" />
      {sparks.map((i) => (
        <span
          key={`spark-${i}`}
          className="festive-spark"
          style={particleStyle(i, 18)}
        />
      ))}
      {diyas.map((i) => (
        <span
          key={`diya-${i}`}
          className="festive-diya"
          style={particleStyle(i, 8, 0.6)}
        />
      ))}
    </>
  );
}

function ConfettiLayer({ variant }: { variant: Extract<FestiveThemeId, 'newyear' | 'independence'> }) {
  const bits = useMemo(() => range(28), []);
  return (
    <>
      {bits.map((i) => (
        <span
          key={`confetti-${i}`}
          className={`festive-confetti festive-confetti--${variant}`}
          style={particleStyle(i, 28)}
        />
      ))}
    </>
  );
}

function HoliLayer() {
  const dots = useMemo(() => range(22), []);
  return (
    <>
      {dots.map((i) => (
        <span key={`holi-${i}`} className="festive-holi" style={particleStyle(i, 22)} />
      ))}
    </>
  );
}

function SnowLayer() {
  const flakes = useMemo(() => range(24), []);
  return (
    <>
      {flakes.map((i) => (
        <span key={`snow-${i}`} className="festive-snow" style={particleStyle(i, 24)} />
      ))}
    </>
  );
}

function EidLayer() {
  const stars = useMemo(() => range(14), []);
  return (
    <>
      {stars.map((i) => (
        <span key={`star-${i}`} className="festive-star" style={particleStyle(i, 14)} />
      ))}
      <span className="festive-moon" />
    </>
  );
}

function HeartsLayer() {
  const hearts = useMemo(() => range(16), []);
  return (
    <>
      {hearts.map((i) => (
        <span key={`heart-${i}`} className="festive-heart" style={particleStyle(i, 16)}>
          ♥
        </span>
      ))}
    </>
  );
}

function particleStyle(index: number, _total: number, durationScale = 1): CSSProperties {
  const left = ((index * 37) % 100) + (index % 5);
  const delay = ((index * 0.37) % 6).toFixed(2);
  const duration = (7 + (index % 5)) * durationScale;
  const size = 6 + (index % 8);
  return {
    left: `${left % 100}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: size,
    height: size,
    fontSize: size,
  };
}
