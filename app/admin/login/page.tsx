'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken, verifying } = useRecaptcha();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // reCAPTCHA verification (skipped automatically in dev if key not set)
    const isHuman = await getToken('admin_login');
    if (!isHuman) {
      setError('Security verification failed. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      // Sign in directly through the Supabase JS client.
      // This stores the session natively in localStorage so that
      // supabase.auth.getSession() in the admin layout always finds it —
      // no manual cookie juggling or setSession() race conditions needed.
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.session) {
        throw new Error(signInError?.message || 'Login failed');
      }

      // Verify admin / staff role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error('Could not verify your account role.');
      }

      if (profile.role !== 'admin' && profile.role !== 'staff') {
        await supabase.auth.signOut();
        throw new Error('Admin or staff access required.');
      }

      // Also set the cookie so the middleware can verify server-side
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      // Navigate — no router.refresh() needed; the Supabase client
      // already has a live session that the admin layout will find.
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #0a0a0f;
          overflow: hidden;
          position: relative;
        }

        /* Animated background */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #6c3de8, transparent 70%);
          top: -200px; left: -100px;
          animation-delay: 0s;
        }
        .bg-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #c026d3, transparent 70%);
          bottom: -150px; right: -100px;
          animation-delay: -4s;
        }
        .bg-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #0ea5e9, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -2s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* Grid pattern */
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        /* Left branding panel */
        .brand-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px;
          position: relative;
          z-index: 1;
        }

        .brand-logo-wrap {
          margin-bottom: 40px;
          opacity: 0;
          animation: slideUp 0.8s ease forwards 0.2s;
        }

        .brand-logo {
          height: 120px;
          width: auto;
          filter: drop-shadow(0 0 40px rgba(108, 61, 232, 0.5));
        }

        .brand-title {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #c026d3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          text-align: center;
          opacity: 0;
          animation: slideUp 0.8s ease forwards 0.4s;
        }

        .brand-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          margin-top: 12px;
          text-align: center;
          letter-spacing: 0.5px;
          opacity: 0;
          animation: slideUp 0.8s ease forwards 0.6s;
        }

        .brand-stats {
          display: flex;
          gap: 40px;
          margin-top: 60px;
          opacity: 0;
          animation: slideUp 0.8s ease forwards 0.8s;
        }

        .brand-stat {
          text-align: center;
        }

        .brand-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #a78bfa;
        }

        .brand-stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }

        .brand-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.1);
          align-self: center;
        }

        /* Right login panel */
        .login-panel {
          width: 480px;
          min-height: 100vh;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 48px;
          position: relative;
          z-index: 1;
        }

        .login-header {
          margin-bottom: 40px;
          opacity: 0;
          animation: slideUp 0.8s ease forwards 0.3s;
        }

        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(108, 61, 232, 0.15);
          border: 1px solid rgba(108, 61, 232, 0.3);
          color: #a78bfa;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .login-badge-dot {
          width: 6px; height: 6px;
          background: #a78bfa;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .login-title {
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .login-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-top: 8px;
          line-height: 1.6;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          opacity: 0;
          animation: slideUp 0.8s ease forwards 0.5s;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.3px;
        }

        .field-wrap {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25);
          font-size: 17px;
          pointer-events: none;
          transition: color 0.2s;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px 14px 46px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
        }

        .field-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .field-input:focus {
          border-color: rgba(108, 61, 232, 0.6);
          background: rgba(108, 61, 232, 0.08);
          box-shadow: 0 0 0 3px rgba(108, 61, 232, 0.12);
        }

        .field-input:focus + .field-icon-after,
        .field-wrap:focus-within .field-icon {
          color: rgba(108, 61, 232, 0.8);
        }

        .field-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.25);
          cursor: pointer;
          font-size: 17px;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .field-toggle:hover {
          color: rgba(255,255,255,0.6);
        }

        /* Error */
        .error-box {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .error-icon {
          color: #f87171;
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .error-title {
          font-size: 13px;
          font-weight: 600;
          color: #fca5a5;
        }

        .error-msg {
          font-size: 12px;
          color: rgba(252, 165, 165, 0.7);
          margin-top: 2px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #6c3de8 0%, #c026d3 100%);
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
          margin-top: 4px;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #7c4df8 0%, #d946ef 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .submit-btn:hover::before {
          opacity: 1;
        }

        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(108, 61, 232, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .submit-btn-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spin {
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .login-footer {
          margin-top: 32px;
          opacity: 0;
          animation: slideUp 0.8s ease forwards 0.7s;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: rgba(255,255,255,0.7);
        }

        /* Animated entrance */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .brand-panel { display: none; }
          .login-panel {
            width: 100%;
            border-left: none;
            padding: 40px 28px;
          }
        }
      `}</style>

      <div className="login-root">
        {/* Animated background */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />

        {/* Left branding panel */}
        <div className="brand-panel">
          <div className="brand-logo-wrap">
            <Link href="/">
              <img src="/touchee-logo.png" alt="TOUCHEEGLOW" className="brand-logo" />
            </Link>
          </div>
          <div className="brand-title">TOUCHEEGLOW</div>
          <div className="brand-subtitle">Admin Command Center</div>
          <div className="brand-stats">
            <div className="brand-stat">
              <div className="brand-stat-value">∞</div>
              <div className="brand-stat-label">Products</div>
            </div>
            <div className="brand-divider" />
            <div className="brand-stat">
              <div className="brand-stat-value">24/7</div>
              <div className="brand-stat-label">Uptime</div>
            </div>
            <div className="brand-divider" />
            <div className="brand-stat">
              <div className="brand-stat-value">100%</div>
              <div className="brand-stat-label">Secure</div>
            </div>
          </div>
        </div>

        {/* Right login panel */}
        <div className="login-panel">
          <div className="login-header">
            <div className="login-badge">
              <span className="login-badge-dot" />
              Admin Portal
            </div>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-desc">Sign in to access the TOUCHEEGLOW admin dashboard and manage your store.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form" id="admin-login-form">
            {error && (
              <div className="error-box">
                <i className="ri-error-warning-line error-icon" />
                <div>
                  <div className="error-title">Authentication Failed</div>
                  <div className="error-msg">{error}</div>
                </div>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="admin-email" className="field-label">Email Address</label>
              <div className="field-wrap">
                <i className="ri-mail-line field-icon" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                  placeholder="toucheeglow@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="admin-password" className="field-label">Password</label>
              <div className="field-wrap">
                <i className="ri-lock-line field-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="field-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-btn"
              disabled={isLoading || verifying}
              className="submit-btn"
            >
              <span className="submit-btn-inner">
                {isLoading || verifying ? (
                  <>
                    <span className="spin">
                      <i className="ri-loader-4-line" />
                    </span>
                    <span>{verifying ? 'Verifying...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    <i className="ri-shield-check-line" />
                    <span>Sign In Securely</span>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="login-footer">
            <Link href="/" className="back-link">
              <i className="ri-arrow-left-line" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
