import React, { useState } from 'react';
import { Emlak, Proje } from '../types';
import PageOverlay from './PageOverlay';

interface EmlakEkleModalProps {
  onClose: () => void;
  onSave: (emlak: Omit<Emlak, 'id'> | Emlak) => void;
  mevcutEmlak: Emlak | null;
  projeler: Proje[];
}

const EmlakEkleModal: React.FC<EmlakEkleModalProps> = ({ onClose, onSave, mevcutEmlak, projeler }) => {
  const [emlak, setEmlak] = useState<Omit<Emlak, 'id' | 'resimler' | 'videolar'>>({
    projeId: mevcutEmlak?.projeId || 0,
    blok: mevcutEmlak?.blok || '',
    kat: mevcutEmlak?.kat || '',
    daireNo: mevcutEmlak?.daireNo || '',
    metraj: mevcutEmlak?.metraj || 0,
    aciklama: mevcutEmlak?.aciklama || '',
    durum: mevcutEmlak?.durum || 'satilik',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete (newErrors as any)[name];
            return newErrors;
        });
    }

    const updatedEmlak = {
        ...emlak,
        [name]: (type === 'number' || name === 'projeId') ? Number(value) : value
    };
    setEmlak(updatedEmlak);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!emlak.projeId || emlak.projeId === 0) newErrors.projeId = "Proje seçimi zorunludur.";
    if (!emlak.blok.trim()) newErrors.blok = "Blok bilgisi zorunludur.";
    if (!emlak.kat.trim()) newErrors.kat = "Kat bilgisi zorunludur.";
    if (!emlak.daireNo.trim()) newErrors.daireNo = "Daire No zorunludur.";
    if (!emlak.metraj || emlak.metraj <= 0) newErrors.metraj = "Metraj 0'dan büyük olmalıdır.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (mevcutEmlak) {
        onSave({ ...mevcutEmlak, ...emlak });
      } else {
        onSave({ ...emlak, resimler: [], videolar: [] });
      }
    }
  };

  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutEmlak ? 'Emlak Düzenle' : 'Yeni Emlak Ekle'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="emlak-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="emlak-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClasses}>Proje</label>
          <select name="projeId" value={emlak.projeId} onChange={handleInputChange} className={`w-full p-2 border rounded-md mt-1 ${errors.projeId ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} required>
            <option value={0} disabled>Proje Seçiniz...</option>
            {projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
          </select>
          {errors.projeId && <p className="text-xs text-red-600 mt-1">{errors.projeId}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClasses}>Blok</label>
            <input type="text" name="blok" value={emlak.blok} onChange={handleInputChange} className={`w-full p-2 border rounded-md mt-1 ${errors.blok ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} required/>
            {errors.blok && <p className="text-xs text-red-600 mt-1">{errors.blok}</p>}
          </div>
          <div>
            <label className={labelClasses}>Kat</label>
            <input type="text" name="kat" value={emlak.kat} onChange={handleInputChange} className={`w-full p-2 border rounded-md mt-1 ${errors.kat ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} required/>
            {errors.kat && <p className="text-xs text-red-600 mt-1">{errors.kat}</p>}
          </div>
          <div>
            <label className={labelClasses}>Daire No</label>
            <input type="text" name="daireNo" value={emlak.daireNo} onChange={handleInputChange} className={`w-full p-2 border rounded-md mt-1 ${errors.daireNo ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} required/>
            {errors.daireNo && <p className="text-xs text-red-600 mt-1">{errors.daireNo}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label className={labelClasses}>Metraj (m²)</label>
                <input type="number" name="metraj" value={emlak.metraj} onChange={handleInputChange} className={`w-full p-2 border rounded-md mt-1 ${errors.metraj ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} required/>
                {errors.metraj && <p className="text-xs text-red-600 mt-1">{errors.metraj}</p>}
             </div>
             <div>
                <label className={labelClasses}>Durum</label>
                <select name="durum" value={emlak.durum} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1 border-slate-300" required>
                    <option value="satilik">Satılık</option>
                    <option value="kiralik">Kiralık</option>
                </select>
            </div>
        </div>
        <div>
          <label className={labelClasses}>Açıklama</label>
          <textarea name="aciklama" value={emlak.aciklama} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1 border-slate-300" rows={4}/>
        </div>
      </form>
    </PageOverlay>
  );
};

export default EmlakEkleModal;