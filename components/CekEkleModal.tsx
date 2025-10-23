import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import `Firma` type to use in type predicate.
// FIX: Corrected import path for types
import { Cek, Varlik, Ayarlar, Fatura, Proje, Firma } from '../types';
import PageOverlay from './PageOverlay';
import CekOnizleme from './CekOnizleme';
import DatePickerInput from './DatePickerInput';
import SearchableSelect from './SearchableSelect';

interface CekEkleModalProps {
  onClose: () => void;
  onSave: (cek: Omit<Cek, 'id'> | Cek) => void;
  mevcutCek: Cek | null;
  varliklar: Varlik[];
  faturalar: Fatura[];
  projeler: Proje[];
  ayarlar: Ayarlar;
}

const CekEkleModal: React.FC<CekEkleModalProps> = ({ onClose, onSave, mevcutCek, varliklar, faturalar, projeler, ayarlar }) => {
  const [cek, setCek] = useState<Omit<Cek, 'id'>>({
    makbuzNo: mevcutCek?.makbuzNo || `MAK-${Date.now().toString().slice(-6)}`,
    cekNo: mevcutCek?.cekNo || '',
    varlikId: mevcutCek?.varlikId || 0,
    projeId: mevcutCek?.projeId || null,
    faturaIds: mevcutCek?.faturaIds || [],
    lehtar: mevcutCek?.lehtar || '',
    tutar: mevcutCek?.tutar || 0,
    paraBirimi: mevcutCek?.paraBirimi || ayarlar.paraBirimleri[0]?.kod || 'TRY',
    vadeTarihi: mevcutCek?.vadeTarihi || new Date().toISOString().split('T')[0],
    tanzimTarihi: mevcutCek?.tanzimTarihi || new Date().toISOString().split('T')[0],
    durum: mevcutCek?.durum || ayarlar.cekDurumlari[0]?.durum || 'Beklemede',
    aciklama: mevcutCek?.aciklama || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // FIX: Use a type predicate to ensure TypeScript knows `firmalar` is an array of `Firma`.
  const firmalar = useMemo(() => varliklar.filter((v): v is Firma => v.type === 'firma'), [varliklar]);
  const seciliVarlik = useMemo(() => varliklar.find(v => v.id === cek.varlikId) || null, [cek.varlikId, varliklar]);

   useEffect(() => {
    if (cek.faturaIds.length > 0) {
      const ilgiliFaturalar = faturalar.filter(f => cek.faturaIds.includes(f.id));
      if (ilgiliFaturalar.length > 0) {
        const toplamTutar = ilgiliFaturalar.reduce((acc, fatura) => acc + fatura.toplamTutar, 0);
        const ilkParaBirimi = ilgiliFaturalar[0].paraBirimi;
        const ilkProjeId = ilgiliFaturalar.find(f => f.projeId)?.projeId || null;
        setCek(prev => ({ ...prev, tutar: toplamTutar, paraBirimi: ilkParaBirimi, projeId: ilkProjeId }));
      }
    }
  }, [cek.faturaIds, faturalar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'projeId') {
        setCek(prev => ({...prev, projeId: value ? Number(value) : null}));
    } else {
        const isNumber = ['tutar', 'varlikId'].includes(name);
        setCek(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    }
  };
  
  const handleFaturaIdsChange = (selectedIds: number[]) => {
      setCek(prev => ({ ...prev, faturaIds: selectedIds }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!cek.cekNo.trim()) newErrors.cekNo = "Çek numarası zorunludur.";
    if (!cek.varlikId) newErrors.varlikId = "Alıcı firma seçimi zorunludur.";
    if (!cek.lehtar.trim()) newErrors.lehtar = "Lehtar adı zorunludur.";
    if (cek.tutar <= 0) newErrors.tutar = "Tutar 0'dan büyük olmalıdır.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(mevcutCek ? { ...cek, id: mevcutCek.id } : cek);
  };
  
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutCek ? 'Çek Düzenle' : 'Yeni Çek Ekle'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="cek-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form id="cek-form" onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClasses}>Makbuz No</label><input type="text" name="makbuzNo" value={cek.makbuzNo} onChange={handleInputChange} className={inputClasses} required/></div>
            <div>
                <label className={labelClasses}>Çek No</label>
                <input type="text" name="cekNo" value={cek.cekNo} onChange={handleInputChange} className={`${inputClasses} ${errors.cekNo ? 'border-red-500 ring-1 ring-red-500' : ''}`} required/>
                {errors.cekNo && <p className="text-xs text-red-600 mt-1">{errors.cekNo}</p>}
            </div>
            <div>
              <label className={labelClasses}>Alıcı Firma</label>
              <div className={errors.varlikId ? 'border border-red-500 rounded-md ring-1 ring-red-500' : ''}>
                <SearchableSelect
                    options={firmalar.map(f => ({ value: f.id, label: f.sirketAdi }))}
                    selectedValues={cek.varlikId ? [cek.varlikId] : []}
                    onChange={(selected) => handleInputChange({ target: { name: 'varlikId', value: String(selected[0] || 0) } } as any)}
                    placeholder="Firma Seçin..."
                />
              </div>
              {errors.varlikId && <p className="text-xs text-red-600 mt-1">{errors.varlikId}</p>}
            </div>
            <div>
                <label className={labelClasses}>Lehtar</label>
                <input type="text" name="lehtar" value={cek.lehtar} onChange={handleInputChange} className={`${inputClasses} ${errors.lehtar ? 'border-red-500 ring-1 ring-red-500' : ''}`} required/>
                {errors.lehtar && <p className="text-xs text-red-600 mt-1">{errors.lehtar}</p>}
            </div>
            <div><label className={labelClasses}>Tanzim Tarihi</label><DatePickerInput value={cek.tanzimTarihi} onChange={date => setCek(c => ({...c, tanzimTarihi: date}))} /></div>
            <div><label className={labelClasses}>Vade Tarihi</label><DatePickerInput value={cek.vadeTarihi} onChange={date => setCek(c => ({...c, vadeTarihi: date}))} /></div>
             <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <label className={labelClasses}>Tutar</label>
                    <input type="number" name="tutar" value={cek.tutar} onChange={handleInputChange} className={`${inputClasses} ${errors.tutar ? 'border-red-500 ring-1 ring-red-500' : ''}`} required/>
                    {errors.tutar && <p className="text-xs text-red-600 mt-1">{errors.tutar}</p>}
                </div>
                <div><label className={labelClasses}>Para Birimi</label><select name="paraBirimi" value={cek.paraBirimi} onChange={handleInputChange} className={`${inputClasses} mt-0`}>{ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}</select></div>
             </div>
             <div><label className={labelClasses}>Durum</label><select name="durum" value={cek.durum} onChange={handleInputChange} className={inputClasses}>{ayarlar.cekDurumlari.map(d => <option key={d.durum} value={d.durum}>{d.durum}</option>)}</select></div>
          </div>
           <div>
              <label className={labelClasses}>İlişkili Proje (Opsiyonel)</label>
              <select name="projeId" value={cek.projeId || ''} onChange={handleInputChange} className={inputClasses}>
                  <option value="">Proje Yok</option>
                  {projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
              </select>
          </div>
          <div>
             <label className={labelClasses}>İlişkili Faturalar (Opsiyonel)</label>
             <SearchableSelect
                options={faturalar
                    .filter(f => f.varlikId === cek.varlikId && f.tip === 'gider' && f.odemeTipi === 'Çek' && f.odemeDurumu !== 'Ödendi')
                    .map(f => ({ value: f.id, label: `${f.faturaNo} - ${f.toplamTutar.toFixed(2)}`}))
                }
                selectedValues={cek.faturaIds}
                onChange={handleFaturaIdsChange}
                placeholder="Fatura seçin..."
                isMulti
             />
          </div>
          <div><label className={labelClasses}>Açıklama</label><textarea name="aciklama" value={cek.aciklama} onChange={handleInputChange} rows={3} className={inputClasses}></textarea></div>
        </form>
        <div className="md:col-span-1">
          <CekOnizleme cek={cek} varlik={seciliVarlik} ayarlar={ayarlar} />
        </div>
      </div>
    </PageOverlay>
  );
};

export default CekEkleModal;