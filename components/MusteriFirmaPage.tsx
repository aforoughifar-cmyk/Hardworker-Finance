import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { Varlik } from '../types';
import VarlikListesi from './VarlikListesi';
import VarlikEkleModal from './VarlikEkleModal';
import PlusIcon from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';
import ReportHeader from './ReportHeader';
import ConfirmationModal from './ConfirmationModal';

interface MusteriFirmaPageProps {
  varliklar: Varlik[];
  onSave: (varlik: Omit<Varlik, 'id'> | Varlik) => void;
  onDelete: (id: number) => void;
  onVarlikSec: (varlik: Varlik) => void;
}

const MusteriFirmaPage: React.FC<MusteriFirmaPageProps> = ({ varliklar, onSave, onDelete, onVarlikSec }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenVarlik, setDuzenlenenVarlik] = useState<Varlik | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'musteri' | 'firma'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const handleDuzenle = (varlik: Varlik) => {
    setDuzenlenenVarlik(varlik);
    setModalAcik(true);
  };

  const handleYeniEkle = () => {
    setDuzenlenenVarlik(null);
    setModalAcik(true);
  };
  
  const handleSave = (varlik: Omit<Varlik, 'id'> | Varlik) => {
    onSave(varlik);
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

  const filtrelenmisVarliklar = useMemo(() => {
    return varliklar
      .filter(varlik => {
        if (filterType === 'all') return true;
        return varlik.type === filterType;
      })
      .filter(varlik => {
        const ad = varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
        const email = varlik.type === 'musteri' ? varlik.email : varlik.sirketEmail;
        const telefon = varlik.type === 'musteri' ? varlik.telefon : varlik.sirketTelefon;
        return (
          ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          telefon.includes(searchTerm)
        );
      });
  }, [varliklar, searchTerm, filterType]);

  const reportStats = useMemo(() => [
    { label: 'Toplam Varlık', value: varliklar.length, colorClass: 'border-slate-500' },
    { label: 'Müşteri Sayısı', value: varliklar.filter(v => v.type === 'musteri').length, colorClass: 'border-sky-500' },
    { label: 'Firma Sayısı', value: varliklar.filter(v => v.type === 'firma').length, colorClass: 'border-emerald-500' },
  ], [varliklar]);


  return (
    <div className="w-full">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Müşteriler & Firmalar</h1>
            <p className="text-slate-500 mt-2 text-lg">Tüm müşteri ve firma kayıtlarınızı yönetin.</p>
        </header>
        
        <ReportHeader stats={reportStats} />

        <main className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Ara (İsim, E-posta, Telefon...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="p-2 border border-slate-300 rounded-lg">
                        <option value="all">Tümü</option>
                        <option value="musteri">Müşteriler</option>
                        <option value="firma">Firmalar</option>
                    </select>
                     <button
                        onClick={handleYeniEkle}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                    >
                        <PlusIcon />
                        <span>Yeni Ekle</span>
                    </button>
                </div>
            </div>

            <VarlikListesi 
                varliklar={filtrelenmisVarliklar}
                onDelete={handleDeleteRequest}
                onEdit={handleDuzenle}
                onRowClick={onVarlikSec}
            />
        </main>
        
        {modalAcik && (
            <VarlikEkleModal 
                onClose={() => setModalAcik(false)}
                onSave={handleSave}
                mevcutVarlik={duzenlenenVarlik}
            />
        )}

        {deleteConfirm.isOpen && (
            <ConfirmationModal 
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                onConfirm={handleDeleteConfirm}
                title="Varlığı Sil"
                message="Bu müşteri veya firmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
            />
        )}
    </div>
  );
};

export default MusteriFirmaPage;