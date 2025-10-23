import React, { useState, useRef, useMemo } from 'react';
import { Sozlesme, Varlik, Proje, Emlak, Ayarlar } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';
import RichTextEditor from './RichTextEditor';
import { PaperClipIcon } from './icons/AppIcons';
import SearchableSelect from './SearchableSelect';

interface SozlesmeEkleModalProps {
  onClose: () => void;
  onSave: (sozlesme: Omit<Sozlesme, 'id'> | Sozlesme) => void;
  mevcutSozlesme: Sozlesme | null;
  varliklar: Varlik[];
  projeler: Proje[];
  emlaklar: Emlak[];
  ayarlar: Ayarlar;
}

const SozlesmeEkleModal: React.FC<SozlesmeEkleModalProps> = ({ onClose, onSave, mevcutSozlesme, varliklar, projeler, emlaklar, ayarlar }) => {
  const [sozlesme, setSozlesme] = useState<Omit<Sozlesme, 'id'>>({
    baslik: mevcutSozlesme?.baslik || '',
    varlikId: mevcutSozlesme?.varlikId || 0,
    projeId: mevcutSozlesme?.projeId || null,
    emlakId: mevcutSozlesme?.emlakId || null,
    tip: mevcutSozlesme?.tip || 'diger',
    sozlesmeTarihi: mevcutSozlesme?.sozlesmeTarihi || new Date().toISOString().split('T')[0],
    bitisTarihi: mevcutSozlesme?.bitisTarihi || undefined,
    gecerlilikTarihi: mevcutSozlesme?.gecerlilikTarihi || undefined,
    toplamTutar: mevcutSozlesme?.toplamTutar || 0,
    paraBirimi: mevcutSozlesme?.paraBirimi || ayarlar.paraBirimleri[0].kod,
    odemeTipi: mevcutSozlesme?.odemeTipi || ayarlar.odemeTipleri[0] || 'Nakit',
    icerik: mevcutSozlesme?.icerik || '',
    durum: mevcutSozlesme?.durum || 'Taslak',
    ekDosya: mevcutSozlesme?.ekDosya,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [gecerlilikVar, setGecerlilikVar] = useState(!!mevcutSozlesme?.gecerlilikTarihi);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uygunEmlaklar = useMemo(() => {
    const filterLogic = (e: Emlak, durum: 'satilik' | 'kiralik') => {
      // Bir emlak şu durumlarda uygundur:
      // 1. Durumu sözleşme tipiyle eşleşiyor VE henüz bir sözleşmesi yok (kiralık/satılık).
      // 2. VEYA bu emlak, şu an düzenlenmekte olan sözleşmeye zaten atanmış olan emlak.
      return (e.durum === durum && e.sozlesmeId == null) || e.id === mevcutSozlesme?.emlakId;
    };

    if (sozlesme.tip === 'satis') {
        return emlaklar.filter(e => filterLogic(e, 'satilik'));
    }
    if (sozlesme.tip === 'kira') {
        return emlaklar.filter(e => filterLogic(e, 'kiralik'));
    }
    // 'Diğer' tipteki sözleşmeler için, henüz sözleşmesi olmayan tüm emlakları listele
    return emlaklar.filter(e => e.sozlesmeId == null || e.id === mevcutSozlesme?.emlakId);
  }, [sozlesme.tip, emlaklar, mevcutSozlesme]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    const isNumeric = ['varlikId', 'projeId', 'emlakId', 'toplamTutar'].includes(name);
    
    setSozlesme(prev => {
        const newSozlesme = {
            ...prev,
            [name]: isNumeric ? (value ? Number(value) : null) : value
        };
        // Sözleşme tipi değiştiğinde ilgili emlak seçimini sıfırla
        if (name === 'tip') {
            newSozlesme.emlakId = null;
        }
        return newSozlesme;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSozlesme(prev => ({ ...prev, ekDosya: { veri: event.target?.result as string, tip: file.type, ad: file.name } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!sozlesme.baslik.trim()) newErrors.baslik = "Sözleşme başlığı zorunludur.";
    if (!sozlesme.varlikId) newErrors.varlikId = "Taraf (Müşteri/Firma) seçimi zorunludur.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!validate()) return;

    const dataToSave = { ...sozlesme };
    if (sozlesme.tip !== 'diger' || !gecerlilikVar) {
        delete dataToSave.gecerlilikTarihi;
    }
    if (sozlesme.tip !== 'kira') {
        delete dataToSave.bitisTarihi;
    }

    onSave(mevcutSozlesme ? { ...dataToSave, id: mevcutSozlesme.id } : dataToSave);
  };
  
  const getVarlikAdi = (varlik: Varlik) => varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
  const labelClasses = "block text-sm font-medium text-slate-700";

  return (
    <PageOverlay
      title={mevcutSozlesme ? 'Sözleşme Düzenle' : 'Yeni Sözleşme Oluştur'}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">İptal</button>
          <button type="submit" form="sozlesme-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
        </>
      }
    >
      <form id="sozlesme-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <label className={labelClasses}>Sözleşme Başlığı</label>
            <input type="text" name="baslik" value={sozlesme.baslik} onChange={handleInputChange} className={`w-full p-2 border rounded-md mt-1 ${errors.baslik ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`} required/>
            {errors.baslik && <p className="text-xs text-red-600 mt-1">{errors.baslik}</p>}
          </div>
          
          <div><label className={labelClasses}>Sözleşme Tipi</label><select name="tip" value={sozlesme.tip} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option value="satis">Satış</option><option value="kira">Kira</option><option value="diger">Diğer</option></select></div>
          <div>
            <label className={labelClasses}>Taraf (Müşteri/Firma)</label>
             <div className={errors.varlikId ? 'border border-red-500 rounded-md ring-1 ring-red-500' : ''}>
                <SearchableSelect
                    options={varliklar.map(v => ({ value: v.id, label: getVarlikAdi(v) }))}
                    selectedValues={sozlesme.varlikId ? [sozlesme.varlikId] : []}
                    onChange={(selected) => handleInputChange({ target: { name: 'varlikId', value: String(selected[0] || 0) } } as any)}
                    placeholder="Taraf Seçin..."
                />
             </div>
             {errors.varlikId && <p className="text-xs text-red-600 mt-1">{errors.varlikId}</p>}
          </div>
          <div><label className={labelClasses}>Proje (Opsiyonel)</label><select name="projeId" value={sozlesme.projeId || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option value="">Proje Yok</option>{projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}</select></div>

          <div><label className={labelClasses}>Emlak (Opsiyonel)</label><select name="emlakId" value={sozlesme.emlakId || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option value="">Emlak Yok</option>{uygunEmlaklar.map(e => <option key={e.id} value={e.id}>{`${e.blok} Blok - Kat ${e.kat} - No ${e.daireNo}`}</option>)}</select></div>
          <div><label className={labelClasses}>Sözleşme Tarihi</label><DatePickerInput value={sozlesme.sozlesmeTarihi} onChange={date => setSozlesme(s => ({...s, sozlesmeTarihi: date}))} /></div>
          {sozlesme.tip === 'kira' && <div><label className={labelClasses}>Sözleşme Bitiş Tarihi</label><DatePickerInput value={sozlesme.bitisTarihi || ''} onChange={date => setSozlesme(s => ({...s, bitisTarihi: date}))} /></div>}

          <div><label className={labelClasses}>Toplam Tutar</label><input type="number" name="toplamTutar" value={sozlesme.toplamTutar} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
          <div>
            <label className={labelClasses}>Para Birimi</label>
            <select name="paraBirimi" value={sozlesme.paraBirimi} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required>
                {ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod} - {p.sembol}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Ödeme Tipi</label>
            <select name="odemeTipi" value={sozlesme.odemeTipi} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required>
              {ayarlar.odemeTipleri.map(tip => <option key={tip} value={tip}>{tip}</option>)}
            </select>
          </div>
          
          <div><label className={labelClasses}>Durum</label><select name="durum" value={sozlesme.durum} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option>Taslak</option><option>Aktif</option><option>Tamamlandı</option><option>İptal Edildi</option></select></div>
          
          {sozlesme.tip === 'diger' && (
              <div className="flex flex-col justify-center">
                  <label className="flex items-center mt-2 text-slate-800">
                      <input type="checkbox" checked={gecerlilikVar} onChange={e => setGecerlilikVar(e.target.checked)} className="mr-2 h-4 w-4" />
                      Geçerlilik tarihi var mı?
                  </label>
                  {gecerlilikVar && <div className='mt-1'><DatePickerInput value={sozlesme.gecerlilikTarihi || ''} onChange={date => setSozlesme(s => ({...s, gecerlilikTarihi: date}))} /></div>}
              </div>
          )}
        </div>
        <div>
          <label className={labelClasses}>İçerik</label>
          <RichTextEditor value={sozlesme.icerik} onChange={content => setSozlesme(s => ({...s, icerik: content}))} />
        </div>
        <div>
            <label className={labelClasses}>Ek Dosya (Opsiyonel)</label>
            <div className="mt-1 flex items-center gap-4"><button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-sm font-semibold rounded-md"><PaperClipIcon/> {sozlesme.ekDosya ? 'Dosya Değiştir' : 'Dosya Seç'}</button>{sozlesme.ekDosya && <span className="text-sm text-slate-600">{sozlesme.ekDosya.ad}</span>}<input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /></div>
        </div>
      </form>
    </PageOverlay>
  );
};

export default SozlesmeEkleModal;