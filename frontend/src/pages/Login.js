import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';
import ApexDevLogo from '../components/ApexDevLogo';

const Login = () => {
  const { login, error, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
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

      {/* Right Panel: Login Form */}
      <div className="auth-panel auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          {error && (
            <div className="form-status error">
              <Icon name="close" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-icon-wrap">
              <Icon name="mail" className="field-icon" size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-icon-wrap">
              <Icon name="lock" className="field-icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

          <div className="form-options">
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-label">Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-link-btn"
              onClick={() => alert('Password reset link sent to your email.')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner"></span> Signing in...
              </span>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-action-link">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
