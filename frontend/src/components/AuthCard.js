import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import ApexDevLogo from './ApexDevLogo';
import '../pages/Login.css';

const AuthCard = ({ initialMode = 'signin' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const { login, register, error: authError, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Local Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPass, setShowSignInPass] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    profile_image: ''
  });
  const [showSignUpPass, setShowSignUpPass] = useState(false);

  // Sync mode with route/prop
  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
    setLocalError('');
    setIsSuccess(false);
  }, [initialMode]);

  // Sync auth context error
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      triggerShake();
    }
  }, [authError]);

  // Gentle card shake trigger on error
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleToggle = (targetSignUp) => {
    setIsSignUp(targetSignUp);
    setLocalError('');
    setIsSuccess(false);
    navigate(targetSignUp ? '/register' : '/login', { replace: true });
  };

  // Generate lightweight random floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 4) + 2, // 2px to 6px
      left: Math.random() * 100, // 0% to 100%
      duration: Math.random() * 12 + 10, // 10s to 22s
      delay: Math.random() * 8, // 0s to 8s
      driftX: (Math.random() - 0.5) * 60, // -30px to +30px
      opacity: (Math.random() * 0.4 + 0.25).toFixed(2)
    }));
  }, []);

  const [forgotNotice, setForgotNotice] = useState('');

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotNotice('Password reset link sent! Check your inbox to proceed.');
    setTimeout(() => setForgotNotice(''), 6000);
  };

  const handleQuickDemo = async (email, pass) => {
    setSignInEmail(email);
    setSignInPassword(pass);
    setLocalError('');
    setForgotNotice('');
    setIsSuccess(false);

    try {
      const success = await login(email, pass);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      } else {
        triggerShake();
      }
    } catch (err) {
      setLocalError(err.message || 'Demo login failed.');
      triggerShake();
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setForgotNotice('');
    setIsSuccess(false);

    if (!signInEmail || !signInPassword) {
      setLocalError('Please enter both email and password.');
      triggerShake();
      return;
    }

    try {
      const success = await login(signInEmail, signInPassword);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 700);
      } else {
        triggerShake();
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please verify your credentials.');
      triggerShake();
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSuccess(false);

    try {
      const success = await register({
        name: signUpData.name,
        full_name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
        profile_image: signUpData.profile_image
      });
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 700);
      } else {
        triggerShake();
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
      triggerShake();
    }
  };

  const currentError = localError || (!isSignUp ? authError : '');

  return (
    <div className={`auth-universe ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* Top Floating Theme Switcher */}
      <div className="auth-top-bar">
        <button
          type="button"
          className="auth-theme-switch-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={17} />
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Ambient Moving Gradient Blobs */}
      <div className="auth-glow-orb orb-primary" aria-hidden="true"></div>
      <div className="auth-glow-orb orb-secondary" aria-hidden="true"></div>
      <div className="auth-glow-orb orb-accent" aria-hidden="true"></div>

      {/* Background Canvas: Floating Particles & Shimmer Waves */}
      <div className="auth-background-canvas" aria-hidden="true">
        {/* Subtle SVG Wave Lines */}
        <svg className="auth-waves-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            d="M0,96L48,128C96,160,192,224,288,224C384,224,480,160,576,138.7C672,117,768,139,864,165.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128"
          />
        </svg>

        {/* Floating Ambient Particles */}
        <div className="auth-particles-layer">
          {particles.map((p) => (
            <span
              key={p.id}
              className="auth-particle"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--drift-x': `${p.driftX}px`,
                '--particle-opacity': p.opacity
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Dual-Slider Auth Card with Soft Glowing Aura */}
      <div className="auth-card-aura-wrap">
        <div className="auth-card-aura" aria-hidden="true"></div>

        <div
          className={`auth-sliding-box ${isSignUp ? 'right-panel-active' : ''} ${isShaking ? 'shake-card' : ''}`}
          id="authBox"
        >
          {/* ===================== 1. SIGN IN FORM PANEL ===================== */}
          <div className="form-panel-container sign-in-container">
            <form className="auth-core-form" onSubmit={handleSignInSubmit} noValidate>
              {/* Mobile Header Brand */}
              <div className="auth-mobile-brand">
                <ApexDevLogo size={42} showText={true} />
              </div>

              <div className="form-head-block auth-seq-1">
                <h2>Welcome Back</h2>
                <p>Enter your credentials to access your workspace</p>
              </div>

              {currentError && !isSignUp && (
                <div className="auth-alert-message" role="alert">
                  <Icon name="close" size={16} />
                  <span>{currentError}</span>
                </div>
              )}

              {forgotNotice && !isSignUp && (
                <div className="auth-notice-message" role="status">
                  <Icon name="check" size={16} />
                  <span>{forgotNotice}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="auth-field-wrap auth-seq-2">
                <label htmlFor="signin-email">Email Address</label>
                <div className="auth-field-input-box">
                  <Icon name="mail" className="field-icon" size={18} />
                  <input
                    id="signin-email"
                    type="email"
                    placeholder="name@company.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    autoComplete="email"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-field-wrap auth-seq-3">
                <label htmlFor="signin-password">Password</label>
                <div className="auth-field-input-box">
                  <Icon name="lock" className="field-icon" size={18} />
                  <input
                    id="signin-password"
                    type={showSignInPass ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className={`field-toggle-btn ${showSignInPass ? 'toggled' : ''}`}
                    onClick={() => setShowSignInPass(!showSignInPass)}
                    aria-label={showSignInPass ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    <span className="eye-icon-spin">
                      <Icon name={showSignInPass ? 'eyeOff' : 'eye'} size={18} />
                    </span>
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="auth-options-row auth-seq-4">
                <label className="auth-custom-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-label">Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-text-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Submit Button */}
              <div className="auth-seq-5">
                <button
                  type="submit"
                  className={`auth-submit-btn ${isSuccess ? 'btn-success-state' : ''}`}
                  disabled={loading || isSuccess}
                  id="signInSubmitBtn"
                >
                  {isSuccess ? (
                    <span className="btn-spinner-content">
                      <span className="auth-success-check-icon">
                        <Icon name="check" size={18} />
                      </span>
                      <span>Success! Redirecting...</span>
                    </span>
                  ) : loading && !isSignUp ? (
                    <span className="btn-spinner-content">
                      <span className="auth-spin-ring"></span>
                      <span>Authenticating...</span>
                    </span>
                  ) : (
                    <span>SIGN IN</span>
                  )}
                </button>
              </div>

              {/* Quick 1-Click Demo Convert Chips */}
              <div className="auth-demo-convert-row auth-seq-6">
                <span className="demo-convert-label">Quick 1-Click Access:</span>
                <div className="demo-convert-buttons">
                  <button
                    type="button"
                    className="demo-convert-chip"
                    onClick={() => handleQuickDemo('admin@apexdev.com', 'admin123')}
                    title="1-Click Login as Admin"
                  >
                    ⚡ Admin
                  </button>
                  <button
                    type="button"
                    className="demo-convert-chip"
                    onClick={() => handleQuickDemo('leader@apex.io', 'apex2026')}
                    title="1-Click Login as Leader"
                  >
                    ⚡ Leader
                  </button>
                </div>
              </div>

              {/* Mobile Switch Footer */}
              <div className="auth-mobile-switch auth-seq-7">
                <span>Don't have an account?</span>
                <button
                  type="button"
                  className="auth-switch-text-btn"
                  onClick={() => handleToggle(true)}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>

          {/* ===================== 2. SIGN UP FORM PANEL ===================== */}
          <div className="form-panel-container sign-up-container">
            <form className="auth-core-form" onSubmit={handleSignUpSubmit} noValidate>
              {/* Mobile Header Brand */}
              <div className="auth-mobile-brand">
                <ApexDevLogo size={42} showText={true} />
              </div>

              <div className="form-head-block">
                <h2>Create Account</h2>
                <p>Get started with your enterprise CRM workspace</p>
              </div>

              {currentError && isSignUp && (
                <div className="auth-alert-message" role="alert">
                  <Icon name="close" size={16} />
                  <span>{currentError}</span>
                </div>
              )}

              <div className="auth-field-wrap">
                <label htmlFor="signup-name">Full Name</label>
                <div className="auth-field-input-box">
                  <Icon name="user" className="field-icon" size={18} />
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

              <div className="auth-field-wrap">
                <label htmlFor="signup-email">Email Address</label>
                <div className="auth-field-input-box">
                  <Icon name="mail" className="field-icon" size={18} />
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

              <div className="auth-field-wrap">
                <label htmlFor="signup-password">Password</label>
                <div className="auth-field-input-box">
                  <Icon name="lock" className="field-icon" size={18} />
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
                    className={`field-toggle-btn ${showSignUpPass ? 'toggled' : ''}`}
                    onClick={() => setShowSignUpPass(!showSignUpPass)}
                    aria-label={showSignUpPass ? 'Hide password' : 'Show password'}
                  >
                    <span className="eye-icon-spin">
                      <Icon name={showSignUpPass ? 'eyeOff' : 'eye'} size={18} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="auth-field-wrap">
                <label htmlFor="signup-avatar">Profile Avatar URL (Optional)</label>
                <div className="auth-field-input-box">
                  <Icon name="contact" className="field-icon" size={18} />
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
                className={`auth-submit-btn ${isSuccess ? 'btn-success-state' : ''}`}
                disabled={loading || isSuccess}
              >
                {isSuccess ? (
                  <span className="btn-spinner-content">
                    <span className="auth-success-check-icon">
                      <Icon name="check" size={18} />
                    </span>
                    <span>Account Created! Redirecting...</span>
                  </span>
                ) : loading && isSignUp ? (
                  <span className="btn-spinner-content">
                    <span className="auth-spin-ring"></span>
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <span>SIGN UP</span>
                )}
              </button>

              {/* Mobile Switch Footer */}
              <div className="auth-mobile-switch">
                <span>Already registered?</span>
                <button
                  type="button"
                  className="auth-switch-text-btn"
                  onClick={() => handleToggle(false)}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>

          {/* ===================== 3. SLIDING HERO OVERLAY (Animated Green/Teal Panel) ===================== */}
          <div className="overlay-outer-frame">
            <div className="overlay-sliding-track">
              {/* Green Panel Internal Animated Atmosphere */}
              <div className="panel-ambient-decor" aria-hidden="true">
                <div className="panel-grid-pattern"></div>
                <div className="panel-blob panel-blob-1"></div>
                <div className="panel-blob panel-blob-2"></div>
                <div className="panel-blob panel-blob-3"></div>
                <div className="panel-light-sweep"></div>
              </div>

              {/* Left Overlay Panel (Shown on Sign-Up mode, inviting Sign In) */}
              <div className="overlay-content-panel overlay-panel-left">
                <div className="overlay-glass-card">
                  <div className="overlay-logo-wrap">
                    <div className="overlay-logo-halo"></div>
                    <div className="overlay-logo-floating">
                      <ApexDevLogo size={82} showText={false} />
                    </div>
                  </div>
                  <div className="overlay-badge-chip">
                    <span className="overlay-badge-dot"></span>
                    <span>APEX CRM</span>
                  </div>
                  <h2>Welcome Back!</h2>
                  <p>
                    To stay connected with your team and sales pipelines, please sign in with your account.
                  </p>
                  <button
                    type="button"
                    className="overlay-ghost-btn"
                    onClick={() => handleToggle(false)}
                    id="overlaySignInBtn"
                  >
                    SIGN IN
                  </button>
                </div>
              </div>

              {/* Right Overlay Panel (Shown on Sign-In mode, inviting Sign Up) */}
              <div className="overlay-content-panel overlay-panel-right">
                <div className="overlay-glass-card">
                  <div className="overlay-logo-wrap">
                    <div className="overlay-logo-halo"></div>
                    <div className="overlay-logo-floating">
                      <ApexDevLogo size={82} showText={false} />
                    </div>
                  </div>
                  <div className="overlay-badge-chip">
                    <span className="overlay-badge-dot"></span>
                    <span>JOIN APEX</span>
                  </div>
                  <h2>Hello, Leader!</h2>
                  <p>
                    Enter your details and start your journey with the world's most powerful CRM engine.
                  </p>
                  <button
                    type="button"
                    className="overlay-ghost-btn"
                    onClick={() => handleToggle(true)}
                    id="overlaySignUpBtn"
                  >
                    SIGN UP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
