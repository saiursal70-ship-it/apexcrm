import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import ApexDevLogo from './ApexDevLogo';

const AuthCard = ({ initialMode = 'signin' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const { login, register, error, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPass, setShowSignInPass] = useState(false);

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    profile_image: ''
  });
  const [showSignUpPass, setShowSignUpPass] = useState(false);

  // Keep state in sync if prop changes
  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  const handleToggle = (targetSignUp) => {
    setIsSignUp(targetSignUp);
    navigate(targetSignUp ? '/register' : '/login', { replace: true });
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    const success = await login(signInEmail, signInPassword);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const success = await register({
      name: signUpData.name,
      full_name: signUpData.name,
      email: signUpData.email,
      password: signUpData.password,
      profile_image: signUpData.profile_image
    });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={`auth-card-screen ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* Top Floating Theme Switcher */}
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={toggleTheme}
        title="Toggle Theme"
        aria-label="Toggle Theme"
      >
        <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      {/* Ambient background particles/blobs */}
      <div className="auth-ambient-blob blob-left"></div>
      <div className="auth-ambient-blob blob-right"></div>

      {/* Main Sliding Auth Card Container */}
      <div className={`auth-sliding-card ${isSignUp ? 'signup-mode' : 'signin-mode'}`}>
        
        {/* Animated Diagonal Background Layers */}
        <div className={`card-bg card-bg-1 ${isSignUp ? 'signup' : 'signin'}`}></div>
        <div className={`card-bg card-bg-2 ${isSignUp ? 'signup' : 'signin'}`}></div>

        {/* Floating Brand Logos with Transition */}
        <div className={`brand-logo-layer logo-1 ${!isSignUp ? 'visible' : ''}`}>
          <div className="brand-logo-content">
            <ApexDevLogo size={90} showText={false} />
            <div className="brand-badge-pill">APEX CRM</div>
            <p className="brand-tagline">Next-Gen Enterprise Engine</p>
          </div>
        </div>

        <div className={`brand-logo-layer logo-2 ${isSignUp ? 'visible' : ''}`}>
          <div className="brand-logo-content">
            <ApexDevLogo size={90} showText={false} />
            <div className="brand-badge-pill">JOIN APEX</div>
            <p className="brand-tagline">Scale Pipelines & Workflows</p>
          </div>
        </div>

        {/* 1. SIGN IN FORM PANEL */}
        <div className={`auth-form-side form-signin ${!isSignUp ? 'active' : ''}`}>
          <form className="auth-form-inner" onSubmit={handleSignInSubmit}>
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your CRM workspace</p>
            </div>

            {error && !isSignUp && (
              <div className="auth-error-banner">
                <Icon name="close" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-input-group">
              <label htmlFor="signin-email">Email Address</label>
              <div className="auth-input-box">
                <Icon name="mail" className="input-icon" size={18} />
                <input
                  id="signin-email"
                  type="email"
                  placeholder="name@company.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="signin-password">Password</label>
              <div className="auth-input-box">
                <Icon name="lock" className="input-icon" size={18} />
                <input
                  id="signin-password"
                  type={showSignInPass ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowSignInPass(!showSignInPass)}
                  aria-label={showSignInPass ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showSignInPass ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="auth-meta-row">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => alert('Password reset link sent to your email.')}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={loading}
            >
              {loading && !isSignUp ? (
                <span className="btn-spinner-wrap">
                  <span className="auth-spinner"></span> Authenticating...
                </span>
              ) : (
                <span>SIGN IN</span>
              )}
            </button>

            <div className="auth-switch-prompt">
              <span>Don't have an account?</span>
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => handleToggle(true)}
              >
                <em>Sign Up</em>
              </button>
            </div>
          </form>
        </div>

        {/* 2. SIGN UP FORM PANEL */}
        <div className={`auth-form-side form-signup ${isSignUp ? 'active' : ''}`}>
          <form className="auth-form-inner" onSubmit={handleSignUpSubmit}>
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Get started with your enterprise account</p>
            </div>

            {error && isSignUp && (
              <div className="auth-error-banner">
                <Icon name="close" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-input-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className="auth-input-box">
                <Icon name="user" className="input-icon" size={18} />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="signup-email">Email Address</label>
              <div className="auth-input-box">
                <Icon name="mail" className="input-icon" size={18} />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="name@company.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-box">
                <Icon name="lock" className="input-icon" size={18} />
                <input
                  id="signup-password"
                  type={showSignUpPass ? 'text' : 'password'}
                  placeholder="Create strong password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowSignUpPass(!showSignUpPass)}
                  aria-label={showSignUpPass ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showSignUpPass ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="signup-avatar">Profile Avatar URL (Optional)</label>
              <div className="auth-input-box">
                <Icon name="contact" className="input-icon" size={18} />
                <input
                  id="signup-avatar"
                  type="url"
                  placeholder="https://... (optional)"
                  value={signUpData.profile_image}
                  onChange={(e) => setSignUpData({ ...signUpData, profile_image: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={loading}
            >
              {loading && isSignUp ? (
                <span className="btn-spinner-wrap">
                  <span className="auth-spinner"></span> Creating Account...
                </span>
              ) : (
                <span>SIGN UP</span>
              )}
            </button>

            <div className="auth-switch-prompt">
              <span>Already registered?</span>
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => handleToggle(false)}
              >
                <em>Sign In</em>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AuthCard;
