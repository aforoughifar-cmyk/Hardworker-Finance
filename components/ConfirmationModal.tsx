import React from 'react';
import PageOverlay from './PageOverlay';

interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirm, title, message, confirmText, confirmButtonClass }) => {
  return (
    <PageOverlay
      title={title}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
            İptal
          </button>
          <button onClick={onConfirm} className={confirmButtonClass || "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"}>
            {confirmText || 'Sil'}
          </button>
        </>
      }
    >
      <p className="text-slate-700">{message}</p>
    </PageOverlay>
  );
};

export default ConfirmationModal;