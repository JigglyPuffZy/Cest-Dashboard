import { useState } from "react";
import { Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { useAuth } from "../../shared/hooks/useAuth.jsx";
import dostLogo from "../../dost logo.png";

export const LoginPage = ({ darkMode, setDarkMode }) => {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await signIn(email, password);
      // Navigation will be handled by the auth state change
    } catch (err) {
      console.error('Login error:', err);
      
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      
      // Handle specific error messages
      let errorMessage = 'Failed to sign in';
      
      if (err.message?.includes('Invalid login credentials') || 
          err.message?.includes('invalid_credentials') ||
          err.message?.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (err.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (err.message?.includes('User not found') || 
                 err.message?.includes('user_not_found')) {
        errorMessage = 'No account found with this email address.';
      } else if (err.message?.includes('network') || 
                 err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const cardStyles = {
    background: darkMode 
      ? 'rgba(15, 23, 42, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)'}`,
    boxShadow: darkMode 
      ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
      : '0 20px 60px rgba(0, 74, 152, 0.15)'
  };

  const inputStyles = {
    background: darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.6)',
    border: `1px solid ${darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)'}`,
    color: darkMode ? '#f8fafc' : '#0f172a'
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #004A98 0%, #0066CC 50%, #004A98 100%)'
      }}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 left-4 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 border-2 group z-50"
        style={{
          backgroundColor: darkMode ? '#422006' : '#fef3c7',
          borderColor: darkMode ? '#92400e' : '#fcd34d',
          color: darkMode ? '#fbbf24' : '#d97706',
          boxShadow: darkMode 
            ? '0 4px 12px rgba(251, 191, 36, 0.3)' 
            : '0 4px 12px rgba(217, 119, 6, 0.3)'
        }}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? (
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 80%, white 2px, transparent 2px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 items-center relative z-10">
        <div 
          className={`rounded-3xl p-6 lg:p-8 animate-fade-in ${isShaking ? 'animate-shake' : ''}`} 
          style={cardStyles}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
                  boxShadow: '0 4px 12px rgba(0, 74, 152, 0.3)'
                }}
              >
                <img 
                  src={dostLogo} 
                  alt="DOST Logo" 
                  className="w-6 h-6 object-contain" 
                />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  CEST 2.0
                </h2>
                <p className="text-[10px] font-medium" style={{ color: darkMode ? '#64748b' : '#64748b' }}>
                  DOST Dashboard
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Welcome Back
            </h1>
            <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              Sign in to access your CEST 2.0 dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div 
                className="p-4 rounded-xl border transition-all duration-300 animate-slide-down relative overflow-hidden" 
                style={{
                  backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                  borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                  color: darkMode ? '#fca5a5' : '#dc2626',
                  boxShadow: darkMode 
                    ? '0 8px 25px rgba(239, 68, 68, 0.2)' 
                    : '0 8px 25px rgba(220, 38, 38, 0.15)'
                }}
              >
                {/* Animated background pulse */}
                <div 
                  className="absolute inset-0 opacity-10 animate-pulse-slow"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(239, 68, 68, 0.3) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 3s ease-in-out infinite'
                  }}
                />
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center animate-bounce-slow"
                      style={{
                        background: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)',
                        border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(220, 38, 38, 0.2)'}`
                      }}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold">Authentication Failed</p>
                      <button
                        onClick={() => setError("")}
                        className="p-1 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-red-500/20"
                        style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{error}</p>
                    
                    {/* Progress bar animation */}
                    <div className="mt-3 h-1 rounded-full overflow-hidden" style={{
                      background: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.1)'
                    }}>
                      <div 
                        className="h-full rounded-full animate-progress"
                        style={{
                          background: darkMode ? '#fca5a5' : '#dc2626',
                          width: '0%',
                          animation: 'progress-fill 2s ease-out forwards'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Email Address <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full py-2.5 px-4 pl-10 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyles}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#004A98';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 74, 152, 0.08)';
                    e.target.style.transform = 'scale(1.01)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                  required
                />
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200" 
                  style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full py-2.5 px-4 pl-10 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyles}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#004A98';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 74, 152, 0.08)';
                    e.target.style.transform = 'scale(1.01)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                  required
                />
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200" 
                  style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-blue-500/10"
                  style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
                boxShadow: '0 4px 16px rgba(0, 74, 152, 0.3)'
              }}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
              
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse">Signing In...</span>
                </div>
              ) : (
                <span className="relative z-10">Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs mb-2" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
              Need help accessing your account?
            </p>
            <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              Contact your system administrator for assistance
            </p>
          </div>

          <p className="text-center text-[10px] mt-6" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>
            Copyright © CEST 2.0, All Right Reserved · Terms & Condition · Privacy & Policy
          </p>
        </div>

        <div className="hidden lg:block">
          <div className="relative">
            <div 
              className="rounded-3xl p-6 animate-fade-in"
              style={{
                background: darkMode 
                  ? 'rgba(15, 23, 42, 0.6)' 
                  : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.3)'}`
              }}
            >
              <div className="space-y-4">
                <div 
                  className="rounded-2xl p-5"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Project Overview
                    </h3>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{ background: '#004A98', color: '#ffffff' }}>
                      Region II
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      ₱2,005.45M
                    </div>
                    <p className="text-[10px] mb-3" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                      Total Budget Allocated
                    </p>
                  </div>

                  <div className="relative h-32 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 200 100">
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#004A98', stopOpacity: 0.8 }} />
                          <stop offset="100%" style={{ stopColor: '#004A98', stopOpacity: 0.1 }} />
                        </linearGradient>
                      </defs>
                      
                      <path
                        d="M 0 80 Q 25 60, 50 65 T 100 55 T 150 45 T 200 40 L 200 100 L 0 100 Z"
                        fill="url(#gradient1)"
                        opacity="0.6"
                      >
                        <animate
                          attributeName="d"
                          dur="3s"
                          repeatCount="indefinite"
                          values="
                            M 0 80 Q 25 60, 50 65 T 100 55 T 150 45 T 200 40 L 200 100 L 0 100 Z;
                            M 0 75 Q 25 65, 50 60 T 100 50 T 150 48 T 200 45 L 200 100 L 0 100 Z;
                            M 0 80 Q 25 60, 50 65 T 100 55 T 150 45 T 200 40 L 200 100 L 0 100 Z
                          "
                        />
                      </path>
                      
                      <path
                        d="M 0 70 Q 25 55, 50 58 T 100 48 T 150 38 T 200 35"
                        fill="none"
                        stroke="#004A98"
                        strokeWidth="2"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="d"
                          dur="3s"
                          repeatCount="indefinite"
                          values="
                            M 0 70 Q 25 55, 50 58 T 100 48 T 150 38 T 200 35;
                            M 0 65 Q 25 60, 50 53 T 100 43 T 150 41 T 200 40;
                            M 0 70 Q 25 55, 50 58 T 100 48 T 150 38 T 200 35
                          "
                        />
                      </path>

                      {[0, 50, 100, 150, 200].map((x, i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={70 - i * 8}
                          r="2.5"
                          fill="#004A98"
                          opacity="0.8"
                        >
                          <animate
                            attributeName="cy"
                            dur="3s"
                            repeatCount="indefinite"
                            values={`${70 - i * 8};${65 - i * 8};${70 - i * 8}`}
                          />
                        </circle>
                      ))}
                    </svg>
                    
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px]" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>May</span>
                      <span>Jul</span>
                      <span>Sep</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Budgeted Expenses', value: 45, color: '#004A98', delay: '0s' },
                      { label: 'Additional Spending', value: 30, color: '#0066CC', delay: '0.2s' },
                      { label: 'In Stock', value: 25, color: '#10b981', delay: '0.4s' }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: item.color }}
                            />
                            <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{item.label}</span>
                          </div>
                          <span style={{ color: darkMode ? '#f8fafc' : '#0f172a' }} className="font-bold">{item.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.5)' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${item.value}%`, 
                              background: item.color,
                              animationDelay: item.delay
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div 
                  className="rounded-2xl p-5"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <h3 className="text-xs font-semibold mb-3" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Recent Activities
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { title: 'New Project Added', amount: '₱350K', status: 'success', icon: '📊' },
                      { title: 'Budget Review', amount: '₱125K', status: 'pending', icon: '💰' },
                      { title: 'Equipment Purchase', amount: '₱89K', status: 'completed', icon: '🔧' }
                    ].map((activity, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                        style={{
                          background: darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.6)'
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                          style={{
                            background: activity.status === 'success' 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : activity.status === 'pending' 
                              ? 'rgba(245, 158, 11, 0.2)' 
                              : 'rgba(0, 74, 152, 0.2)'
                          }}
                        >
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                            {activity.title}
                          </p>
                          <p className="text-[10px]" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                            {activity.amount}
                          </p>
                        </div>
                        <div 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                          style={{ 
                            background: activity.status === 'success' ? '#10b981' : activity.status === 'pending' ? '#f59e0b' : '#004A98'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounceGentle 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

