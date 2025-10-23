import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { Proje } from '../types';
import ProjeListesi from './ProjeListesi';
import ProjeEkleModal from './ProjeEkleModal';
import PlusIcon from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';
import ReportHeader from './ReportHeader';
import ConfirmationModal from './ConfirmationModal';

interface ProjePageProps {
  projeler: Proje[];
  onSave: (proje: Omit<Proje, 'id'> | Proje) => void;
  onDelete: (id: number) => void;
  onProjeSec: (proje: Proje) => void;
}

const ProjePage: React.FC<ProjePageProps> = ({ projeler, onSave, onDelete, onProjeSec }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenProje, setDuzenlenenProje] = useState<Proje | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const handleDuzenle = (proje: Proje) => {
    setDuzenlenenProje(proje);
    setModalAcik(true);
  };

  const handleYeniEkle = () => {
    setDuzenlenenProje(null);
    setModalAcik(true);
  };

  const handleSave = (proje: Omit<Proje, 'id'> | Proje) => {
    onSave(proje);
    setModalAcik(false);
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id) {
      onDelete(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const filtrelenmisProjeler = useMemo(() => {
    return projeler.filter(proje =>
      proje.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proje.aciklama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projeler, searchTerm]);
  
  const reportStats = useMemo(() => {
    const ortalamaIlerleme = projeler.length > 0
        ? Math.round(projeler.reduce((acc, p) => acc + p.ilerlemeYuzdesi, 0) / projeler.length)
        : 0;
    return [
        { label: 'Toplam Proje', value: projeler.length, colorClass: 'border-purple-500' },
        { label: 'Ortalama İlerleme', value: `${ortalamaIlerleme}%`, colorClass: 'border-indigo-500' },
    ];
  }, [projeler]);


  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Projeler</h1>
        <p className="text-slate-500 mt-2 text-lg">Tüm projelerinizi buradan yönetin.</p>
      </header>

      <ReportHeader stats={reportStats} />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
          <button
            onClick={handleYeniEkle}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <PlusIcon />
            <span>Yeni Proje</span>
          </button>
        </div>

        <ProjeListesi
          projeler={filtrelenmisProjeler}
          onDelete={handleDeleteRequest}
          onEdit={handleDuzenle}
          onRowClick={onProjeSec}
        />
      </main>

      {modalAcik && (
        <ProjeEkleModal
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutProje={duzenlenenProje}
        />
      )}

      {deleteConfirm.isOpen && (
        <ConfirmationModal 
            onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
            onConfirm={handleDeleteConfirm}
            title="Projeyi Sil"
            message="Bu projeyi silmek istediğinizden emin misiniz? İlişkili tüm veriler etkilenebilir."
        />
      )}
    </div>
  );
};

export default ProjePage;