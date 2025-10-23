import React, { useState, useRef } from 'react';
import { KasaHesap, KasaIslem, Ayarlar } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';
import { PaperClipIcon } from './icons/AppIcons';

interface IslemEkleModalProps {
  onClose: () => void;
  onSave: (islem: Omit<KasaIslem, 'id'> | KasaIslem) => void;
  hesap: KasaHesap;
  ayarlar: Ayarlar;
  mevcutIslem: KasaIslem | null;
}

const IslemEkleModal: React.FC<IslemEkleModalProps> = ({ onClose, onSave, hesap, ayarlar, mevcutIslem }) => {
  const [islem, setIslem] = useState<Omit<KasaIslem, 'id'>>(() => {
      if (mevcutIslem) {
        const { id, ...rest } = mevcutIslem;
        return rest;
      }
      return {
        hesapId: hesap.id,
        tip: 'gider',
        tutar: 0,
        aciklama: '',
        tarih: new Date().toISOString().split('T')[0],
        kategori: ayarlar.kasaKategorileri[0] || '',
        ekDosya: undefined,
      };
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIslem(prev => ({ ...prev, [name]: name === 'tutar' ? parseFloat(value) : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setIslem(prev => ({
          ...prev,
          ekDosya: {
            veri: event.target?.result as string,
            tip: file.type,
            ad: file.name
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mevcutIslem) {
        onSave({ ...islem, id: mevcutIslem.id });
    } else {
        onSave(islem);
    }
  };

  return (
    <PageOverlay
      title={mevcutIslem ? `İşlemi Düzenle - ${hesap.ad}`: `Yeni İşlem Ekle - ${hesap.ad}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="islem-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="islem-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center text-gray-900"><input type="radio" name="tip" value="gelir" checked={islem.tip === 'gelir'} onChange={handleInputChange} className="mr-2"/> Gelir</label>
          <label className="flex items-center text-gray-900"><input type="radio" name="tip" value="gider" checked={islem.tip === 'gider'} onChange={handleInputChange} className="mr-2"/> Gider</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700">Tutar ({hesap.paraBirimi})</label>
            <input type="number" name="tutar" value={islem.tutar} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required step="0.01"/>
          </div>
          <div>
            <label className="text-gray-700">Tarih</label>
            <DatePickerInput value={islem.tarih} onChange={date => setIslem(i => ({...i, tarih: date}))} />
          </div>
        </div>
        <div>
          <label className="text-gray-700">Açıklama</label>
          <input type="text" name="aciklama" value={islem.aciklama} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required/>
        </div>
        <div>
          <label className="text-gray-700">Kategori</label>
          <select name="kategori" value={islem.kategori} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1">
            {ayarlar.kasaKategorileri.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
            <label className="text-gray-700">Belge Ekle (Opsiyonel)</label>
            <div className="mt-1 flex items-center gap-4">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-sm font-semibold rounded-md">
                    <PaperClipIcon/> {islem.ekDosya ? 'Belge Değiştir' : 'Belge Seç'}
                </button>
                {islem.ekDosya && <span className="text-sm text-slate-600">{islem.ekDosya.ad}</span>}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
        </div>
      </form>
    </PageOverlay>
  );
};

export default IslemEkleModal;