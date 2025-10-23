import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { Taksit, Fatura, Ayarlar, Varlik } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';
import SearchableSelect from './SearchableSelect';

interface TaksitEkleModalProps {
  onClose: () => void;
  onSave: (taksitler: Omit<Taksit, 'id'>[]) => void;
  faturalar: Fatura[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
}

export const TaksitEkleModal: React.FC<TaksitEkleModalProps> = ({ onClose, onSave, faturalar, varliklar, ayarlar }) => {
  const [creationMode, setCreationMode] = useState<'fatura' | 'varlik'>('fatura');
  
  // State for 'fatura' mode
  const [seciliFaturaId, setSeciliFaturaId] = useState<number | ''>('');

  // State for 'varlik' mode
  const [seciliVarlikId, setSeciliVarlikId] = useState<number | ''>('');
  const [toplamTutar, setToplamTutar] = useState(0);
  const [paraBirimi, setParaBirimi] = useState(ayarlar.paraBirimleri[0].kod);
  const [aciklama, setAciklama] = useState('');

  // Common state
  const [taksitSayisi, setTaksitSayisi] = useState(2);
  const [ilkVade, setIlkVade] = useState(new Date().toISOString().split('T')[0]);

  const [editableTaksitler, setEditableTaksitler] = useState<Omit<Taksit, 'id'>[]>([]);

  const seciliFatura = useMemo(() => faturalar.find(f => f.id === seciliFaturaId), [seciliFaturaId, faturalar]);

  const { kaynakTutar, kaynakParaBirimi, kaynakVarlikId, kaynakFaturaId, kaynakAciklama } = useMemo(() => {
    if (creationMode === 'fatura' && seciliFatura) {
        return { 
            kaynakTutar: seciliFatura.toplamTutar, 
            kaynakParaBirimi: seciliFatura.paraBirimi, 
            kaynakVarlikId: seciliFatura.varlikId,
            kaynakFaturaId: seciliFatura.id,
            kaynakAciklama: undefined
        };
    } else if (creationMode === 'varlik' && seciliVarlikId) {
        return { 
            kaynakTutar: toplamTutar, 
            kaynakParaBirimi: paraBirimi,
            kaynakVarlikId: Number(seciliVarlikId),
            kaynakFaturaId: null,
            kaynakAciklama: aciklama
        };
    }
    return { kaynakTutar: 0, kaynakParaBirimi: ayarlar.paraBirimleri[0].kod, kaynakVarlikId: 0, kaynakFaturaId: null, kaynakAciklama: undefined };
  }, [creationMode, seciliFatura, seciliVarlikId, toplamTutar, paraBirimi, aciklama, ayarlar.paraBirimleri]);

  useEffect(() => {
    if (kaynakTutar <= 0 || taksitSayisi < 1 || !kaynakVarlikId) {
        setEditableTaksitler([]);
        return;
    };

    const taksitTutari = kaynakTutar / taksitSayisi;
    const plan: Omit<Taksit, 'id'>[] = [];
    let vadeTarihi = new Date(ilkVade);
    vadeTarihi.setUTCHours(0,0,0,0);

    for (let i = 1; i <= taksitSayisi; i++) {
      plan.push({
        faturaId: kaynakFaturaId,
        varlikId: kaynakVarlikId,
        aciklama: kaynakAciklama,
        taksitNo: i,
        vadeTarihi: vadeTarihi.toISOString().split('T')[0],
        tutar: taksitTutari,
        paraBirimi: kaynakParaBirimi,
        durum: 'Ödenmedi',
      });
      vadeTarihi.setMonth(vadeTarihi.getMonth() + 1);
    }
    setEditableTaksitler(plan);
  }, [kaynakTutar, kaynakParaBirimi, kaynakVarlikId, kaynakFaturaId, kaynakAciklama, taksitSayisi, ilkVade]);

  const handleTaksitChange = (index: number, field: 'tutar' | 'vadeTarihi', value: string) => {
      setEditableTaksitler(produce(draft => {
          if (field === 'tutar') {
              draft[index].tutar = Number(value);
          } else {
              draft[index].vadeTarihi = value;
          }
      }));
  };
  
  const planTotal = useMemo(() => editableTaksitler.reduce((sum, t) => sum + t.tutar, 0), [editableTaksitler]);
  const isBalanced = Math.abs(planTotal - kaynakTutar) < 0.01;

  const handleSubmit = () => {
    if (!isBalanced) {
      alert('Taksit tutarları toplamı, kaynak tutarına eşit olmalıdır. Lütfen tutarları kontrol edin.');
      return;
    }
    if (editableTaksitler.length > 0) {
      onSave(editableTaksitler);
    }
  };
  
  const getVarlikAdi = (varlik: Varlik) => varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
  const labelClasses = "block text-sm font-medium text-slate-700";
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500";


  return (
    <PageOverlay
      title="Yeni Taksit Planı Oluştur"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button onClick={handleSubmit} disabled={editableTaksitler.length === 0 || !isBalanced} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-slate-400">
            Planı Kaydet
          </button>
        </>
      }
    >
        <div className="space-y-4">
            <div className="flex gap-4 border-b pb-4">
                <label className="flex items-center text-slate-800"><input type="radio" value="fatura" checked={creationMode === 'fatura'} onChange={() => setCreationMode('fatura')} className="mr-2"/> Faturadan Oluştur</label>
                <label className="flex items-center text-slate-800"><input type="radio" value="varlik" checked={creationMode === 'varlik'} onChange={() => setCreationMode('varlik')} className="mr-2"/> Müşteri/Firma İçin Oluştur</label>
            </div>

            {creationMode === 'fatura' ? (
                <div>
                    <label className={labelClasses}>Taksitlendirilecek Fatura</label>
                    <select value={seciliFaturaId} onChange={e => setSeciliFaturaId(Number(e.target.value))} className={inputClasses}>
                        <option value="" disabled>Fatura Seçin...</option>
                        {faturalar.filter(f => f.tip === 'gelir').map(f => <option key={f.id} value={f.id}>{f.faturaNo} - {getVarlikAdi(varliklar.find(v=>v.id === f.varlikId)!)} - {f.toplamTutar.toFixed(2)}</option>)}
                    </select>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className={labelClasses}>Müşteri/Firma</label>
                        <SearchableSelect 
                            options={varliklar.map(v => ({ value: v.id, label: getVarlikAdi(v)}))}
                            selectedValues={seciliVarlikId ? [Number(seciliVarlikId)] : []}
                            onChange={(ids) => setSeciliVarlikId(ids[0] || '')}
                            placeholder="Müşteri/Firma seçin..."
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="flex items-end gap-2">
                            <div className="flex-grow"><label className={labelClasses}>Toplam Tutar</label><input type="number" value={toplamTutar} onChange={e => setToplamTutar(Number(e.target.value))} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Para Birimi</label><select value={paraBirimi} onChange={e => setParaBirimi(e.target.value)} className={`${inputClasses} mt-0`} >{ayarlar.paraBirimleri.map(p=><option key={p.kod} value={p.kod}>{p.kod}</option>)}</select></div>
                         </div>
                         <div><label className={labelClasses}>Açıklama</label><input type="text" value={aciklama} onChange={e => setAciklama(e.target.value)} className={inputClasses} /></div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                    <label className={labelClasses}>Taksit Sayısı</label>
                    <input type="number" value={taksitSayisi} onChange={e => setTaksitSayisi(Math.max(1, Number(e.target.value)))} className={inputClasses} />
                </div>
                    <div>
                    <label className={labelClasses}>İlk Vade Tarihi</label>
                    <DatePickerInput value={ilkVade} onChange={setIlkVade} />
                </div>
            </div>

            {editableTaksitler.length > 0 && (
                <div className="mt-6">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="font-semibold text-lg text-slate-800">Oluşturulan Plan</h3>
                        <div className={`text-sm font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                            Plan Toplamı: {planTotal.toFixed(2)} / Kaynak: {kaynakTutar.toFixed(2)}
                        </div>
                    </div>
                    <div className="divide-y border rounded-md bg-white max-h-60 overflow-y-auto p-2 space-y-2">
                        {editableTaksitler.map((t, index) => (
                            <div key={t.taksitNo} className="pt-2 grid grid-cols-12 gap-2 items-center text-slate-800">
                                <span className="col-span-2">{t.taksitNo}. Taksit</span>
                                <div className="col-span-5">
                                    <DatePickerInput 
                                        value={t.vadeTarihi}
                                        onChange={date => handleTaksitChange(index, 'vadeTarihi', date)}
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={t.tutar}
                                        onChange={e => handleTaksitChange(index, 'tutar', e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <span className="col-span-1 font-bold">{t.paraBirimi}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </PageOverlay>
  );
};