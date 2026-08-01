import React from 'react';

const ApexDevLogo = ({ 
  size = 40,
  showText = false,
  className = '',
  style = {}
}) => {
  const heightVal = typeof size === 'number' ? `${size}px` : size;

  return (
    <div 
      className={`apex-dev-brand-natural ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        ...style
      }}
    >
      <img 
        src={process.env.PUBLIC_URL + '/apex-dev-logo.png'} 
        alt="APEX DEV Logo" 
        style={{
          height: heightVal,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))'
        }}
      />

      {showText && (
        <span 
          className="apex-brand-title-text"
          style={{
            fontSize: typeof size === 'number' ? `${Math.max(14, size * 0.42)}px` : '1.1rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--color-text, #ffffff)',
            whiteSpace: 'nowrap'
          }}
        >
          APEX DEV
        </span>
      )}
    </div>
  );
};

export default ApexDevLogo;
