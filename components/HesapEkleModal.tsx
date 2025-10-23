import React, { useState } from 'react';
import { KasaHesap, Ayarlar } from '../types';
import PageOverlay from './PageOverlay';

interface HesapEkleModalProps {
  onClose: () => void;
  onSave: (hesap: Omit<KasaHesap, 'id' | 'bakiye'> | KasaHesap) => void;
  ayarlar: Ayarlar;
  mevcutHesap: KasaHesap | null;
}

const HesapEkleModal: React.FC<HesapEkleModalProps> = ({ onClose, onSave, ayarlar, mevcutHesap }) => {
  const [ad, setAd] = useState(mevcutHesap?.ad || '');
  const [paraBirimi, setParaBirimi] = useState(mevcutHesap?.paraBirimi || ayarlar.paraBirimleri[0]?.kod || 'TRY');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ad.trim()) {
      const dataToSave = { ad, paraBirimi };
      if (mevcutHesap) {
        onSave({ ...dataToSave, id: mevcutHesap.id, bakiye: mevcutHesap.bakiye });
      } else {
        onSave(dataToSave);
      }
    }
  };
  
  const inputClasses = "mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutHesap ? "Hesabı Düzenle" : "Yeni Kasa Hesabı Ekle"}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="hesap-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="hesap-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ad" className={labelClasses}>Hesap Adı</label>
          <input
            type="text"
            id="ad"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="paraBirimi" className={labelClasses}>Para Birimi</label>
          <select
            id="paraBirimi"
            value={paraBirimi}
            onChange={(e) => setParaBirimi(e.target.value)}
            className={inputClasses}
          >
            {ayarlar.paraBirimleri.map(p => (
              <option key={p.kod} value={p.kod}>{p.kod}</option>
            ))}
          </select>
        </div>
      </form>
    </PageOverlay>
  );
};

export default HesapEkleModal;