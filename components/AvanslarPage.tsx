import React, { useState, useMemo } from 'react';
import { Avans, Calisan, Ayarlar, HrmMaas } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons/AppIcons';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';

interface AvansEkleModalProps {
    onClose: () => void;
    onSave: (avans: Omit<Avans, 'id'> | Avans) => void;
    mevcutAvans: Avans | null;
    calisanlar: Calisan[];
    ayarlar: Ayarlar;
}

const AvansEkleModal: React.FC<AvansEkleModalProps> = ({ onClose, onSave, mevcutAvans, calisanlar, ayarlar }) => {
    const [avans, setAvans] = useState<Omit<Avans, 'id'>>({
        calisanId: mevcutAvans?.calisanId || 0,
        tutar: mevcutAvans?.tutar || 0,
        paraBirimi: mevcutAvans?.paraBirimi || ayarlar.paraBirimleri[0].kod,
        tarih: mevcutAvans?.tarih || new Date().toISOString().split('T')[0],
        aciklama: mevcutAvans?.aciklama || '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        const isNumber = ['calisanId', 'tutar'].includes(name);
        setAvans(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };
    
    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!avans.calisanId) newErrors.calisanId = "Çalışan seçimi zorunludur.";
        if (avans.tutar <= 0) newErrors.tutar = "Tutar 0'dan büyük olmalıdır.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(validate()) {
            onSave(mevcutAvans ? { ...avans, id: mevcutAvans.id } : avans);
        }
    };

    const labelClasses = "block text-sm font-medium text-slate-700 mb-1";
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1";

    return (
        <PageOverlay
            title={mevcutAvans ? 'Avans Düzenle' : 'Yeni Avans Ekle'}
            onClose={onClose}
            footer={<>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">İptal</button>
                <button type="submit" form="avans-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
            </>}
        >
             <form id="avans-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Çalışan</label>
                        <select name="calisanId" value={avans.calisanId} onChange={handleChange} className={`${inputClasses} ${errors.calisanId ? 'border-red-500' : ''}`} required>
                            <option value={0} disabled>Seçiniz...</option>
                            {calisanlar.filter(c=>c.aktif).map(c => <option key={c.id} value={c.id}>{c.isim} {c.soyisim}</option>)}
                        </select>
                         {errors.calisanId && <p className="text-xs text-red-600 mt-1">{errors.calisanId}</p>}
                    </div>
                     <div>
                        <label className={labelClasses}>Tarih</label>
                        <DatePickerInput value={avans.tarih} onChange={date => setAvans(a => ({...a, tarih: date}))}/>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <label className={labelClasses}>Tutar</label>
                            <input type="number" name="tutar" value={avans.tutar} onChange={handleChange} className={`${inputClasses} ${errors.tutar ? 'border-red-500' : ''}`} required/>
                            {errors.tutar && <p className="text-xs text-red-600 mt-1">{errors.tutar}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>Para Birimi</label>
                            <select name="paraBirimi" value={avans.paraBirimi} onChange={handleChange} className="p-2 border rounded-md mt-1 bg-white">
                                {ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                 <div>
                    <label className={labelClasses}>Açıklama</label>
                    <textarea name="aciklama" value={avans.aciklama} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md mt-1"></textarea>
                </div>
            </form>
        </PageOverlay>
    );
};


interface AvanslarPageProps {
  avanslar: Avans[];
  calisanlar: Calisan[];
  ayarlar: Ayarlar;
  maaslar: HrmMaas[];
  onSave: (avans: Omit<Avans, 'id'> | Avans) => void;
  onDelete: (id: number) => void;
}

const AvanslarPage: React.FC<AvanslarPageProps> = ({ avanslar, calisanlar, ayarlar, maaslar, onSave, onDelete }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Avans | null>(null);

  const calisanMap = useMemo(() => new Map(calisanlar.map(c => [c.id, `${c.isim} ${c.soyisim}`])), [calisanlar]);
  
  const avansOzeti = useMemo(() => {
    const ozetMap = new Map<number, { calisan: Calisan, toplamAlinan: number, toplamOdenen: number, kalanBakiye: number }>();

    calisanlar.forEach(calisan => {
        const alinan = avanslar
            .filter(a => a.calisanId === calisan.id)
            .reduce((sum, a) => sum + a.tutar, 0);

        const odenen = maaslar
            .filter(m => m.calisanId === calisan.id)
            .reduce((sum, m) => sum + m.kesilenAvans, 0);
        
        if (alinan > 0) {
            ozetMap.set(calisan.id, {
                calisan,
                toplamAlinan: alinan,
                toplamOdenen: odenen,
                kalanBakiye: alinan - odenen
            });
        }
    });

    return Array.from(ozetMap.values());
  }, [avanslar, calisanlar, maaslar]);


  const handleSave = (avans: Omit<Avans, 'id'> | Avans) => {
    onSave(avans);
    setModalAcik(false);
  };
  
  const handleEdit = (avans: Avans) => {
    setDuzenlenen(avans);
    setModalAcik(true);
  };
  
  const handleNew = () => {
    setDuzenlenen(null);
    setModalAcik(true);
  };

  return (
    <div className="w-full page-container">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Avanslar</h1>
        <p className="text-slate-500 mt-2 text-lg">Çalışanlara verilen avansları (maaş ön ödemeleri) yönetin.</p>
      </header>
      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-end mb-6">
          <button onClick={handleNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Avans Ekle</span>
          </button>
        </div>
        
        <h3 className="text-xl font-bold text-slate-700 mb-4">Avans Bakiye Özeti</h3>
        <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-slate-200 border rounded-lg">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Çalışan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Toplam Alınan Avans</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Toplam Geri Ödenen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kalan Bakiye</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                {avansOzeti.map(item => (
                    <tr key={item.calisan.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.calisan.isim} {item.calisan.soyisim}</td>
                    <td className="px-6 py-4 text-blue-600">{item.toplamAlinan.toFixed(2)}</td>
                    <td className="px-6 py-4 text-green-600">{item.toplamOdenen.toFixed(2)}</td>
                    <td className={`px-6 py-4 font-semibold ${item.kalanBakiye > 0 ? 'text-red-600' : 'text-slate-800'}`}>{item.kalanBakiye.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            {avansOzeti.length === 0 && <p className="text-center py-12 text-slate-500">Avans kullanan çalışan bulunmamaktadır.</p>}
        </div>

        <h3 className="text-xl font-bold text-slate-700 mb-4 border-t pt-6">Avans İşlem Detayları</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Çalışan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Açıklama</th>
                <th className="relative px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {avanslar.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{calisanMap.get(a.calisanId) || 'Bilinmiyor'}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(a.tarih).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{a.tutar.toFixed(2)} {a.paraBirimi}</td>
                  <td className="px-6 py-4 text-slate-500">{a.aciklama}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(a)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                    <button onClick={() => onDelete(a.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {avanslar.length === 0 && <p className="text-center py-12 text-slate-500">Henüz avans kaydı yok.</p>}
        </div>
      </main>
      {modalAcik && (
        <AvansEkleModal
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutAvans={duzenlenen}
          calisanlar={calisanlar}
          ayarlar={ayarlar}
        />
      )}
    </div>
  );
};

export default AvanslarPage;