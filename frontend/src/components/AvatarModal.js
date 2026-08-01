import React, { useState } from 'react';
import Avatar3D from './Avatar3D';
import Icon from './Icon';

const SUIT_COLORS = [
  { name: 'Executive Navy', value: '#1e293b' },
  { name: 'Midnight Black', value: '#0f172a' },
  { name: 'Royal Blue', value: '#1e3a8a' },
  { name: 'Deep Burgundy', value: '#701a75' },
  { name: 'Emerald Green', value: '#065f46' },
  { name: 'Charcoal Grey', value: '#334155' },
];

const TIE_COLORS = [
  { name: 'Crimson Red', value: '#dc2626' },
  { name: 'Royal Sapphire', value: '#2563eb' },
  { name: 'Golden Amber', value: '#d97706' },
  { name: 'Indigo Elegance', value: '#4f46e5' },
  { name: 'Emerald Velvet', value: '#059669' },
];

const SKIN_TONES = [
  { name: 'Light', value: '#f5d0a9' },
  { name: 'Fair', value: '#ffdbac' },
  { name: 'Warm', value: '#e0ac69' },
  { name: 'Bronze', value: '#c68642' },
  { name: 'Deep', value: '#8d5524' },
];

const HAIR_COLORS = [
  { name: 'Midnight Jet', value: '#1a1a1a' },
  { name: 'Dark Mocha', value: '#3a2010' },
  { name: 'Chestnut Brown', value: '#6b3e26' },
  { name: 'Honey Blond', value: '#d4a373' },
  { name: 'Auburn Rust', value: '#8b3a2b' },
];

const AvatarModal = ({ config, onSave, onClose }) => {
  const [avatarState, setAvatarState] = useState({
    gender: config?.gender || 'boy',
    suitColor: config?.suitColor || '#1e293b',
    shirtColor: config?.shirtColor || '#ffffff',
    tieColor: config?.tieColor || '#dc2626',
    skinColor: config?.skinColor || '#f5d0a9',
    hairColor: config?.hairColor || '#1a1a1a',
    glasses: config?.glasses || false,
  });

  const handleSave = () => {
    onSave(avatarState);
    onClose();
  };

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal-header">
          <div className="avatar-modal-title">
            <span className="badge-3d">3D MODULE</span>
            <h2>Customize Your 3D Avatar</h2>
          </div>
          <button className="icon-btn close-btn" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="avatar-modal-body">
          {/* Left Column: Interactive 3D Preview */}
          <div className="avatar-preview-col">
            <div className="avatar-3d-stage">
              <Avatar3D {...avatarState} width="100%" height="280px" interactive={true} />
              <div className="stage-shadow" />
            </div>
            <p className="stage-hint">
              ✨ <b>Interactive 3D View</b>: Click and drag model to rotate 360°
            </p>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="avatar-controls-col">
            {/* Gender Selection */}
            <div className="control-group">
              <label className="control-label">Avatar Identity & Gender</label>
              <div className="gender-toggle-buttons">
                <button
                  className={`gender-btn ${avatarState.gender === 'boy' ? 'active' : ''}`}
                  onClick={() => setAvatarState({ ...avatarState, gender: 'boy' })}
                >
                  <span className="gender-icon">👨‍💼</span>
                  <div>
                    <b>Boy (Male)</b>
                    <small>Professional Suit & Tie</small>
                  </div>
                </button>

                <button
                  className={`gender-btn ${avatarState.gender === 'girl' ? 'active' : ''}`}
                  onClick={() => setAvatarState({ ...avatarState, gender: 'girl' })}
                >
                  <span className="gender-icon">👩‍💼</span>
                  <div>
                    <b>Girl (Female)</b>
                    <small>Professional Blazer & Jewelry</small>
                  </div>
                </button>
              </div>
            </div>

            {/* Suit / Blazer Color */}
            <div className="control-group">
              <label className="control-label">Professional Suit / Blazer Attire</label>
              <div className="color-swatch-grid">
                {SUIT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`swatch-btn ${avatarState.suitColor === c.value ? 'selected' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => setAvatarState({ ...avatarState, suitColor: c.value })}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Tie / Accent Color */}
            <div className="control-group">
              <label className="control-label">
                {avatarState.gender === 'boy' ? 'Necktie Color' : 'Accent Style Color'}
              </label>
              <div className="color-swatch-grid">
                {TIE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`swatch-btn ${avatarState.tieColor === c.value ? 'selected' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => setAvatarState({ ...avatarState, tieColor: c.value })}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="control-group">
              <label className="control-label">Hair Tone</label>
              <div className="color-swatch-grid">
                {HAIR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`swatch-btn ${avatarState.hairColor === c.value ? 'selected' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => setAvatarState({ ...avatarState, hairColor: c.value })}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Skin Tone */}
            <div className="control-group">
              <label className="control-label">Skin Tone</label>
              <div className="color-swatch-grid">
                {SKIN_TONES.map((c) => (
                  <button
                    key={c.value}
                    className={`swatch-btn ${avatarState.skinColor === c.value ? 'selected' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => setAvatarState({ ...avatarState, skinColor: c.value })}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Glasses Toggle */}
            <div className="control-group toggle-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={avatarState.glasses}
                  onChange={(e) => setAvatarState({ ...avatarState, glasses: e.target.checked })}
                />
                <span className="checkmark" />
                <span className="checkbox-text">👓 Wear Executive Eyeglasses</span>
              </label>
            </div>
          </div>
        </div>

        <div className="avatar-modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary glow-btn" onClick={handleSave}>
            Save 3D Avatar Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
