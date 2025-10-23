import React, { useState } from 'react';
import { Varlik, Musteri, Firma } from '../types';
import PageOverlay from './PageOverlay';

// Helper component moved outside the main component to prevent re-creation on re-renders
const labelClasses = "block text-sm font-medium text-slate-700";
const inputClasses = "mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const InputField: React.FC<{
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  error?: string;
}> = ({ name, label, value, onChange, required, type = 'text', error }) => (
  <div>
    <label htmlFor={name} className={labelClasses}>{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={onChange} className={`${inputClasses} ${error ? 'border-red-500' : ''}`} />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);


interface VarlikEkleModalProps {
  onClose: () => void;
  onSave: (varlik: Omit<Musteri, 'id'> | Omit<Firma, 'id'> | Varlik) => void;
  mevcutVarlik: Varlik | null;
}

const VarlikEkleModal: React.FC<VarlikEkleModalProps> = ({ onClose, onSave, mevcutVarlik }) => {
  const [varlikTipi, setVarlikTipi] = useState<'musteri' | 'firma'>(mevcutVarlik?.type || 'musteri');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const initialMusteriState: Omit<Musteri, 'id' | 'type'> = {
    isim: '', soyisim: '', kimlikNo: '', email: '', telefon: '', adres: ''
  };
  const initialFirmaState: Omit<Firma, 'id' | 'type'> = {
    sirketAdi: '', vergiNo: '', sirketEmail: '', sirketTelefon: '', webSitesi: '', adres: ''
  };

  const [formData, setFormData] = useState(() => {
    if (mevcutVarlik) {
      if (mevcutVarlik.type === 'musteri') {
        return { ...initialFirmaState, ...mevcutVarlik };
      }
      return { ...initialMusteriState, ...mevcutVarlik };
    }
    return { ...initialMusteriState, ...initialFirmaState };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(errors[e.target.name]) {
        setErrors(prev => ({...prev, [e.target.name]: ''}));
    }
  };
  
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (varlikTipi === 'musteri') {
        const musteriData = formData as Musteri;
        if (!musteriData.isim.trim()) newErrors.isim = "İsim zorunludur.";
        if (!musteriData.soyisim.trim()) newErrors.soyisim = "Soyisim zorunludur.";
        if (!musteriData.telefon.trim()) newErrors.telefon = "Telefon zorunludur.";
    } else { // firma
        const firmaData = formData as Firma;
        if (!firmaData.sirketAdi.trim()) newErrors.sirketAdi = "Şirket adı zorunludur.";
        if (!firmaData.sirketTelefon.trim()) newErrors.sirketTelefon = "Şirket telefonu zorunludur.";
    }
    if (!formData.adres.trim()) newErrors.adres = "Adres zorunludur.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (varlikTipi === 'musteri') {
      const { isim, soyisim, kimlikNo, email, telefon, adres } = formData as Musteri;
      const musteriData = { isim, soyisim, kimlikNo, email, telefon, adres, type: 'musteri' as const };
      onSave(mevcutVarlik ? { ...musteriData, id: mevcutVarlik.id } : musteriData);
    } else {
      const { sirketAdi, vergiNo, sirketEmail, sirketTelefon, webSitesi, adres } = formData as Firma;
      const firmaData = { sirketAdi, vergiNo, sirketEmail, sirketTelefon, webSitesi, adres, type: 'firma' as const };
      onSave(mevcutVarlik ? { ...firmaData, id: mevcutVarlik.id } : firmaData);
    }
  };

  return (
    <PageOverlay
      title={mevcutVarlik ? 'Varlık Düzenle' : 'Yeni Varlık Ekle'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="varlik-form" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Kaydet</button>
        </>
      }
    >
      <form id="varlik-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center text-slate-800">
            <input type="radio" value="musteri" checked={varlikTipi === 'musteri'} onChange={() => setVarlikTipi('musteri')} className="mr-2" disabled={!!mevcutVarlik} /> Müşteri
          </label>
          <label className="flex items-center text-slate-800">
            <input type="radio" value="firma" checked={varlikTipi === 'firma'} onChange={() => setVarlikTipi('firma')} className="mr-2" disabled={!!mevcutVarlik}/> Firma
          </label>
        </div>

        {varlikTipi === 'musteri' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="isim" label="İsim" value={(formData as Musteri).isim} onChange={handleChange} error={errors.isim} />
            <InputField name="soyisim" label="Soyisim" value={(formData as Musteri).soyisim} onChange={handleChange} error={errors.soyisim} />
            <InputField name="kimlikNo" label="Kimlik No" value={(formData as Musteri).kimlikNo || ''} onChange={handleChange} />
            <InputField name="email" label="E-posta" value={(formData as Musteri).email || ''} onChange={handleChange} type="email" />
            <InputField name="telefon" label="Telefon" value={(formData as Musteri).telefon} onChange={handleChange} error={errors.telefon} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="sirketAdi" label="Şirket Adı" value={(formData as Firma).sirketAdi} onChange={handleChange} error={errors.sirketAdi} />
            <InputField name="vergiNo" label="Vergi No" value={(formData as Firma).vergiNo || ''} onChange={handleChange} />
            <InputField name="sirketEmail" label="Şirket E-postası" value={(formData as Firma).sirketEmail || ''} onChange={handleChange} type="email" />
            <InputField name="sirketTelefon" label="Şirket Telefonu" value={(formData as Firma).sirketTelefon} onChange={handleChange} error={errors.sirketTelefon}/>
            <InputField name="webSitesi" label="Web Sitesi" value={(formData as Firma).webSitesi || ''} onChange={handleChange} />
          </div>
        )}
        <div>
            <label htmlFor="adres" className={labelClasses}>Adres</label>
            <textarea id="adres" name="adres" value={formData.adres} onChange={handleChange} rows={3} className={`${inputClasses} ${errors.adres ? 'border-red-500' : ''}`}></textarea>
            {errors.adres && <p className="text-xs text-red-600 mt-1">{errors.adres}</p>}
        </div>
      </form>
    </PageOverlay>
  );
};

export default VarlikEkleModal;