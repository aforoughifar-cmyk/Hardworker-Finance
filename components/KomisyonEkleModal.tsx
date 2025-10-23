import React, { useState, useMemo, useEffect } from 'react';
import { Komisyon, EmlakDanismani, Sozlesme, Emlak, Ayarlar } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';
import SearchableSelect from './SearchableSelect';

interface KomisyonEkleModalProps {
  onClose: () => void;
  onSave: (komisyon: Omit<Komisyon, 'id'> | Komisyon) => void;
  mevcutKomisyon: Komisyon | null;
  danismanlar: EmlakDanismani[];
  sozlesmeler: Sozlesme[];
  emlaklar: Emlak[];
  ayarlar: Ayarlar;
}

const KomisyonEkleModal: React.FC<KomisyonEkleModalProps> = ({ onClose, onSave, mevcutKomisyon, danismanlar, sozlesmeler, emlaklar, ayarlar }) => {
  const [komisyon, setKomisyon] = useState<Omit<Komisyon, 'id'>>({
    danismanId: mevcutKomisyon?.danismanId || 0,
    sozlesmeIds: mevcutKomisyon?.sozlesmeIds || [],
    tarih: mevcutKomisyon?.tarih || new Date().toISOString().split('T')[0],
    sozlesmeTutari: mevcutKomisyon?.sozlesmeTutari || 0,
    paraBirimi: mevcutKomisyon?.paraBirimi || ayarlar.paraBirimleri[0].kod,
    komisyonYuzdesi: mevcutKomisyon?.komisyonYuzdesi || 0,
    indirimYuzdesi: mevcutKomisyon?.indirimYuzdesi || 0,
    netKomisyonTutari: mevcutKomisyon?.netKomisyonTutari || 0,
    aciklama: mevcutKomisyon?.aciklama || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tutarManuel, setTutarManuel] = useState(false);

  const uygunSozlesmeler = useMemo(() => {
    // Show all sales and rental contracts, regardless of the property's status.
    return sozlesmeler.filter(s => s.tip === 'satis' || s.tip === 'kira');
  }, [sozlesmeler]);

  useEffect(() => {
    if (!tutarManuel) {
      const seciliSozlesmeler = uygunSozlesmeler.filter(s => komisyon.sozlesmeIds.includes(s.id));
      const toplamTutar = seciliSozlesmeler.reduce((acc, s) => acc + s.toplamTutar, 0);
      
      const ilkParaBirimi = seciliSozlesmeler.length > 0 
          ? seciliSozlesmeler[0].paraBirimi 
          : (mevcutKomisyon?.paraBirimi || ayarlar.paraBirimleri[0].kod);

      setKomisyon(k => ({ 
        ...k, 
        sozlesmeTutari: toplamTutar,
        paraBirimi: ilkParaBirimi 
      }));
    }
  }, [komisyon.sozlesmeIds, tutarManuel, uygunSozlesmeler, ayarlar.paraBirimleri, mevcutKomisyon]);

  useEffect(() => {
    const bazKomisyon = komisyon.sozlesmeTutari * (komisyon.komisyonYuzdesi / 100);
    const indirimMiktari = bazKomisyon * (komisyon.indirimYuzdesi / 100);
    const netTutar = bazKomisyon - indirimMiktari;
    setKomisyon(k => ({ ...k, netKomisyonTutari: netTutar }));
  }, [komisyon.sozlesmeTutari, komisyon.komisyonYuzdesi, komisyon.indirimYuzdesi]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    const isNumber = ['danismanId', 'sozlesmeTutari', 'komisyonYuzdesi', 'indirimYuzdesi'].includes(name);
    setKomisyon(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };
  
  const handleSozlesmeChange = (ids: number[]) => {
      if (errors.sozlesmeIds) setErrors(prev => ({...prev, sozlesmeIds: ''}));
      setKomisyon(k => ({ ...k, sozlesmeIds: ids }));
  };

  const validate = () => {
      const newErrors: { [key: string]: string } = {};
      if (!komisyon.danismanId) newErrors.danismanId = "Danışman seçimi zorunludur.";
      if (komisyon.sozlesmeIds.length === 0) newErrors.sozlesmeIds = "En az bir sözleşme seçilmelidir.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(mevcutKomisyon ? { ...komisyon, id: mevcutKomisyon.id } : komisyon);
  };
  
  const labelClasses = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <PageOverlay
      title={mevcutKomisyon ? 'Komisyon Düzenle' : 'Yeni Komisyon Ekle'}
      onClose={onClose}
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
        <button type="submit" form="komisyon-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
      </>}
    >
      <form id="komisyon-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Komisyon Alacak Danışman</label>
            <select name="danismanId" value={komisyon.danismanId} onChange={handleInputChange} className={`w-full p-2 border rounded-md mt-1 ${errors.danismanId ? 'border-red-500' : 'border-slate-300'}`} required>
              <option value={0} disabled>Danışman Seçin...</option>
              {danismanlar.map(d => <option key={d.id} value={d.id}>{d.type === 'kisi' ? `${d.isim} ${d.soyisim}` : d.sirketAdi}</option>)}
            </select>
            {errors.danismanId && <p className="text-xs text-red-600 mt-1">{errors.danismanId}</p>}
          </div>
          <div><label className={labelClasses}>Tarih</label><DatePickerInput value={komisyon.tarih} onChange={date => setKomisyon(k => ({ ...k, tarih: date }))} /></div>
        </div>
        <div>
          <label className={labelClasses}>İlgili Sözleşme(ler)</label>
          <div className={errors.sozlesmeIds ? 'border border-red-500 rounded-md' : ''}>
            <SearchableSelect
                options={uygunSozlesmeler.map(s => ({ value: s.id, label: `${s.baslik} - ${s.toplamTutar.toFixed(2)} ${s.paraBirimi}` }))}
                selectedValues={komisyon.sozlesmeIds}
                onChange={handleSozlesmeChange}
                placeholder="Sözleşme seçin..."
                isMulti
            />
          </div>
           {errors.sozlesmeIds && <p className="text-xs text-red-600 mt-1">{errors.sozlesmeIds}</p>}
        </div>
        <div className="p-4 bg-slate-100 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={tutarManuel} onChange={e => setTutarManuel(e.target.checked)}/> Tutarı manuel gir</label>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="number" 
                  name="sozlesmeTutari" 
                  value={komisyon.sozlesmeTutari} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded-md" 
                  disabled={!tutarManuel}
                />
                <select 
                  name="paraBirimi" 
                  value={komisyon.paraBirimi} 
                  onChange={handleInputChange} 
                  className="p-2 border rounded-md bg-white"
                >
                  {ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClasses}>Komisyon (%)</label>
              <input type="number" name="komisyonYuzdesi" value={komisyon.komisyonYuzdesi} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" />
            </div>
            <div>
              <label className={labelClasses}>İndirim (%)</label>
              <input type="number" name="indirimYuzdesi" value={komisyon.indirimYuzdesi} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" />
            </div>
            <div className="text-right">
                <p className="text-sm text-slate-500">Net Komisyon Tutarı</p>
                <p className="text-2xl font-bold text-emerald-600">{ayarlar.paraBirimleri.find(p => p.kod === komisyon.paraBirimi)?.sembol || ''}{komisyon.netKomisyonTutari.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div>
          <label className={labelClasses}>Açıklama</label>
          <textarea name="aciklama" value={komisyon.aciklama} onChange={handleInputChange} rows={3} className="w-full p-2 border rounded-md mt-1"></textarea>
        </div>
      </form>
    </PageOverlay>
  );
};

export default KomisyonEkleModal;