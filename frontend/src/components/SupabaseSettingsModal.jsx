import React, { useState } from 'react';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Server
} from 'lucide-react';

export default function SupabaseSettingsModal({ isOpen, onClose, supabaseStatus, onRefreshStatus }) {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    await onRefreshStatus();
    setTimeout(() => setIsTesting(false), 500);
  };

  const handleCopyEnvSample = () => {
    const text = `PORT=5000\nSUPABASE_URL=https://your-project.supabase.co\nSUPABASE_ANON_KEY=your-anon-key\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Supabase Database Connection</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Production PostgreSQL Database & Storage Configuration
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Box */}
          <div style={{
            padding: '18px',
            borderRadius: 'var(--radius-lg)',
            background: supabaseStatus?.connected ? '#dcfce7' : '#fff7ed',
            border: `1.5px solid ${supabaseStatus?.connected ? '#86efac' : '#fed7aa'}`,
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {supabaseStatus?.connected ? (
                  <CheckCircle2 size={22} color="#15803d" />
                ) : (
                  <AlertCircle size={22} color="#c2410c" />
                )}
                <strong style={{ fontSize: '1rem', color: supabaseStatus?.connected ? '#15803d' : '#c2410c' }}>
                  {supabaseStatus?.connected ? 'Connected to Supabase PostgreSQL' : 'Local Dynamic Store (Ready for Supabase keys)'}
                </strong>
              </div>

              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              >
                <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
              {supabaseStatus?.message || 'Database server is active.'}
            </p>

            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '16px' }}>
              <span>Endpoint: <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{supabaseStatus?.supabaseUrl || 'localhost:5000'}</strong></span>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={16} color="var(--color-coral)" />
              Connect Your Supabase Project (3 Easy Steps):
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <strong>Step 1: Create Supabase Project</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                  Visit <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--color-coral)', textDecoration: 'underline', fontWeight: 700 }}>supabase.com/dashboard</a> and create a project.
                </p>
              </div>

              <div style={{ padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <strong>Step 2: Add Keys to <code>backend/.env</code></strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                  Paste your Project URL & Anon Key from <strong>Settings &gt; API</strong> into <code>backend/.env</code>.
                </p>
              </div>

              <div style={{ padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <strong>Step 3: Run SQL Schema Migration</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                  Open <strong>SQL Editor</strong> in Supabase, paste <code>backend/supabase_schema.sql</code>, and click <strong>Run</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Template Copy */}
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                backend/.env Variables Template
              </span>
              <button
                onClick={handleCopyEnvSample}
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              >
                {copied ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Template'}
              </button>
            </div>
            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#0f172a',
              overflowX: 'auto',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              padding: '10px',
              borderRadius: '6px'
            }}>
{`PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-coral">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
