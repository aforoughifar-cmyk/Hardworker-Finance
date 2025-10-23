import React, { useState, useMemo } from 'react';
import { Emlak, Proje } from '../types';
import EmlakListesi from './EmlakListesi';
import EmlakEkleModal from './EmlakEkleModal';
import { PlusIcon, SearchIcon } from './icons/AppIcons';
import ReportHeader from './ReportHeader';

interface EmlakPageProps {
  emlaklar: Emlak[];
  projeler: Proje[];
  onSave: (emlak: Omit<Emlak, 'id'> | Emlak) => void;
  onDelete: (id: number) => void;
  onEmlakSec: (emlak: Emlak) => void;
}

const EmlakPage: React.FC<EmlakPageProps> = ({ emlaklar, projeler, onSave, onDelete, onEmlakSec }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenEmlak, setDuzenlenenEmlak] = useState<Emlak | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projeFiltresi, setProjeFiltresi] = useState<number | ''>('');

  const handleYeniEkle = () => {
    setDuzenlenenEmlak(null);
    setModalAcik(true);
  };

  const handleDuzenle = (emlak: Emlak) => {
    setDuzenlenenEmlak(emlak);
    setModalAcik(true);
  };
  
  const handleSave = (emlak: Omit<Emlak, 'id'> | Emlak) => {
    onSave(emlak);
    setModalAcik(false);
  };

  const filtrelenmisEmlaklar = useMemo(() => {
    return emlaklar
      .filter(emlak => projeFiltresi === '' || emlak.projeId === projeFiltresi)
      .filter(emlak => {
        const aramaMetni = `${emlak.blok} ${emlak.kat} ${emlak.daireNo} ${emlak.aciklama}`.toLowerCase();
        return aramaMetni.includes(searchTerm.toLowerCase());
      });
  }, [emlaklar, searchTerm, projeFiltresi]);

  const reportStats = useMemo(() => [
    { label: 'Toplam Birim', value: emlaklar.length, colorClass: 'border-slate-500' },
    { label: 'Satılık', value: emlaklar.filter(e => e.durum === 'satilik').length, colorClass: 'border-emerald-500' },
    { label: 'Kiralık', value: emlaklar.filter(e => e.durum === 'kiralik').length, colorClass: 'border-sky-500' },
    { label: 'Satıldı', value: emlaklar.filter(e => e.durum === 'satildi').length, colorClass: 'border-indigo-500' },
    { label: 'Kiralandı', value: emlaklar.filter(e => e.durum === 'kiralandi').length, colorClass: 'border-purple-500' },
  ], [emlaklar]);

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Emlak Yönetimi</h1>
        <p className="text-slate-500 mt-2 text-lg">Projelere ait emlak birimlerini yönetin.</p>
      </header>

      <ReportHeader stats={reportStats} />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <input type="text" placeholder="Ara (Blok, Kat...)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg"/>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            </div>
            <select value={projeFiltresi} onChange={e => setProjeFiltresi(e.target.value ? Number(e.target.value) : '')} className="p-2 border rounded-lg">
              <option value="">Tüm Projeler</option>
              {projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
            </select>
          </div>
          <button onClick={handleYeniEkle} className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Emlak</span>
          </button>
        </div>

        <EmlakListesi 
          emlaklar={filtrelenmisEmlaklar}
          projeler={projeler}
          onDelete={onDelete}
          onEdit={handleDuzenle}
          onRowClick={onEmlakSec}
        />
      </main>

      {modalAcik && (
        <EmlakEkleModal 
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutEmlak={duzenlenenEmlak}
          projeler={projeler}
        />
      )}
    </div>
  );
};

export default EmlakPage;
