import React from 'react';
import Icon from './Icon';

/**
 * FacetedFilterBar Component
 * Multi-dimensional filter toolbar for slicing pipeline records by stage, status, priority, and trash state.
 */
const FacetedFilterBar = ({
  config,
  filters = {},
  onFilterChange,
  onClearFilters,
  totalCount = 0,
  isTrashMode = false,
  onToggleTrashMode
}) => {
  if (!config) return null;

  // Extract filterable dropdown fields from entity configuration
  const filterableFields = (config.fields || []).filter(
    (f) => f.options && Array.isArray(f.options) && f.options.length > 0 && f.name !== 'id'
  );

  const activeFilterCount = Object.keys(filters).filter((k) => filters[k] && filters[k] !== '').length;

  return (
    <div className="faceted-filter-bar">
      <div className="filter-bar-left">
        {/* Trash / Archive Toggle Pill */}
        <button
          type="button"
          className={`filter-pill-btn ${isTrashMode ? 'active-trash' : ''}`}
          onClick={onToggleTrashMode}
          title={isTrashMode ? 'View Active Records' : 'View Deleted / Trash Records'}
        >
          <Icon name={isTrashMode ? 'refresh' : 'trash'} size={14} />
          <span>{isTrashMode ? 'Viewing Trash' : 'Trash'}</span>
        </button>

        {/* Dynamic Dropdowns for Configured Select Fields */}
        {filterableFields.map((field) => (
          <div className="filter-select-wrapper" key={field.name}>
            <label className="filter-label">{field.label}:</label>
            <select
              className={`filter-select-dropdown ${filters[field.name] ? 'has-value' : ''}`}
              value={filters[field.name] || ''}
              onChange={(e) => onFilterChange(field.name, e.target.value)}
            >
              <option value="">All {field.label}s</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Reset / Clear Button */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            className="filter-clear-btn"
            onClick={onClearFilters}
            title="Clear all active filters"
          >
            <Icon name="close" size={13} />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}
      </div>

      <div className="filter-bar-right">
        <span className="record-count-badge">
          {isTrashMode ? '🗑️ ' : '📊 '}
          <strong>{totalCount}</strong> {isTrashMode ? 'in Trash' : 'records'}
        </span>
      </div>
    </div>
  );
};

export default FacetedFilterBar;
