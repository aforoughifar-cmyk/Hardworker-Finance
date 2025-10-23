import React, { useState, useEffect, useRef } from 'react';
import { produce } from 'immer';
// FIX: Corrected import path for types
import { Fatura, FaturaKalemi, Varlik, Ayarlar, Proje, Irsaliye } from '../types';
import PageOverlay from './PageOverlay';
import { TrashIcon, PlusIcon, PaperClipIcon } from './icons/AppIcons';
import DatePickerInput from './DatePickerInput';
import SearchableSelect from './SearchableSelect';

interface FaturaFormProps {
  onClose: () => void;
  onSave: (fatura: Omit<Fatura, 'id'> | Fatura, irsaliyeId?: number) => void;
  mevcutFatura: Fatura | null;
  mevcutIrsaliye?: Irsaliye | null;
  varliklar: Varlik[];
  projeler: Proje[];
  ayarlar: Ayarlar;
}

const FaturaForm: React.FC<FaturaFormProps> = ({ onClose, onSave, mevcutFatura, mevcutIrsaliye, varliklar, projeler, ayarlar }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getYeniFaturaNo = () => {
    const yil = new Date().getFullYear();
    const yeniNumara = ayarlar.sonFaturaNumarasi + 1;
    return ayarlar.faturaNumaraSablonu
        .replace('{YYYY}', yil.toString())
        .replace('{NNNN}', yeniNumara.toString().padStart(4, '0'));
  };

  const [fatura, setFatura] = useState<Omit<Fatura, 'id'>>(() => {
    if (mevcutFatura) return mevcutFatura;
    if (mevcutIrsaliye) {
      const kalemler: FaturaKalemi[] = mevcutIrsaliye.kalemler.map(ik => ({
        id: Date.now() + Math.random(),
        aciklama: ik.urunAdi,
        adet: ik.miktar,
        birim: ik.birim,
        birimFiyat: 0,
        toplam: 0
      }));
      return {
        faturaNo: getYeniFaturaNo(),
        varlikId: mevcutIrsaliye.varlikId,
        projeId: mevcutIrsaliye.projeId,
        faturaTarihi: new Date().toISOString().split('T')[0],
        odemeTarihi: new Date().toISOString().split('T')[0],
        tip: 'gelir',
        kalemler,
        araToplam: 0,
        vergiOrani: '',
        toplamTutar: 0,
        paraBirimi: ayarlar.paraBirimleri[0]?.kod || 'TRY',
        odemeDurumu: 'Ödenmedi',
        odemeTipi: ayarlar.odemeTipleri[0] || 'Nakit',
        aciklama: `İrsaliye No: ${mevcutIrsaliye.id}`,
      };
    }
    return {
      faturaNo: getYeniFaturaNo(),
      varlikId: 0,
      projeId: null,
      faturaTarihi: new Date().toISOString().split('T')[0],
      odemeTarihi: new Date().toISOString().split('T')[0],
      tip: 'gelir',
      kalemler: [{ id: Date.now(), aciklama: '', adet: 1, birim: 'adet', birimFiyat: 0, toplam: 0 }],
      araToplam: 0,
      vergiOrani: '',
      toplamTutar: 0,
      paraBirimi: ayarlar.paraBirimleri[0]?.kod || 'TRY',
      odemeDurumu: 'Ödenmedi',
      odemeTipi: ayarlar.odemeTipleri[0] || 'Nakit',
    };
  });

  useEffect(() => {
    const yeniAraToplam = fatura.kalemler.reduce((acc, kalem) => acc + kalem.toplam, 0);
    const vergi = yeniAraToplam * ((Number(fatura.vergiOrani) || 0) / 100);
    const yeniToplamTutar = yeniAraToplam + vergi;
    setFatura(f => ({ ...f, araToplam: yeniAraToplam, toplamTutar: yeniToplamTutar }));
  }, [fatura.kalemler, fatura.vergiOrani]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'projeId') {
        setFatura(prev => ({...prev, projeId: value ? Number(value) : null}));
    } else if (name === 'varlikId') {
        setFatura(prev => ({...prev, varlikId: Number(value)}));
    } else {
        setFatura(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleKalemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFatura(produce(draft => {
      const kalem = draft.kalemler[index];
      if (name === 'adet' || name === 'birimFiyat') {
          (kalem as any)[name] = parseFloat(value) || 0;
      } else {
          (kalem as any)[name] = value;
      }
      kalem.toplam = (kalem.adet || 0) * (kalem.birimFiyat || 0);
    }));
  };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFatura(prev => ({
          ...prev,
          ekDosya: { veri: event.target?.result as string, tip: file.type, ad: file.name }
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleYeniKalem = () => {
    setFatura(produce(draft => {
      draft.kalemler.push({ id: Date.now(), aciklama: '', adet: 1, birim: 'adet', birimFiyat: 0, toplam: 0 });
    }));
  };

  const handleKalemSil = (index: number) => {
    setFatura(produce(draft => {
      draft.kalemler.splice(index, 1);
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fatura.varlikId || fatura.varlikId === 0) newErrors.varlikId = "Müşteri/Firma seçimi zorunludur.";
    if (!fatura.faturaNo.trim()) newErrors.faturaNo = "Fatura numarası zorunludur.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const dataToSave = mevcutFatura ? { ...fatura, id: mevcutFatura.id } : fatura;
    onSave(dataToSave, mevcutIrsaliye?.id);
  };
  
  const getVarlikAdi = (varlik: Varlik) => varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;

  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutFatura ? 'Fatura Düzenle' : 'Yeni Fatura Oluştur'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="fatura-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="fatura-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className={labelClasses}>Müşteri/Firma</label>
                <div className={errors.varlikId ? 'border border-red-500 rounded-md' : ''}>
                    <SearchableSelect
                        options={varliklar.map(v => ({ value: v.id, label: getVarlikAdi(v) }))}
                        selectedValues={fatura.varlikId ? [fatura.varlikId] : []}
                        onChange={(selected) => handleInputChange({ target: { name: 'varlikId', value: String(selected[0] || 0) } } as any)}
                        placeholder="Müşteri/Firma Seçin..."
                    />
                </div>
                 {errors.varlikId && <p className="text-xs text-red-600 mt-1">{errors.varlikId}</p>}
            </div>
             <div>
                <label className={labelClasses}>İlişkili Proje (Opsiyonel)</label>
                <select name="projeId" value={fatura.projeId || ''} onChange={handleInputChange} className={inputClasses}>
                    <option value="">Proje Yok</option>
                    {projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
                </select>
            </div>
             <div>
                <label className={labelClasses}>Fatura Tipi</label>
                <select name="tip" value={fatura.tip} onChange={handleInputChange} className={inputClasses}>
                    <option value="gelir">Gelir</option>
                    <option value="gider">Gider</option>
                </select>
            </div>
             <div>
                <label className={labelClasses}>Fatura No</label>
                <input type="text" name="faturaNo" value={fatura.faturaNo} onChange={handleInputChange} className={`${inputClasses} ${errors.faturaNo ? 'border-red-500' : ''}`} />
                {errors.faturaNo && <p className="text-xs text-red-600 mt-1">{errors.faturaNo}</p>}
            </div>
            <div>
                <label className={labelClasses}>Fatura Tarihi</label>
                <DatePickerInput value={fatura.faturaTarihi} onChange={(date) => setFatura(f => ({...f, faturaTarihi: date}))} />
            </div>
            <div>
                <label className={labelClasses}>Ödeme Tarihi</label>
                 <DatePickerInput value={fatura.odemeTarihi} onChange={(date) => setFatura(f => ({...f, odemeTarihi: date}))} />
            </div>
        </div>
        
        {/* Kalemler */}
        <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2 text-slate-800">Fatura Kalemleri</h3>
            {fatura.kalemler.map((kalem, index) => (
                <div key={kalem.id} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" name="aciklama" placeholder="Açıklama" value={kalem.aciklama} onChange={(e) => handleKalemChange(index, e)} className={`${inputClasses} col-span-5`} />
                    <input type="number" name="adet" placeholder="Adet" value={kalem.adet} onChange={(e) => handleKalemChange(index, e)} className={`${inputClasses} col-span-1`} />
                    <input type="text" name="birim" placeholder="Birim" value={kalem.birim} onChange={(e) => handleKalemChange(index, e)} className={`${inputClasses} col-span-1`} />
                    <input type="number" step="0.01" name="birimFiyat" placeholder="Birim Fiyat" value={kalem.birimFiyat} onChange={(e) => handleKalemChange(index, e)} className={`${inputClasses} col-span-2`} />
                    <input type="text" value={(ayarlar.paraBirimleri.find(p=>p.kod === fatura.paraBirimi)?.sembol || '') + kalem.toplam.toFixed(2)} readOnly className="col-span-2 p-2 border bg-slate-100 rounded-md text-right" />
                    <button type="button" onClick={() => handleKalemSil(index)} className="col-span-1 text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>
                </div>
            ))}
            <button type="button" onClick={handleYeniKalem} className="flex items-center gap-1 text-sm text-indigo-600 font-semibold mt-2"><PlusIcon/>Yeni Kalem Ekle</button>
        </div>

        {/* Toplamlar ve Notlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
            <div>
                <label className={labelClasses}>Açıklama / Not</label>
                <textarea name="aciklama" value={fatura.aciklama || ''} onChange={handleInputChange} rows={4} className={inputClasses}></textarea>
                <div className="mt-2">
                    <label className={labelClasses}>Ek Dosya</label>
                    <div className="mt-1 flex items-center gap-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-sm font-semibold rounded-md">
                            <PaperClipIcon/> {fatura.ekDosya ? 'Dosya Değiştir' : 'Dosya Seç'}
                        </button>
                        {fatura.ekDosya && <span className="text-sm text-slate-600">{fatura.ekDosya.ad}</span>}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                 <div className="flex justify-between items-center text-slate-700">
                    <span>Ara Toplam</span>
                    <span className="font-semibold">{ayarlar.paraBirimleri.find(p=>p.kod === fatura.paraBirimi)?.sembol}{fatura.araToplam.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-700">Vergi</span>
                        <input type="number" name="vergiOrani" value={fatura.vergiOrani} onChange={handleInputChange} className="w-20 p-1 border rounded-md text-right bg-white text-slate-900"/>
                        <span className="text-slate-700">%</span>
                    </div>
                    <span className="font-semibold text-slate-700">{ayarlar.paraBirimleri.find(p=>p.kod === fatura.paraBirimi)?.sembol}{(fatura.araToplam * (Number(fatura.vergiOrani) || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold border-t pt-2 text-slate-800">
                    <span>Genel Toplam</span>
                    <span>{ayarlar.paraBirimleri.find(p=>p.kod === fatura.paraBirimi)?.sembol}{fatura.toplamTutar.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <label className={labelClasses}>Para Birimi</label>
                    <select name="paraBirimi" value={fatura.paraBirimi} onChange={handleInputChange} className="p-2 border rounded-md bg-white text-slate-900">
                        {ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}
                    </select>
                </div>
                 <div className="flex justify-between items-center">
                    <label className={labelClasses}>Ödeme Tipi</label>
                    <select name="odemeTipi" value={fatura.odemeTipi} onChange={handleInputChange} className="p-2 border rounded-md bg-white text-slate-900">
                       {ayarlar.odemeTipleri.map(tip => <option key={tip} value={tip}>{tip}</option>)}
                    </select>
                </div>
                {fatura.odemeTipi === 'Çek' && (
                     <div className="flex justify-between items-center">
                        <label className={labelClasses}>Çek Numarası</label>
                        <input type="text" name="cekNumarasi" value={fatura.cekNumarasi || ''} onChange={handleInputChange} className="p-2 border rounded-md bg-white text-slate-900" placeholder="Çek numarasını girin"/>
                    </div>
                )}
            </div>
        </div>
      </form>
    </PageOverlay>
  );
  
};

export default FaturaForm;