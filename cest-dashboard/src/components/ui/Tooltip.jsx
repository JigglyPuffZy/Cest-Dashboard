import { useState, useRef, useEffect } from 'react';

export const HoverTooltip = ({ 
  children, 
  content, 
  position = 'auto',
  darkMode = false,
  delay = 200 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
      // Calculate best position after tooltip becomes visible
      setTimeout(() => calculatePosition(), 10);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!tooltipRef.current || !containerRef.current) return;

    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let bestPosition = position === 'auto' ? 'top' : position;

    // Check if current position fits in viewport
    const positions = ['top', 'bottom', 'left', 'right'];
    const spacing = 12; // Gap between tooltip and element

    for (const pos of positions) {
      let fits = true;
      
      switch (pos) {
        case 'top':
          if (containerRect.top - tooltipRect.height - spacing < 0) fits = false;
          break;
        case 'bottom':
          if (containerRect.bottom + tooltipRect.height + spacing > viewport.height) fits = false;
          break;
        case 'left':
          if (containerRect.left - tooltipRect.width - spacing < 0) fits = false;
          break;
        case 'right':
          if (containerRect.right + tooltipRect.width + spacing > viewport.width) fits = false;
          break;
      }

      if (fits) {
        bestPosition = pos;
        break;
      }
    }

    // If no position fits perfectly, choose the one with most space
    if (bestPosition === position && position === 'auto') {
      const spaces = {
        top: containerRect.top,
        bottom: viewport.height - containerRect.bottom,
        left: containerRect.left,
        right: viewport.width - containerRect.right
      };
      bestPosition = Object.keys(spaces).reduce((a, b) => spaces[a] > spaces[b] ? a : b);
    }

    setActualPosition(bestPosition);
  };

  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-3';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-3';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-3';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-3';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-3';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-[9999] px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap pointer-events-none ${getPositionClasses()}`}
          style={{
            background: darkMode 
              ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            color: darkMode ? '#e2e8f0' : '#1e293b',
            border: darkMode 
              ? '1px solid rgba(148, 163, 184, 0.3)' 
              : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: darkMode
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 10px 25px -5px rgba(0, 74, 152, 0.15), 0 0 0 1px rgba(0, 74, 152, 0.1)',
            backdropFilter: 'blur(8px)',
            animation: 'tooltipSlideIn 0.2s ease-out forwards',
            maxWidth: '200px',
            fontSize: '11px',
            lineHeight: '1.4'
          }}
        >
          {content}
          
          {/* Simplified Arrow */}
          <div 
            className="absolute"
            style={{
              ...(actualPosition === 'top' && {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: darkMode 
                  ? '5px solid #334155' 
                  : '5px solid #f8fafc'
              }),
              ...(actualPosition === 'bottom' && {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: darkMode 
                  ? '5px solid #334155' 
                  : '5px solid #f8fafc'
              }),
              ...(actualPosition === 'left' && {
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: darkMode 
                  ? '5px solid #334155' 
                  : '5px solid #f8fafc'
              }),
              ...(actualPosition === 'right' && {
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: darkMode 
                  ? '5px solid #334155' 
                  : '5px solid #f8fafc'
              })
            }}
          />
        </div>
      )}
      
      <style>{`
        @keyframes tooltipSlideIn {
          0% {
            opacity: 0;
            transform: ${
              actualPosition === 'top' ? 'translateY(4px) translateX(-50%) scale(0.95)' :
              actualPosition === 'bottom' ? 'translateY(-4px) translateX(-50%) scale(0.95)' :
              actualPosition === 'left' ? 'translateX(4px) translateY(-50%) scale(0.95)' :
              'translateX(-4px) translateY(-50%) scale(0.95)'
            };
          }
          100% {
            opacity: 1;
            transform: ${
              actualPosition === 'top' ? 'translateY(0) translateX(-50%) scale(1)' :
              actualPosition === 'bottom' ? 'translateY(0) translateX(-50%) scale(1)' :
              actualPosition === 'left' ? 'translateX(0) translateY(-50%) scale(1)' :
              'translateX(0) translateY(-50%) scale(1)'
            };
          }
        }
      `}</style>
    </div>
  );
};

export default HoverTooltip;