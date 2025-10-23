import React, { useState } from 'react';
import { Calisan, Pozisyon, Ayarlar } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';

// Helper component with explicit styling to prevent browser override issues
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, error, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-slate-600">{label}</label>
    <input id={props.name} {...props} className={`mt-1 w-full p-2 border rounded-md bg-white text-slate-900 ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);


interface CalisanEkleModalProps {
  onClose: () => void;
  onSave: (calisan: Omit<Calisan, 'id'> | Calisan) => void;
  mevcutCalisan: Calisan | null;
  pozisyonlar: Pozisyon[];
  ayarlar: Ayarlar;
}

const CalisanEkleModal: React.FC<CalisanEkleModalProps> = ({ onClose, onSave, mevcutCalisan, pozisyonlar, ayarlar }) => {
  const [calisan, setCalisan] = useState<Omit<Calisan, 'id'>>({
    isim: mevcutCalisan?.isim || '',
    soyisim: mevcutCalisan?.soyisim || '',
    dogumTarihi: mevcutCalisan?.dogumTarihi || '',
    pozisyonId: mevcutCalisan?.pozisyonId || 0,
    iseGirisTarihi: mevcutCalisan?.iseGirisTarihi || new Date().toISOString().split('T')[0],
    email: mevcutCalisan?.email || '',
    telefon: mevcutCalisan?.telefon || '',
    adres: mevcutCalisan?.adres || '',
    aktif: mevcutCalisan?.aktif ?? true,
    kimlikNo: mevcutCalisan?.kimlikNo || '',
    sigortaNo: mevcutCalisan?.sigortaNo || '',
    banka: mevcutCalisan?.banka || '',
    bankaSubeAdi: mevcutCalisan?.bankaSubeAdi || '',
    hesapNumarasi: mevcutCalisan?.hesapNumarasi || '',
    iban: mevcutCalisan?.iban || '',
    tabanMaas: mevcutCalisan?.tabanMaas || 0,
    paraBirimi: mevcutCalisan?.paraBirimi || ayarlar.paraBirimleri[0].kod,
    calismaIzniVarMi: mevcutCalisan?.calismaIzniVarMi || false,
    calismaIzniBaslangic: mevcutCalisan?.calismaIzniBaslangic,
    calismaIzniBitis: mevcutCalisan?.calismaIzniBitis,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete (newErrors as any)[name];
            return newErrors;
        });
    }

    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setCalisan(prev => ({
            ...prev, 
            [name]: checked,
            // Reset dates if permit is deactivated
            ...(!checked && name === 'calismaIzniVarMi' && { calismaIzniBaslangic: undefined, calismaIzniBitis: undefined })
        }));
    } else {
        const isNumber = ['pozisyonId', 'tabanMaas'].includes(name);
        setCalisan(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!calisan.isim.trim()) newErrors.isim = "İsim zorunludur.";
    if (!calisan.soyisim.trim()) newErrors.soyisim = "Soyisim zorunludur.";
    if (!calisan.kimlikNo.trim()) newErrors.kimlikNo = "Kimlik No zorunludur.";
    if (!calisan.telefon.trim()) newErrors.telefon = "Telefon zorunludur.";
    if (!calisan.pozisyonId || calisan.pozisyonId === 0) newErrors.pozisyonId = "Pozisyon seçimi zorunludur.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(mevcutCalisan ? { ...calisan, id: mevcutCalisan.id } : calisan);
    }
  };
  
  return (
    <PageOverlay
      title={mevcutCalisan ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle'}
      onClose={onClose}
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
        <button type="submit" form="calisan-form" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Kaydet</button>
      </>}
    >
      <form id="calisan-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Kişisel Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="İsim" name="isim" value={calisan.isim} onChange={handleChange} required error={errors.isim} />
            <InputField label="Soyisim" name="soyisim" value={calisan.soyisim} onChange={handleChange} required error={errors.soyisim} />
            <div>
              <label className="block text-sm font-medium text-slate-600">Doğum Tarihi</label>
              <DatePickerInput value={calisan.dogumTarihi || ''} onChange={date => setCalisan(c => ({...c, dogumTarihi: date}))} />
            </div>
            <InputField label="Kimlik/Pasaport NO" name="kimlikNo" value={calisan.kimlikNo} onChange={handleChange} required error={errors.kimlikNo}/>
            <InputField label="Telefon" name="telefon" value={calisan.telefon} onChange={handleChange} required error={errors.telefon} />
            <InputField label="E-posta" name="email" type="email" value={calisan.email || ''} onChange={handleChange} />
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600">Adres</label>
              <textarea name="adres" value={calisan.adres} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md bg-white text-slate-900"></textarea>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium text-slate-800 mb-4">İş Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Pozisyon</label>
              <select name="pozisyonId" value={calisan.pozisyonId} onChange={handleChange} className={`w-full p-2 border rounded-md mt-1 bg-white text-slate-900 ${errors.pozisyonId ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} required>
                <option value={0} disabled>Seçiniz...</option>
                {pozisyonlar.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
              </select>
              {errors.pozisyonId && <p className="text-xs text-red-600 mt-1">{errors.pozisyonId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">İşe Giriş Tarihi</label>
              <DatePickerInput value={calisan.iseGirisTarihi} onChange={date => setCalisan(c => ({...c, iseGirisTarihi: date}))} />
            </div>
            <InputField label="Sigorta No" name="sigortaNo" value={calisan.sigortaNo} onChange={handleChange} />
            <div className="flex items-center pt-6">
                <input type="checkbox" name="aktif" id="aktif" checked={calisan.aktif} onChange={handleChange} className="h-4 w-4 rounded" />
                <label htmlFor="aktif" className="ml-2 block text-sm text-slate-900">Çalışan aktif mi?</label>
            </div>
            <div className="md:col-span-2 pt-4 border-t">
                 <label className="flex items-center gap-2 font-semibold text-slate-800">
                    <input type="checkbox" name="calismaIzniVarMi" checked={calisan.calismaIzniVarMi} onChange={handleChange} className="h-4 w-4 rounded" />
                    Çalışma İzni Var mı?
                </label>
                {calisan.calismaIzniVarMi && (
                    <div className="grid grid-cols-2 gap-4 mt-2 pl-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">İzin Başlangıç Tarihi</label>
                            <DatePickerInput value={calisan.calismaIzniBaslangic || ''} onChange={date => setCalisan(c => ({...c, calismaIzniBaslangic: date}))} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">İzin Bitiş Tarihi</label>
                            <DatePickerInput value={calisan.calismaIzniBitis || ''} onChange={date => setCalisan(c => ({...c, calismaIzniBitis: date}))} />
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Finansal Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Banka Adı" name="banka" value={calisan.banka} onChange={handleChange} />
            <InputField label="Banka Şube Adı" name="bankaSubeAdi" value={calisan.bankaSubeAdi} onChange={handleChange} />
            <InputField label="Hesap Numarası" name="hesapNumarasi" value={calisan.hesapNumarasi} onChange={handleChange} />
            <InputField label="IBAN" name="iban" value={calisan.iban} onChange={handleChange} />
            <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-slate-600">Taban Maaş (Brüt)</label>
                    <input type="number" name="tabanMaas" value={calisan.tabanMaas} onChange={handleChange} className="w-full p-2 border rounded-md mt-1 bg-white text-slate-900" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600">Para Birimi</label>
                    <select name="paraBirimi" value={calisan.paraBirimi} onChange={handleChange} className="p-2 border rounded-md mt-1 bg-white text-slate-900">
                        {ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}
                    </select>
                </div>
            </div>
          </div>
        </div>
      </form>
    </PageOverlay>
  );
};

export default CalisanEkleModal;