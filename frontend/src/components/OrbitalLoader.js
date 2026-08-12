import React from 'react';

/**
 * OrbitalLoader Component
 * Modern 2026 Dual-Ring Gravitational Orbit Spinner with ambient glow aura.
 */
const OrbitalLoader = ({ size = 36, label = 'Loading...', color = '#6366f1' }) => {
  return (
    <div className="orbital-loader-wrap" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div
        className="orbital-ring-container"
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Outer Ring */}
        <div
          className="orbital-outer-ring"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2.5px solid transparent`,
            borderTopColor: color,
            borderRightColor: `${color}80`,
            animation: 'orbitalSpin 1.1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
          }}
        />
        {/* Inner Counter Ring */}
        <div
          className="orbital-inner-ring"
          style={{
            position: 'absolute',
            inset: `${Math.round(size * 0.2)}px`,
            borderRadius: '50%',
            border: `2px solid transparent`,
            borderBottomColor: '#a855f7',
            borderLeftColor: '#38bdf8',
            animation: 'orbitalCounterSpin 0.85s linear infinite'
          }}
        />
        {/* Core Glowing Orb */}
        <div
          className="orbital-core-dot"
          style={{
            width: Math.max(4, Math.round(size * 0.16)),
            height: Math.max(4, Math.round(size * 0.16)),
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      </div>
      {label && <span className="orbital-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'inherit', opacity: 0.85 }}>{label}</span>}
    </div>
  );
};

export default OrbitalLoader;
