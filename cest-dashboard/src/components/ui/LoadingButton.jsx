import { Loader2 } from "lucide-react";

export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary, danger, success
  icon: Icon,
  className = "",
  style = {},
  ...props 
}) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(0, 74, 152, 0.3)'
    },
    secondary: {
      background: '#e2e8f0',
      color: '#0f172a',
      boxShadow: 'none'
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    }
  };

  const variantStyle = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      style={{
        ...variantStyle,
        ...style,
        opacity: isDisabled ? 0.6 : 1
      }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};
