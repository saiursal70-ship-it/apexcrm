import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';
import ApexDevLogo from '../components/ApexDevLogo';

const Register = () => {
  const { register, error, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile_image: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await register({
      name: formData.name,
      full_name: formData.name,
      email: formData.email,
      password: formData.password,
      profile_image: formData.profile_image
    });

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={`auth-screen ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* Top Floating Theme Switcher */}
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        title="Toggle Theme"
      >
        <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      {/* Left Panel: Round Circle Logo Only */}
      <div className="auth-panel auth-branding-panel">
        <div className="auth-bg-blob blob-1"></div>
        <div className="auth-bg-blob blob-2"></div>
        <div className="circle-logo-wrap">
          <ApexDevLogo size={140} showText={false} />
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div className="auth-panel auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Add your details to get started</p>

          {error && (
            <div className="form-status error">
              <Icon name="close" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div className="input-icon-wrap">
              <Icon name="user" className="field-icon" size={18} />
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-icon-wrap">
              <Icon name="mail" className="field-icon" size={18} />
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="input-icon-wrap">
              <Icon name="lock" className="field-icon" size={18} />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-image">Profile Avatar URL (Optional)</label>
            <div className="input-icon-wrap">
              <Icon name="contact" className="field-icon" size={18} />
              <input
                id="reg-image"
                type="url"
                name="profile_image"
                placeholder="https://... (leave blank for default)"
                value={formData.profile_image}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner"></span> Creating Account...
              </span>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-action-link">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;