import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      
      Object.entries(shortcuts).forEach(([key, handler]) => {
        const keys = key.split('+').map(k => k.trim().toLowerCase());
        
        let matches = true;
        
        
        if (keys.includes('ctrl') || keys.includes('control')) {
          if (!event.ctrlKey && !event.metaKey) matches = false;
        }
        if (keys.includes('shift')) {
          if (!event.shiftKey) matches = false;
        }
        if (keys.includes('alt')) {
          if (!event.altKey) matches = false;
        }
        
        
        const mainKey = keys[keys.length - 1];
        if (event.key.toLowerCase() !== mainKey && event.code.toLowerCase() !== mainKey) {
          matches = false;
        }
        
        
        if (matches) {
          event.preventDefault();
          handler(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};


export const commonShortcuts = {
  ESCAPE: 'escape',
  SAVE: 'ctrl+s',
  SEARCH: 'ctrl+k',
  NEW: 'ctrl+n',
  DELETE: 'delete',
  ENTER: 'enter',
  CLOSE: 'ctrl+w'
};
