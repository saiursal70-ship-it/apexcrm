import React from 'react';

const ApexDevLogo = ({ 
  size = 38,
  showText = false,
  textColor = null,
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
        userSelect: 'none',
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
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.35))'
        }}
      />

      {showText && (
        <div 
          className="apex-brand-text-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            lineHeight: 1
          }}
        >
          <span 
            className="apex-brand-title-text"
            style={{
              fontSize: typeof size === 'number' ? `${Math.max(15, size * 0.44)}px` : '1.15rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: textColor || '#ffffff',
              whiteSpace: 'nowrap',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
          >
            APEX DEV
          </span>
          <span 
            className="apex-brand-badge-tag"
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(139, 92, 246, 0.4)',
              lineHeight: 1
            }}
          >
            CRM
          </span>
        </div>
      )}
    </div>
  );
};

export default ApexDevLogo;
