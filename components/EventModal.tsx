import React, { useState } from 'react';
import PageOverlay from './PageOverlay';

interface EventModalProps {
  tarih: Date;
  onClose: () => void;
  onSave: (aciklama: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ tarih, onClose, onSave }) => {
  const [aciklama, setAciklama] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aciklama.trim()) {
      onSave(aciklama);
    }
  };

  return (
    <PageOverlay
      title={`Etkinlik Ekle - ${tarih.toLocaleDateString('tr-TR')}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700">
            İptal
          </button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            Kaydet
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          placeholder="Etkinlik açıklaması..."
          className="w-full p-3 border rounded-md"
          rows={5}
          required
        />
      </form>
    </PageOverlay>
  );
};

export default EventModal;