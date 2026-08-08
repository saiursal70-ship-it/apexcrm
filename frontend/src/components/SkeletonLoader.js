import React from 'react';

/**
 * Reusable Skeleton Loader Component
 * Variants: 'table', 'card', 'stat', 'drawer'
 */
const SkeletonLoader = ({ variant = 'table', count = 4 }) => {
  if (variant === 'stat') {
    return (
      <div className="skeleton-grid skeleton-stat-grid">
        {Array.from({ length: count }).map((_, idx) => (
          <div className="skeleton-card skeleton-stat-card" key={`sk-stat-${idx}`}>
            <div className="skeleton-circle" style={{ width: 44, height: 44 }} />
            <div className="skeleton-lines" style={{ flex: 1 }}>
              <div className="skeleton-line" style={{ width: '40%', height: 14 }} />
              <div className="skeleton-line" style={{ width: '70%', height: 24, marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="skeleton-grid skeleton-kanban-grid">
        {Array.from({ length: count }).map((_, colIdx) => (
          <div className="skeleton-kanban-column" key={`sk-col-${colIdx}`}>
            <div className="skeleton-line" style={{ width: '60%', height: 18, marginBottom: 16 }} />
            {Array.from({ length: 3 }).map((_, cardIdx) => (
              <div className="skeleton-card" key={`sk-card-${colIdx}-${cardIdx}`}>
                <div className="skeleton-line" style={{ width: '80%', height: 16, marginBottom: 12 }} />
                <div className="skeleton-line" style={{ width: '50%', height: 12, marginBottom: 8 }} />
                <div className="skeleton-line" style={{ width: '30%', height: 12 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className="skeleton-drawer-content">
        <div className="skeleton-line" style={{ width: '60%', height: 28, marginBottom: 24 }} />
        <div className="skeleton-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="skeleton-line" style={{ height: 40 }} />
          <div className="skeleton-line" style={{ height: 40 }} />
          <div className="skeleton-line" style={{ height: 40 }} />
          <div className="skeleton-line" style={{ height: 40 }} />
        </div>
        <div className="skeleton-line" style={{ width: '100%', height: 120, borderRadius: 12 }} />
      </div>
    );
  }

  // Default: Table view skeleton
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <div className="skeleton-line" style={{ width: '25%', height: 16 }} />
        <div className="skeleton-line" style={{ width: '20%', height: 16 }} />
        <div className="skeleton-line" style={{ width: '20%', height: 16 }} />
        <div className="skeleton-line" style={{ width: '15%', height: 16 }} />
        <div className="skeleton-line" style={{ width: '10%', height: 16 }} />
      </div>
      {Array.from({ length: count }).map((_, idx) => (
        <div className="skeleton-table-row" key={`sk-row-${idx}`}>
          <div className="skeleton-line" style={{ width: '28%', height: 14 }} />
          <div className="skeleton-line" style={{ width: '22%', height: 14 }} />
          <div className="skeleton-line" style={{ width: '18%', height: 14 }} />
          <div className="skeleton-line" style={{ width: '12%', height: 22, borderRadius: 20 }} />
          <div className="skeleton-line" style={{ width: '10%', height: 14 }} />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
