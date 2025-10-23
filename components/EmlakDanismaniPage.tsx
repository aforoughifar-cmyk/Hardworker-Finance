import React, { useState, useMemo } from 'react';
import { EmlakDanismani } from '../types';
import EmlakDanismaniListesi from './EmlakDanismaniListesi';
import EmlakDanismaniEkleModal from './EmlakDanismaniEkleModal';
import { PlusIcon, SearchIcon } from './icons/AppIcons';
import ReportHeader from './ReportHeader';

interface EmlakDanismaniPageProps {
  danismanlar: EmlakDanismani[];
  onSave: (danisman: Omit<EmlakDanismani, 'id'> | EmlakDanismani) => void;
  onDelete: (id: number) => void;
  onDanismanSec: (danisman: EmlakDanismani) => void;
}

const EmlakDanismaniPage: React.FC<EmlakDanismaniPageProps> = ({ danismanlar, onSave, onDelete, onDanismanSec }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenDanisman, setDuzenlenenDanisman] = useState<EmlakDanismani | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'kisi' | 'sirket'>('all');

  const handleYeniEkle = () => {
    setDuzenlenenDanisman(null);
    setModalAcik(true);
  };
  
  const handleDuzenle = (danisman: EmlakDanismani) => {
    setDuzenlenenDanisman(danisman);
    setModalAcik(true);
  };

  const handleSave = (danisman: Omit<EmlakDanismani, 'id'> | EmlakDanismani) => {
    onSave(danisman);
    setModalAcik(false);
  };

  const filtrelenmisDanismanlar = useMemo(() => {
    return danismanlar
      .filter(d => filterType === 'all' || d.type === filterType)
      .filter(d => {
        const ad = d.type === 'kisi' ? `${d.isim} ${d.soyisim}` : d.sirketAdi;
        const email = d.type === 'kisi' ? d.email : '';
        return ad.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [danismanlar, searchTerm, filterType]);

  const reportStats = useMemo(() => [
    { label: 'Toplam Danışman', value: danismanlar.length, colorClass: 'border-slate-500' },
    { label: 'Kişisel Danışman', value: danismanlar.filter(d => d.type === 'kisi').length, colorClass: 'border-sky-500' },
    { label: 'Danışman Şirket', value: danismanlar.filter(d => d.type === 'sirket').length, colorClass: 'border-emerald-500' },
  ], [danismanlar]);

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Emlak Danışmanları</h1>
        <p className="text-slate-500 mt-2 text-lg">Kişisel ve kurumsal emlak danışmanlarınızı yönetin.</p>
      </header>

      <ReportHeader stats={reportStats} />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Ara (İsim, Şirket...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          </div>
          <div className="flex items-center gap-2">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="p-2 border rounded-lg">
              <option value="all">Tümü</option>
              <option value="kisi">Kişi</option>
              <option value="sirket">Şirket</option>
            </select>
            <button onClick={handleYeniEkle} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
              <PlusIcon />
              <span>Yeni Ekle</span>
            </button>
          </div>
        </div>
        <EmlakDanismaniListesi
          danismanlar={filtrelenmisDanismanlar}
          onEdit={handleDuzenle}
          onDelete={onDelete}
          onRowClick={onDanismanSec}
        />
      </main>

      {modalAcik && (
        <EmlakDanismaniEkleModal
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutDanisman={duzenlenenDanisman}
        />
      )}
    </div>
  );
};

export default EmlakDanismaniPage;