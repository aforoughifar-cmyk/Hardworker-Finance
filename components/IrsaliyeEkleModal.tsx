import React, { useState, useRef } from 'react';
import { produce } from 'immer';
// FIX: Import `Firma` type to use in type predicate.
import { Irsaliye, IrsaliyeKalemi, Varlik, Proje, Ayarlar, Firma } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import { PaperClipIcon } from './icons/AppIcons';
import SearchableSelect from './SearchableSelect';

interface IrsaliyeEkleModalProps {
  onClose: () => void;
  onSave: (irsaliye: Omit<Irsaliye, 'id'> | Irsaliye) => void;
  mevcutIrsaliye: Irsaliye | null;
  varliklar: Varlik[];
  projeler: Proje[];
  ayarlar: Ayarlar;
}

const IrsaliyeEkleModal: React.FC<IrsaliyeEkleModalProps> = ({ onClose, onSave, mevcutIrsaliye, varliklar, projeler, ayarlar }) => {
  const [irsaliye, setIrsaliye] = useState<Omit<Irsaliye, 'id'>>(() => {
    if (mevcutIrsaliye) return mevcutIrsaliye;
    return {
      varlikId: 0,
      projeId: null,
      tarih: new Date().toISOString().split('T')[0],
      durum: ayarlar.irsaliyeDurumlari[0],
      kalemler: [{ id: Date.now(), urunAdi: '', miktar: 1, birim: 'adet' }],
      aciklama: '',
    };
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIX: Use a type predicate to ensure TypeScript knows `firmalar` is an array of `Firma`.
  const firmalar = varliklar.filter((v): v is Firma => v.type === 'firma');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    const isNumeric = ['varlikId', 'projeId'].includes(name);

    setIrsaliye(prev => ({ 
      ...prev, 
      [name]: isNumeric ? (value ? Number(value) : null) : value 
    }));
  };

  const handleKalemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIrsaliye(produce(draft => {
      const kalem = draft.kalemler[index];
      (kalem as any)[name] = name === 'miktar' ? parseFloat(value) : value;
    }));
  };

  const handleYeniKalem = () => {
    setIrsaliye(produce(draft => {
      draft.kalemler.push({ id: Date.now(), urunAdi: '', miktar: 1, birim: 'adet' });
    }));
  };
  
  const handleKalemSil = (index: number) => {
    setIrsaliye(produce(draft => {
      draft.kalemler.splice(index, 1);
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setIrsaliye(prev => ({
          ...prev,
          ekDosya: { veri: event.target?.result as string, tip: file.type, ad: file.name }
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!irsaliye.varlikId || irsaliye.varlikId === 0) newErrors.varlikId = "Firma seçimi zorunludur.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!validate()) return;
    onSave(mevcutIrsaliye ? { ...irsaliye, id: mevcutIrsaliye.id } : irsaliye);
  };
  
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutIrsaliye ? 'İrsaliye Düzenle' : 'Yeni İrsaliye Oluştur'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="irsaliye-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="irsaliye-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label className={labelClasses}>Firma</label>
                <div className={errors.varlikId ? 'border border-red-500 rounded-md ring-1 ring-red-500' : ''}>
                    <SearchableSelect
                        options={firmalar.map(f => ({ value: f.id, label: f.sirketAdi }))}
                        selectedValues={irsaliye.varlikId ? [irsaliye.varlikId] : []}
                        onChange={(selected) => handleInputChange({ target: { name: 'varlikId', value: String(selected[0] || 0) } } as any)}
                        placeholder="Firma Seçin..."
                    />
                </div>
                {errors.varlikId && <p className="text-xs text-red-600 mt-1">{errors.varlikId}</p>}
            </div>
             <div>
                <label className={labelClasses}>Proje (Opsiyonel)</label>
                <select name="projeId" value={irsaliye.projeId || ''} onChange={handleInputChange} className={inputClasses}>
                    <option value="">Proje Yok</option>
                    {projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClasses}>Tarih</label>
                <DatePickerInput value={irsaliye.tarih} onChange={date => setIrsaliye(i => ({...i, tarih: date}))} />
            </div>
        </div>
        
        <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2 text-slate-800">İrsaliye Kalemleri</h3>
            {irsaliye.kalemler.map((kalem, index) => (
                <div key={kalem.id} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" name="urunAdi" placeholder="Ürün / Hizmet Adı" value={kalem.urunAdi} onChange={e => handleKalemChange(index, e)} className={`${inputClasses} col-span-8`} />
                    <input type="number" name="miktar" placeholder="Miktar" value={kalem.miktar} onChange={e => handleKalemChange(index, e)} className={`${inputClasses} col-span-2`} />
                    <input type="text" name="birim" placeholder="Birim" value={kalem.birim} onChange={e => handleKalemChange(index, e)} className={`${inputClasses} col-span-1`} />
                    <button type="button" onClick={() => handleKalemSil(index)} className="col-span-1 text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>
                </div>
            ))}
            <button type="button" onClick={handleYeniKalem} className="flex items-center gap-1 text-sm text-indigo-600 font-semibold mt-2"><PlusIcon/>Yeni Kalem Ekle</button>
        </div>
        
        <div>
            <label className={labelClasses}>Açıklama / Not</label>
            <textarea name="aciklama" value={irsaliye.aciklama || ''} onChange={handleInputChange} rows={3} className={inputClasses}></textarea>
        </div>
         <div>
            <label className={labelClasses}>Belge Ekle (Opsiyonel)</label>
            <div className="mt-1 flex items-center gap-4">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-sm font-semibold rounded-md">
                    <PaperClipIcon/> {irsaliye.ekDosya ? 'Belge Değiştir' : 'Belge Seç'}
                </button>
                {irsaliye.ekDosya && <span className="text-sm text-slate-600">{irsaliye.ekDosya.ad}</span>}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
        </div>
      </form>
    </PageOverlay>
  );
};

export default IrsaliyeEkleModal;