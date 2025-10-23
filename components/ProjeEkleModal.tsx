import React, { useState } from 'react';
// FIX: Corrected import path for types
import { Proje } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';

interface ProjeEkleModalProps {
  onClose: () => void;
  onSave: (proje: Omit<Proje, 'id'> | Proje) => void;
  mevcutProje: Proje | null;
}

const ProjeEkleModal: React.FC<ProjeEkleModalProps> = ({ onClose, onSave, mevcutProje }) => {
  const [proje, setProje] = useState<Omit<Proje, 'id'>>({
    ad: mevcutProje?.ad || '',
    aciklama: mevcutProje?.aciklama || '',
    baslangicTarihi: mevcutProje?.baslangicTarihi || new Date().toISOString().split('T')[0],
    bitisTarihi: mevcutProje?.bitisTarihi || new Date().toISOString().split('T')[0],
    ilerlemeYuzdesi: mevcutProje?.ilerlemeYuzdesi || 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setProje(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!proje.ad.trim()) newErrors.ad = "Proje adı zorunludur.";
    if (!proje.aciklama.trim()) newErrors.aciklama = "Açıklama zorunludur.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(mevcutProje ? { ...proje, id: mevcutProje.id } : proje);
  };
  
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutProje ? 'Proje Düzenle' : 'Yeni Proje Ekle'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="proje-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="proje-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClasses}>Proje Adı</label>
          <input type="text" name="ad" value={proje.ad} onChange={handleChange} className={`${inputClasses} ${errors.ad ? 'border-red-500' : ''}`} />
          {errors.ad && <p className="text-xs text-red-600 mt-1">{errors.ad}</p>}
        </div>
        <div>
          <label className={labelClasses}>Açıklama</label>
          <textarea name="aciklama" value={proje.aciklama} onChange={handleChange} className={`${inputClasses} ${errors.aciklama ? 'border-red-500' : ''}`} rows={4} />
          {errors.aciklama && <p className="text-xs text-red-600 mt-1">{errors.aciklama}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Başlangıç Tarihi</label>
            <DatePickerInput value={proje.baslangicTarihi} onChange={date => setProje(p => ({...p, baslangicTarihi: date}))} />
          </div>
          <div>
            <label className={labelClasses}>Bitiş Tarihi</label>
            <DatePickerInput value={proje.bitisTarihi} onChange={date => setProje(p => ({...p, bitisTarihi: date}))} />
          </div>
        </div>
        <div>
          <label className={labelClasses}>İlerleme Yüzdesi ({proje.ilerlemeYuzdesi}%)</label>
          <input type="range" name="ilerlemeYuzdesi" value={proje.ilerlemeYuzdesi} onChange={handleChange} min="0" max="100" className="w-full mt-1" />
        </div>
      </form>
    </PageOverlay>
  );
};

export default ProjeEkleModal;