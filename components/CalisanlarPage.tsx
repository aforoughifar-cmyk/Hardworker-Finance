import React, { useState, useMemo } from 'react';
import { Calisan, Pozisyon, Ayarlar } from '../types';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon } from './icons/AppIcons';
import CalisanEkleModal from './CalisanEkleModal';

interface CalisanlarPageProps {
  calisanlar: Calisan[];
  pozisyonlar: Pozisyon[];
  ayarlar: Ayarlar;
  onSave: (calisan: Omit<Calisan, 'id'> | Calisan) => void;
  onDelete: (id: number) => void;
  onCalisanSec: (calisan: Calisan) => void;
}

const CalisanlarPage: React.FC<CalisanlarPageProps> = ({ calisanlar, pozisyonlar, ayarlar, onSave, onDelete, onCalisanSec }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenCalisan, setDuzenlenenCalisan] = useState<Calisan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const pozisyonMap = useMemo(() => new Map(pozisyonlar.map(p => [p.id, p.ad])), [pozisyonlar]);

  const handleYeniEkle = () => {
    setDuzenlenenCalisan(null);
    setModalAcik(true);
  };

  const handleDuzenle = (calisan: Calisan) => {
    setDuzenlenenCalisan(calisan);
    setModalAcik(true);
  };

  const handleSave = (calisan: Omit<Calisan, 'id'> | Calisan) => {
    onSave(calisan);
    setModalAcik(false);
  };

  const filtrelenmisCalisanlar = useMemo(() => {
    return calisanlar.filter(c => 
      `${c.isim} ${c.soyisim}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [calisanlar, searchTerm]);

  return (
    <div className="w-full page-container">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Çalışanlar</h1>
        <p className="text-slate-500 mt-2 text-lg">Şirket personelini yönetin.</p>
      </header>

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input type="text" placeholder="Çalışan ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg"/>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          </div>
          <button onClick={handleYeniEkle} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Çalışan</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">İsim Soyisim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pozisyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
                <th className="relative px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtrelenmisCalisanlar.map(calisan => (
                <tr key={calisan.id} onClick={() => onCalisanSec(calisan)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{calisan.isim} {calisan.soyisim}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{pozisyonMap.get(calisan.pozisyonId) || 'Bilinmiyor'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{calisan.telefon}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${calisan.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {calisan.aktif ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); handleDuzenle(calisan); }} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(calisan.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modalAcik && (
        <CalisanEkleModal
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutCalisan={duzenlenenCalisan}
          pozisyonlar={pozisyonlar}
          ayarlar={ayarlar}
        />
      )}
    </div>
  );
};

export default CalisanlarPage;