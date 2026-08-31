import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 10% 20%, #fff7ed 0%, #ffedd5 50%, #fef2f2 100%)',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(154, 52, 18, 0.12)',
            border: '1px solid #fed7aa'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#fee2e2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
              Something unexpected occurred
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              {this.state.error?.message || 'An error occurred while loading this view.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                className="btn btn-coral"
                style={{ padding: '10px 18px', fontWeight: 800 }}
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', fontWeight: 800 }}
              >
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
