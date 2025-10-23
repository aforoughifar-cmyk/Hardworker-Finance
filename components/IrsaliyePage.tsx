import React, { useState, useMemo } from 'react';
import { Irsaliye, Varlik, Proje, Ayarlar, Fatura } from '../types';
import IrsaliyeListesi from './IrsaliyeListesi';
import IrsaliyeEkleModal from './IrsaliyeEkleModal';
import FaturaForm from './FaturaForm';
import FileViewerModal from './FileViewerModal';
import PlusIcon from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';
import ReportHeader from './ReportHeader';
import ConfirmationModal from './ConfirmationModal';

interface IrsaliyePageProps {
  irsaliyeler: Irsaliye[];
  varliklar: Varlik[];
  projeler: Proje[];
  ayarlar: Ayarlar;
  onSave: (irsaliye: Omit<Irsaliye, 'id'> | Irsaliye) => void;
  onDelete: (id: number) => void;
  onFaturaSave: (fatura: Omit<Fatura, 'id'> | Fatura, irsaliyeId?: number) => void;
  onDurumGuncelle: (id: number, yeniDurum: string) => void;
}

const IrsaliyePage: React.FC<IrsaliyePageProps> = ({ irsaliyeler, varliklar, projeler, ayarlar, onSave, onDelete, onFaturaSave, onDurumGuncelle }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [faturaFormAcik, setFaturaFormAcik] = useState(false);
  const [duzenlenenIrsaliye, setDuzenlenenIrsaliye] = useState<Irsaliye | null>(null);
  const [faturalanacakIrsaliye, setFaturalanacakIrsaliye] = useState<Irsaliye | null>(null);
  const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<{ veri: string; tip: string; } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const handleYeniEkle = () => {
    setDuzenlenenIrsaliye(null);
    setModalAcik(true);
  };

  const handleDuzenle = (irsaliye: Irsaliye) => {
    setDuzenlenenIrsaliye(irsaliye);
    setModalAcik(true);
  };
  
  const handleSave = (irsaliye: Omit<Irsaliye, 'id'> | Irsaliye) => {
    onSave(irsaliye);
    setModalAcik(false);
  };
  
  const handleFaturaEt = (irsaliye: Irsaliye) => {
    setFaturalanacakIrsaliye(irsaliye);
    setFaturaFormAcik(true);
  };
  
  const handleFaturaKaydet = (fatura: Omit<Fatura, 'id'> | Fatura, irsaliyeId?: number) => {
    onFaturaSave(fatura, irsaliyeId);
    setFaturaFormAcik(false);
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

  const filtrelenmisIrsaliyeler = useMemo(() => {
    const varlikMap = new Map(varliklar.map(v => v.type === 'firma' ? [v.id, v.sirketAdi] : null).filter(Boolean) as [number, string][]);
    return irsaliyeler.filter(i => {
      const varlikAdi = varlikMap.get(i.varlikId)?.toLowerCase() || '';
      return varlikAdi.includes(searchTerm.toLowerCase()) || (i.aciklama && i.aciklama.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [irsaliyeler, varliklar, searchTerm]);

  const reportStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    ayarlar.irsaliyeDurumlari.forEach(durum => stats[durum] = 0);
    stats['Faturalandı'] = 0;

    irsaliyeler.forEach(i => {
      if(i.faturaId) {
        stats['Faturalandı']++;
      } else if (stats[i.durum] !== undefined) {
        stats[i.durum]++;
      }
    });
    
    return [
      { label: 'Toplam İrsaliye', value: irsaliyeler.length, colorClass: 'border-slate-500' },
      ...Object.entries(stats).map(([label, value]) => ({
        label,
        value,
        colorClass: label === 'Faturalandı' ? 'border-blue-500' : 'border-gray-400'
      }))
    ];
  }, [irsaliyeler, ayarlar.irsaliyeDurumlari]);

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">İrsaliyeler</h1>
        <p className="text-slate-500 mt-2 text-lg">Mal ve hizmet sevklerinizi yönetin.</p>
      </header>
      
      <ReportHeader stats={reportStats} />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
            <div className="relative">
                <input type="text" placeholder="Ara (Firma, Açıklama...)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            </div>
            <button onClick={handleYeniEkle} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                <PlusIcon />
                <span>Yeni İrsaliye</span>
            </button>
        </div>
        <IrsaliyeListesi 
            irsaliyeler={filtrelenmisIrsaliyeler}
            varliklar={varliklar}
            ayarlar={ayarlar}
            onEdit={handleDuzenle}
            onDelete={handleDeleteRequest}
            onFaturaEt={handleFaturaEt}
            onDosyaGoruntule={setGoruntulenecekDosya}
            onDurumGuncelle={onDurumGuncelle}
        />
      </main>

      {modalAcik && (
        <IrsaliyeEkleModal 
            onClose={() => setModalAcik(false)}
            onSave={handleSave}
            mevcutIrsaliye={duzenlenenIrsaliye}
            varliklar={varliklar}
            projeler={projeler}
            ayarlar={ayarlar}
        />
      )}
      
      {faturaFormAcik && faturalanacakIrsaliye && (
        <FaturaForm
          onClose={() => setFaturaFormAcik(false)}
          onSave={handleFaturaKaydet}
          mevcutFatura={null}
          mevcutIrsaliye={faturalanacakIrsaliye}
          varliklar={varliklar}
          projeler={projeler}
          ayarlar={ayarlar}
        />
      )}

      {goruntulenecekDosya && (
        <FileViewerModal 
            fileUrl={goruntulenecekDosya.veri}
            fileType={goruntulenecekDosya.tip}
            onClose={() => setGoruntulenecekDosya(null)}
        />
      )}

      {deleteConfirm.isOpen && (
        <ConfirmationModal
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={handleDeleteConfirm}
          title="İrsaliyeyi Sil"
          message="Bu irsaliyeyi silmek istediğinizden emin misiniz?"
        />
      )}
    </div>
  );
};

export default IrsaliyePage;