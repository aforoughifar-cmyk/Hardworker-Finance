import React, { useState, useEffect } from 'react';
import { GiderTuru } from '../types';
import PageOverlay from './PageOverlay';

interface GiderTuruEkleModalProps {
  onClose: () => void;
  onSave: (giderTuru: Omit<GiderTuru, 'id'> | GiderTuru) => void;
  mevcutGiderTuru: GiderTuru | null;
}

const GiderTuruEkleModal: React.FC<GiderTuruEkleModalProps> = ({ onClose, onSave, mevcutGiderTuru }) => {
  const [giderTuru, setGiderTuru] = useState({
    ad: '',
    aciklama: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (mevcutGiderTuru) {
      setGiderTuru({ ad: mevcutGiderTuru.ad, aciklama: mevcutGiderTuru.aciklama });
    }
  }, [mevcutGiderTuru]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (error && name === 'ad') setError('');
    setGiderTuru(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!giderTuru.ad.trim()){
        setError('Gider türü adı boş olamaz.');
        return;
    }
    onSave(mevcutGiderTuru ? { ...giderTuru, id: mevcutGiderTuru.id } : giderTuru);
  };
  
  const inputClasses = "mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutGiderTuru ? 'Gider Türünü Düzenle' : 'Yeni Gider Türü Ekle'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="gider-turu-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="gider-turu-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ad" className={labelClasses}>Gider Türü Adı</label>
          <input
            type="text"
            id="ad"
            name="ad"
            value={giderTuru.ad}
            onChange={handleChange}
            className={`${inputClasses} ${error ? 'border-red-500' : ''}`}
            required
          />
           {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <div>
          <label htmlFor="aciklama" className={labelClasses}>Açıklama</label>
          <textarea
            id="aciklama"
            name="aciklama"
            value={giderTuru.aciklama}
            onChange={handleChange}
            rows={3}
            className={inputClasses}
          />
        </div>
      </form>
    </PageOverlay>
  );
};

export default GiderTuruEkleModal;