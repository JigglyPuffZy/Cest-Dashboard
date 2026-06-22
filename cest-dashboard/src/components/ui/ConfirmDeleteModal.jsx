import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item?",
  message = "This action cannot be undone.",
  itemName = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  darkMode = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl transform transition-all duration-300 scale-100"
        style={{
          background: darkMode ? '#1e293b' : '#ffffff',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 
              className="text-lg font-bold"
              style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p 
            className="text-sm mb-3"
            style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
          >
            {message}
          </p>
          
          {itemName && (
            <div 
              className="p-3 rounded-xl border"
              style={{
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderColor: darkMode ? '#334155' : '#e2e8f0'
              }}
            >
              <p 
                className="text-sm font-medium truncate"
                style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
              >
                "{itemName}"
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: darkMode ? '#334155' : '#f1f5f9',
              color: darkMode ? '#94a3b8' : '#64748b'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;