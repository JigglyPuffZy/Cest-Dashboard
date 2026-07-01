import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export const Toast = ({ 
  message, 
  type = "success", 
  duration = 3000,
  onClose,
  position = "top-right" 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const types = {
    success: {
      icon: CheckCircle,
      bg: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.1)',
      border: '#059669'
    },
    error: {
      icon: XCircle,
      bg: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.1)',
      border: '#dc2626'
    },
    warning: {
      icon: AlertCircle,
      bg: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.1)',
      border: '#d97706'
    },
    info: {
      icon: Info,
      bg: '#3b82f6',
      bgLight: 'rgba(59, 130, 246, 0.1)',
      border: '#2563eb'
    }
  };

  const config = types[type] || types.success;
  const Icon = config.icon;

  const positions = {
    'top-right': 'top-6 right-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2'
  };

  return (
    <div 
      className={`fixed ${positions[position]} z-[70] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{
        minWidth: '320px',
        maxWidth: '480px'
      }}
    >
      <div 
        className="flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: `2px solid ${config.border}`
        }}
      >
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ 
            background: config.bgLight,
            border: `1px solid ${config.border}`
          }}
        >
          <Icon className="w-5 h-5" style={{ color: config.bg }} />
        </div>
        
        <p className="flex-1 text-sm font-medium text-white">
          {message}
        </p>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
