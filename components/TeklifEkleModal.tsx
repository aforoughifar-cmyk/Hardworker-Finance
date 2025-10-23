import React, { useState, useRef } from 'react';
// FIX: Import `Firma` type to use in type predicate.
import { Teklif, Varlik, Proje, Ayarlar, Firma } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';
import { PaperClipIcon } from './icons/AppIcons';
import SearchableSelect from './SearchableSelect';

interface TeklifEkleModalProps {
  onClose: () => void;
  onSave: (teklif: Omit<Teklif, 'id'> | Teklif) => void;
  mevcutTeklif: Teklif | null;
  varliklar: Varlik[];
  projeler: Proje[];
  ayarlar: Ayarlar;
}

const TeklifEkleModal: React.FC<TeklifEkleModalProps> = ({ onClose, onSave, mevcutTeklif, varliklar, projeler, ayarlar }) => {
  const [teklif, setTeklif] = useState<Omit<Teklif, 'id'>>({
    varlikId: mevcutTeklif?.varlikId || 0,
    projeId: mevcutTeklif?.projeId || null,
    konu: mevcutTeklif?.konu || '',
    tutar: mevcutTeklif?.tutar || 0,
    paraBirimi: mevcutTeklif?.paraBirimi || ayarlar.paraBirimleri[0].kod,
    tarih: mevcutTeklif?.tarih || new Date().toISOString().split('T')[0],
    durum: mevcutTeklif?.durum || ayarlar.teklifDurumlari[0],
    aciklama: mevcutTeklif?.aciklama || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIX: Use a type predicate to ensure TypeScript knows `firmalar` is an array of `Firma`.
  const firmalar = varliklar.filter((v): v is Firma => v.type === 'firma');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'projeId') {
        setTeklif(prev => ({...prev, projeId: value ? Number(value) : null }));
    } else if (['varlikId', 'tutar'].includes(name)) {
        setTeklif(prev => ({ ...prev, [name]: Number(value) }));
    } else {
        setTeklif(prev => ({...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setTeklif(prev => ({ ...prev, ekDosya: { veri: event.target?.result as string, tip: file.type, ad: file.name } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!teklif.konu.trim()) newErrors.konu = "Konu zorunludur.";
    if (!teklif.varlikId) newErrors.varlikId = "Firma seçimi zorunludur.";
    if (teklif.tutar <= 0) newErrors.tutar = "Tutar 0'dan büyük olmalıdır.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!validate()) return;
    onSave(mevcutTeklif ? { ...teklif, id: mevcutTeklif.id } : teklif);
  };
  
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutTeklif ? 'Teklif Düzenle' : 'Yeni Teklif Ekle'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="teklif-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="teklif-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Konu</label>
            <input type="text" name="konu" value={teklif.konu} onChange={handleInputChange} className={`${inputClasses} ${errors.konu ? 'border-red-500 ring-1 ring-red-500' : ''}`} required />
            {errors.konu && <p className="text-xs text-red-600 mt-1">{errors.konu}</p>}
          </div>
          <div>
            <label className={labelClasses}>Firma</label>
            <div className={errors.varlikId ? 'border border-red-500 rounded-md ring-1 ring-red-500' : ''}>
              <SearchableSelect
                  options={firmalar.map(f => ({ value: f.id, label: f.sirketAdi }))}
                  selectedValues={teklif.varlikId ? [teklif.varlikId] : []}
                  onChange={(selected) => handleInputChange({ target: { name: 'varlikId', value: String(selected[0] || 0) } } as any)}
                  placeholder="Firma Seçin..."
              />
            </div>
             {errors.varlikId && <p className="text-xs text-red-600 mt-1">{errors.varlikId}</p>}
          </div>
          <div><label className={labelClasses}>Proje (Opsiyonel)</label><select name="projeId" value={teklif.projeId || ''} onChange={handleInputChange} className={inputClasses}><option value="">Proje Yok</option>{projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}</select></div>
          <div><label className={labelClasses}>Tarih</label><DatePickerInput value={teklif.tarih} onChange={date => setTeklif(t => ({...t, tarih: date}))} /></div>
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <label className={labelClasses}>Tutar</label>
              <input type="number" name="tutar" value={teklif.tutar} onChange={handleInputChange} className={`${inputClasses} ${errors.tutar ? 'border-red-500 ring-1 ring-red-500' : ''}`} required />
               {errors.tutar && <p className="text-xs text-red-600 mt-1">{errors.tutar}</p>}
            </div>
            <div>
              <label className={labelClasses}>Para Birimi</label>
              <select name="paraBirimi" value={teklif.paraBirimi} onChange={handleInputChange} className={`${inputClasses} mt-0`}>{ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}</select>
            </div>
          </div>
          <div><label className={labelClasses}>Durum</label><select name="durum" value={teklif.durum} onChange={handleInputChange} className={inputClasses}>{ayarlar.teklifDurumlari.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        </div>
        <div><label className={labelClasses}>Açıklama</label><textarea name="aciklama" value={teklif.aciklama} onChange={handleInputChange} rows={3} className={inputClasses}></textarea></div>
        <div><label className={labelClasses}>Belge Ekle (Opsiyonel)</label><div className="mt-1 flex items-center gap-4"><button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-sm font-semibold rounded-md"><PaperClipIcon/> {teklif.ekDosya ? 'Belge Değiştir' : 'Belge Seç'}</button>{teklif.ekDosya && <span className="text-sm text-slate-600">{teklif.ekDosya.ad}</span>}<input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /></div></div>
      </form>
    </PageOverlay>
  );
};

export default TeklifEkleModal;