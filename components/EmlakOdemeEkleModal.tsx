import React, { useState, useMemo } from 'react';
import { EmlakOdeme, Emlak, Sozlesme, GiderTuru, Ayarlar } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';

interface EmlakOdemeEkleModalProps {
  onClose: () => void;
  onSave: (odeme: Omit<EmlakOdeme, 'id'> | EmlakOdeme) => void;
  mevcutOdeme: EmlakOdeme | null;
  emlaklar: Emlak[];
  sozlesmeler: Sozlesme[];
  giderTurleri: GiderTuru[];
  ayarlar: Ayarlar;
}

const EmlakOdemeEkleModal: React.FC<EmlakOdemeEkleModalProps> = ({ onClose, onSave, mevcutOdeme, emlaklar, sozlesmeler, giderTurleri, ayarlar }) => {
  const [odeme, setOdeme] = useState<Omit<EmlakOdeme, 'id'>>({
    emlakId: mevcutOdeme?.emlakId || 0,
    sozlesmeId: mevcutOdeme?.sozlesmeId || 0,
    tutar: mevcutOdeme?.tutar || 0,
    paraBirimi: mevcutOdeme?.paraBirimi || ayarlar.paraBirimleri[0]?.kod || 'TRY',
    tarih: mevcutOdeme?.tarih || new Date().toISOString().split('T')[0],
    giderTuruId: mevcutOdeme?.giderTuruId || 0,
    durum: mevcutOdeme?.durum || 'Ödenmedi',
    aciklama: mevcutOdeme?.aciklama || '',
    tekrarliMi: mevcutOdeme?.tekrarliMi || false,
    tekrarAraligi: mevcutOdeme?.tekrarAraligi || null,
  });
   const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // FIX: Broaden the filter to include any property associated with a lease,
  // making it robust against potential status update issues.
  const kiralikSozlesmeEmlakIds = useMemo(() => new Set(sozlesmeler.filter(s => s.tip === 'kira').map(s => s.emlakId).filter((id): id is number => id !== null)), [sozlesmeler]);
  const kiralanmisEmlaklar = useMemo(() => emlaklar.filter(e => kiralikSozlesmeEmlakIds.has(e.id) || e.id === mevcutOdeme?.emlakId), [emlaklar, kiralikSozlesmeEmlakIds, mevcutOdeme]);

  // FIX: Broaden the filter to show all lease contracts for the selected property, not just 'Active' ones.
  const ilgiliSozlesmeler = useMemo(() => {
      if (!odeme.emlakId) return [];
      return sozlesmeler.filter(s => s.emlakId === odeme.emlakId && s.tip === 'kira');
  }, [odeme.emlakId, sozlesmeler]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setOdeme(prev => ({
            ...prev,
            tekrarliMi: checked,
            tekrarAraligi: checked ? 'aylik' : null
        }));
        return;
    }

    const isNumber = ['emlakId', 'sozlesmeId', 'tutar', 'giderTuruId'].includes(name);

    setOdeme(prev => {
        const newOdeme = { ...prev, [name]: isNumber ? Number(value) : value };
        // Reset contract if property changes
        if (name === 'emlakId') {
            newOdeme.sozlesmeId = 0;
        }
        return newOdeme;
    });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!odeme.emlakId) newErrors.emlakId = "Birim seçimi zorunludur.";
    if (!odeme.sozlesmeId) newErrors.sozlesmeId = "Sözleşme seçimi zorunludur.";
    if (!odeme.giderTuruId) newErrors.giderTuruId = "Gider türü seçimi zorunludur.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const dataToSave = { ...odeme };
    if (!dataToSave.tekrarliMi) {
        dataToSave.tekrarAraligi = null;
    }
    
    onSave(mevcutOdeme ? { ...dataToSave, id: mevcutOdeme.id } : dataToSave);
  };
  
  // FIX: Added standard label classes to ensure visibility.
  const labelClasses = "block text-sm font-medium text-slate-700 mb-1";
  const inputClasses = "w-full p-2 border rounded-md mt-1";

  return (
    <PageOverlay
      title={mevcutOdeme ? 'Ödeme Düzenle' : 'Yeni Emlak Ödemesi Ekle'}
      onClose={onClose}
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
        <button type="submit" form="odeme-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
      </>}
    >
      <form id="odeme-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Kiralanan Birim</label>
            <select name="emlakId" value={odeme.emlakId} onChange={handleInputChange} className={`${inputClasses} ${errors.emlakId ? 'border-red-500' : 'border-slate-300'}`} required>
              <option value={0} disabled>Birim Seçin...</option>
              {kiralanmisEmlaklar.map(e => <option key={e.id} value={e.id}>{`${e.blok} Blok, Kat ${e.kat}, No ${e.daireNo}`}</option>)}
            </select>
            {errors.emlakId && <p className="text-xs text-red-600 mt-1">{errors.emlakId}</p>}
          </div>
          <div>
            <label className={labelClasses}>Kira Sözleşmesi</label>
            <select name="sozlesmeId" value={odeme.sozlesmeId} onChange={handleInputChange} className={`${inputClasses} ${errors.sozlesmeId ? 'border-red-500' : 'border-slate-300'}`} disabled={!odeme.emlakId} required>
              <option value={0} disabled>Sözleşme Seçin...</option>
              {ilgiliSozlesmeler.map(s => <option key={s.id} value={s.id}>{s.baslik}</option>)}
            </select>
            {errors.sozlesmeId && <p className="text-xs text-red-600 mt-1">{errors.sozlesmeId}</p>}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <label className={labelClasses}>Tutar</label>
              <input type="number" name="tutar" value={odeme.tutar} onChange={handleInputChange} className={inputClasses} required/>
            </div>
            <div>
              <label className={labelClasses}>Para Birimi</label>
              <select name="paraBirimi" value={odeme.paraBirimi} onChange={handleInputChange} className="p-2 border rounded-md mt-1">
                {ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClasses}>Ödeme Tarihi</label>
            <DatePickerInput value={odeme.tarih} onChange={date => setOdeme(o => ({...o, tarih: date}))} />
          </div>
          <div>
            <label className={labelClasses}>Gider Türü</label>
            <select name="giderTuruId" value={odeme.giderTuruId} onChange={handleInputChange} className={`${inputClasses} ${errors.giderTuruId ? 'border-red-500' : 'border-slate-300'}`} required>
                <option value={0} disabled>Gider Türü Seçin...</option>
                {giderTurleri.map(gt => <option key={gt.id} value={gt.id}>{gt.ad}</option>)}
            </select>
            {errors.giderTuruId && <p className="text-xs text-red-600 mt-1">{errors.giderTuruId}</p>}
          </div>
           <div>
            <label className={labelClasses}>Ödeme Durumu</label>
            <select name="durum" value={odeme.durum} onChange={handleInputChange} className={inputClasses} required>
                <option value="Ödenmedi">Ödenmedi</option>
                <option value="Ödendi">Ödendi</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
             <label className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                <input type="checkbox" name="tekrarliMi" checked={odeme.tekrarliMi} onChange={handleInputChange} disabled={!!mevcutOdeme} className="h-5 w-5"/> 
                Bu ödeme tekrarlansın mı? (Sadece yeni ödemelerde ayarlanabilir)
            </label>
            {odeme.tekrarliMi && (
                 <div className="mt-2 pl-7">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tekrarlama Sıklığı</label>
                     <select name="tekrarAraligi" value={odeme.tekrarAraligi || ''} onChange={handleInputChange} className="w-full md:w-1/2 p-2 border rounded-md mt-1">
                         <option value="aylik">Aylık</option>
                         <option value="yillik">Yıllık</option>
                     </select>
                 </div>
            )}
        </div>

        <div>
         <label className={labelClasses}>Açıklama (Opsiyonel)</label>
         <textarea name="aciklama" value={odeme.aciklama || ''} onChange={handleInputChange} rows={3} className="w-full p-2 border rounded-md mt-1" />
        </div>
      </form>
    </PageOverlay>
  );
};

export default EmlakOdemeEkleModal;