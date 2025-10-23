import React, { useState, useRef, useEffect } from 'react';
import { EmlakDanismani, DanismanKisi, DanismanSirket } from '../types';
import PageOverlay from './PageOverlay';

interface EmlakDanismaniEkleModalProps {
  onClose: () => void;
  onSave: (danisman: Omit<EmlakDanismani, 'id'> | EmlakDanismani) => void;
  mevcutDanisman: EmlakDanismani | null;
}

// Moved helper component outside to prevent re-creation on re-renders, which causes focus loss.
const inputClasses = "mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelClasses = "block text-sm font-medium text-slate-700";

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, onChange, ...props }) => (
  <div>
    <label htmlFor={props.name} className={labelClasses}>{label}</label>
    <input id={props.name} {...props} onChange={onChange} className={inputClasses} />
  </div>
);


const EmlakDanismaniEkleModal: React.FC<EmlakDanismaniEkleModalProps> = ({ onClose, onSave, mevcutDanisman }) => {
  const [danismanTipi, setDanismanTipi] = useState<'kisi' | 'sirket'>(mevcutDanisman?.type || 'kisi');
  const [formData, setFormData] = useState<Partial<EmlakDanismani>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mevcutDanisman) {
      setDanismanTipi(mevcutDanisman.type);
      setFormData(mevcutDanisman);
    }
  }, [mevcutDanisman]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const field = danismanTipi === 'kisi' ? 'resim' : 'logo';
        setFormData(prev => ({ ...prev, [field]: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const commonData = {
        telefon: formData.telefon || '',
        adres: formData.adres || '',
        iban: formData.iban || '',
    };

    if (danismanTipi === 'kisi') {
        const kisiData = {
            ...commonData,
            type: 'kisi' as const,
            isim: (formData as Partial<DanismanKisi>).isim || '',
            soyisim: (formData as Partial<DanismanKisi>).soyisim || '',
            email: (formData as Partial<DanismanKisi>).email || '',
            kimlikNo: (formData as Partial<DanismanKisi>).kimlikNo,
            resim: (formData as Partial<DanismanKisi>).resim,
        };
        onSave(mevcutDanisman ? { ...kisiData, id: mevcutDanisman.id } : kisiData);
    } else { // 'sirket'
        const sirketData = {
            ...commonData,
            type: 'sirket' as const,
            sirketAdi: (formData as Partial<DanismanSirket>).sirketAdi || '',
            vergiNo: (formData as Partial<DanismanSirket>).vergiNo,
            logo: (formData as Partial<DanismanSirket>).logo,
        };
        onSave(mevcutDanisman ? { ...sirketData, id: mevcutDanisman.id } : sirketData);
    }
  };

  return (
    <PageOverlay
      title={mevcutDanisman ? 'Danışman Düzenle' : 'Yeni Danışman Ekle'}
      onClose={onClose}
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
        <button type="submit" form="danisman-form" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Kaydet</button>
      </>}
    >
      <form id="danisman-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center text-slate-800">
            <input type="radio" value="kisi" checked={danismanTipi === 'kisi'} onChange={() => setDanismanTipi('kisi')} className="mr-2" disabled={!!mevcutDanisman} /> Kişi
          </label>
          <label className="flex items-center text-slate-800">
            <input type="radio" value="sirket" checked={danismanTipi === 'sirket'} onChange={() => setDanismanTipi('sirket')} className="mr-2" disabled={!!mevcutDanisman} /> Şirket
          </label>
        </div>

        {danismanTipi === 'kisi' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="İsim" name="isim" value={(formData as DanismanKisi).isim || ''} onChange={handleChange} required />
            <InputField label="Soyisim" name="soyisim" value={(formData as DanismanKisi).soyisim || ''} onChange={handleChange} required />
            <InputField label="Telefon" name="telefon" value={formData.telefon || ''} onChange={handleChange} required />
            <InputField label="E-posta" name="email" type="email" value={(formData as DanismanKisi).email || ''} onChange={handleChange} />
            <InputField label="IBAN" name="iban" value={formData.iban || ''} onChange={handleChange} />
            <InputField label="Kimlik No" name="kimlikNo" value={(formData as DanismanKisi).kimlikNo || ''} onChange={handleChange} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Şirket Adı" name="sirketAdi" value={(formData as DanismanSirket).sirketAdi || ''} onChange={handleChange} required />
            <InputField label="Telefon" name="telefon" value={formData.telefon || ''} onChange={handleChange} required />
            <InputField label="Vergi No" name="vergiNo" value={(formData as DanismanSirket).vergiNo || ''} onChange={handleChange} />
            <InputField label="IBAN" name="iban" value={formData.iban || ''} onChange={handleChange} />
          </div>
        )}
        
        <div>
          <label className={labelClasses}>Adres</label>
          <textarea name="adres" value={formData.adres || ''} onChange={handleChange} rows={3} className={inputClasses} />
        </div>
        
        <div>
          <label className={labelClasses}>{danismanTipi === 'kisi' ? 'Fotoğraf' : 'Logo'}</label>
          <div className="mt-1 flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
              <img src={(danismanTipi === 'kisi' ? (formData as DanismanKisi).resim : (formData as DanismanSirket).logo) || ''} alt="preview" className="w-full h-full object-cover" />
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-slate-200 text-sm font-semibold rounded-md">
                {danismanTipi === 'kisi' ? 'Fotoğraf Yükle' : 'Logo Yükle'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        </div>
      </form>
    </PageOverlay>
  );
};

export default EmlakDanismaniEkleModal;