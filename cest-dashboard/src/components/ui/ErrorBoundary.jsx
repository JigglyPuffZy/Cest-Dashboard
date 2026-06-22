import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo || { componentStack: 'No component stack available' }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div 
            className="max-w-md w-full p-6 rounded-2xl shadow-xl text-center"
            style={{
              background: this.props.darkMode ? '#1e293b' : '#ffffff',
              border: `1px solid ${this.props.darkMode ? '#334155' : '#e2e8f0'}`
            }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: this.props.darkMode ? '#f8fafc' : '#0f172a' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-4" style={{ color: this.props.darkMode ? '#94a3b8' : '#64748b' }}>
              An error occurred while rendering this component. Please refresh the page or try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium" style={{ color: '#ef4444' }}>
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 rounded text-xs overflow-auto" style={{
                  background: this.props.darkMode ? '#0f172a' : '#f8fafc',
                  color: this.props.darkMode ? '#f8fafc' : '#0f172a'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack ? 
                    this.state.errorInfo.componentStack : 
                    '\nNo component stack available'}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;