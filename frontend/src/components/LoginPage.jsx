import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    try {
      setIsLoading(true);

      // Authenticate with backend API
      try {
        const response = await api.login(cleanUser, cleanPass);
        if (response?.user) {
          api.setStoredUser(response.user);
          onLoginSuccess(response.user);
          return;
        }
      } catch (backendErr) {
        // Fallback local validation matching the 2 authorized credentials
        const lowerUser = cleanUser.toLowerCase();
        const isHostelAdmin = (lowerUser === 'swasthishree_admin' || lowerUser === 'swasthishree_mangalore' || lowerUser === 'hostel_admin') && cleanPass === 'Swasthi@24';
        const isMasterAdmin = (lowerUser === 'master_admin' || lowerUser === 'admin' || lowerUser === 'skchinnu' || lowerUser === 'developer_admin') && cleanPass === 'Manipal@0818';

        if (isHostelAdmin) {
          const userPayload = {
            username: 'swasthishree_admin',
            name: 'Swasthishree Admin',
            role: 'Hostel Admin',
            token: `auth-${Date.now()}`,
            loggedInAt: new Date().toISOString()
          };
          api.setStoredUser(userPayload);
          onLoginSuccess(userPayload);
          return;
        }

        if (isMasterAdmin) {
          const userPayload = {
            username: 'master_admin',
            name: 'Master Admin',
            role: 'Master Admin',
            token: `auth-${Date.now()}`,
            loggedInAt: new Date().toISOString()
          };
          api.setStoredUser(userPayload);
          onLoginSuccess(userPayload);
          return;
        }

        setErrorMsg(backendErr.message || 'Invalid username or password. Access denied.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, #fff7ed 0%, #ffedd5 50%, #fef2f2 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Rings */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, transparent 70%)',
        top: '-150px',
        right: '-100px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, transparent 70%)',
        bottom: '-120px',
        left: '-100px',
        pointerEvents: 'none'
      }} />

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 45px -10px rgba(154, 52, 18, 0.15), 0 0 0 1px rgba(254, 215, 170, 0.6)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Branding */}
        <div style={{
          padding: '36px 30px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #fffaf5 0%, #ffffff 100%)',
          borderBottom: '1px solid #fed7aa'
        }}>
          {/* Logo Badge with Building Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 14px',
            borderRadius: '18px',
            background: 'var(--gradient-coral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)'
          }}>
            <Building2 size={32} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            ಸ್ವಸ್ತಿ ಶ್ರೀ <span style={{ color: 'var(--color-coral)' }}>Swasthishree</span>
          </h1>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            padding: '3px 10px',
            borderRadius: '20px',
            background: '#ffedd5',
            color: '#9a3412',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <ShieldCheck size={13} />
            <span>Secure Admin Portal</span>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 30px 32px' }}>
          {errorMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              marginBottom: '20px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'shake 0.3s ease-in-out'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            {/* Username Input */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: '40px',
                    height: '46px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    borderRadius: '12px'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: '40px',
                    paddingRight: '42px',
                    height: '46px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    borderRadius: '12px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-coral"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '0.96rem',
                fontWeight: 800,
                borderRadius: '12px',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(234, 88, 12, 0.3)'
              }}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
