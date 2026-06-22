import { AlertTriangle } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

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
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={
        itemName ? (
          <>
            <p className="mb-3">{message}</p>
            <div
              className="p-3 rounded-xl border"
              style={{
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderColor: darkMode ? '#334155' : '#e2e8f0',
              }}
            >
              <p
                className="text-sm font-medium truncate"
                style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
              >
                &ldquo;{itemName}&rdquo;
              </p>
            </div>
          </>
        ) : (
          message
        )
      }
      confirmText={confirmText}
      cancelText={cancelText}
      variant="danger"
      darkMode={darkMode}
      icon={AlertTriangle}
    />
  );
};

export default ConfirmDeleteModal;
