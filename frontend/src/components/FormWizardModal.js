import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { animateModalEnter, animateStagger } from '../utils/animations';

/**
 * FormWizardModal Component
 * Multi-Step Form Engine with progress step indicator, field masking, and draft auto-save.
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
      animateModalEnter(modalRef.current, overlayRef.current);
      // Check for saved draft if creating new record
      if (!editingId) {
        const draftKey = `crm_form_draft_${entity}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            setFormData(JSON.parse(savedDraft));
          } catch (e) {
            setFormData(initialData || {});
          }
        } else {
          setFormData(initialData || {});
        }
      } else {
        setFormData(initialData || {});
      }
      setCurrentStep(1);
      setFieldErrors({});
    }
  }, [isOpen, initialData, editingId, entity]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      animateStagger('.form-group', { translateY: [12, 0], opacity: [0, 1], duration: 300 });
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const validateStep = (fieldsToValidate) => {
    const errors = {};
    fieldsToValidate.forEach((f) => {
      const rawVal = formData[f.name];
      const strVal = String(rawVal || '').trim();

      if (f.required && !strVal) {
        errors[f.name] = `${f.label} is required.`;
      } else if (f.required && (f.type === 'text' || !f.type) && strVal.length < 3) {
        errors[f.name] = `${f.label} must be at least 3 characters long.`;
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Save draft in localStorage for new records
    if (!editingId) {
      localStorage.setItem(`crm_form_draft_${entity}`, JSON.stringify(updated));
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

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={onClose}>
      <div className="modal-content wizard-modal-content glass-card" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="wizard-header-title">
            <span className="drawer-entity-badge">{entity?.toUpperCase()} WIZARD</span>
            <h2>{editingId ? `Edit ${title}` : `Create New ${title}`}</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
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
              <button type="button" className="btn btn-outline" onClick={onClose}>
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
    </div>
  );
};

export default FormWizardModal;
