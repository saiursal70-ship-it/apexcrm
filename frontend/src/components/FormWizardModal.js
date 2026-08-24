import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Icon from './Icon';

/**
 * FormWizardModal Component
 * Multi-Step Side Drawer Engine with progress step indicator, pre-populated dropdowns, and draft auto-save.
 */
const FormWizardModal = ({
  isOpen,
  onClose,
  title = 'Create Record',
  fields = [],
  initialData = {},
  onSubmit,
  editingId = null,
  entity = 'record'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Divide fields into 2 or 3 steps logically
  const half = Math.ceil(fields.length / 2);
  const step1Fields = fields.slice(0, half);
  const step2Fields = fields.slice(half);
  const totalSteps = step2Fields.length > 0 ? 2 : 1;

  useEffect(() => {
    if (isOpen) {
      // Initialize form data with properly formatted dates for HTML5 datepickers
      const sanitized = { ...(initialData || {}) };
      fields.forEach((f) => {
        if (f.type === 'date' && sanitized[f.name]) {
          sanitized[f.name] = String(sanitized[f.name]).substring(0, 10);
        }
      });
      setFormData(sanitized);
      setCurrentStep(1);
      setFieldErrors({});
    }
  }, [isOpen, initialData, editingId, entity, fields]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const validateStep = (fieldsToValidate) => {
    const errors = {};
    fieldsToValidate.forEach((f) => {
      const rawVal = formData[f.name];
      const isNullOrEmpty = rawVal === undefined || rawVal === null || String(rawVal).trim() === '';
      const strVal = isNullOrEmpty ? '' : String(rawVal).trim();

      if (f.required && isNullOrEmpty) {
        errors[f.name] = `${f.label} is required.`;
      } else if (f.required && (f.type === 'text' || !f.type) && strVal.length < 2) {
        errors[f.name] = `${f.label} must be at least 2 characters long.`;
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(activeFields)) {
      if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(fields)) return;

    // Clear draft on submit
    localStorage.removeItem(`crm_form_draft_${entity}`);
    onSubmit(formData);
  };

  const activeFields = currentStep === 1 ? step1Fields : step2Fields;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay wizard-drawer-overlay"
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99990,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.25s ease'
      }}
    >
      <div
        className="modal-content wizard-modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          height: '100vh',
          maxHeight: '100dvh',
          background: 'var(--color-surface, #ffffff)',
          borderLeft: '1px solid var(--color-border, #e2e8f0)',
          boxShadow: '-15px 0 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          background: 'var(--color-surface-glass, rgba(255, 255, 255, 0.95))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div className="wizard-header-title">
            <span className="drawer-entity-badge" style={{
              background: 'rgba(37, 99, 235, 0.12)',
              color: '#2563eb',
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              padding: '3px 10px',
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '4px'
            }}>
              {entity?.toUpperCase()} WIZARD
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
              {editingId ? `Edit ${title}` : `Create New ${title}`}
            </h2>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={handleClose}
            style={{
              background: 'rgba(148, 163, 184, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary, #64748b)'
            }}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        {totalSteps > 1 && (
          <div className="wizard-step-bar">
            <div className={`wizard-step-item ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">Basic Details</span>
            </div>
            <div className="step-line" />
            <div className={`wizard-step-item ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">Additional Meta & Status</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={currentStep === totalSteps ? handleFormSubmit : handleNext}>
          <div className="wizard-form-body">
            <div className="form-row">
              {activeFields.map((f, fIdx) => (
                <div
                  className={`form-group ${fieldErrors[f.name] ? 'has-error' : ''}`}
                  key={`field-${f.name}-${fIdx}`}
                  style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}
                >
                  <label>
                    {f.label} {f.required && <span className="text-danger">*</span>}
                  </label>

                  {f.type === 'select' ? (
                    <select
                      name={f.name}
                      value={formData[f.name] || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select {f.label}</option>
                      {f.options?.map((o, oIdx) => (
                        <option key={`${f.name}-opt-${o}-${oIdx}`} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      name={f.name}
                      rows={3}
                      value={formData[f.name] || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type={f.type}
                      name={f.name}
                      value={formData[f.name] || ''}
                      onChange={handleChange}
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                    />
                  )}
                  {fieldErrors[f.name] && (
                    <span className="field-error-text" style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      ⚠️ {fieldErrors[f.name]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="wizard-footer">
            {currentStep > 1 ? (
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
            ) : (
              <button type="button" className="btn btn-outline" onClick={handleClose}>
                Cancel
              </button>
            )}

            {currentStep < totalSteps ? (
              <button type="submit" className="btn btn-primary">
                Next Step →
              </button>
            ) : (
              <button type="submit" className="btn btn-primary btn-glow">
                {editingId ? 'Update Record' : 'Save & Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FormWizardModal;
