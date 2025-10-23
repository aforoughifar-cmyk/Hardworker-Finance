import React, { useState, useMemo } from 'react';
import { Teklif, Varlik, Proje, Ayarlar } from '../types';
import TeklifListesi from './TeklifListesi';
import TeklifEkleModal from './TeklifEkleModal';
import TeklifDetayModal from './TeklifDetayModal'; // Import the new modal
import FileViewerModal from './FileViewerModal';
import { PlusIcon, SearchIcon } from './icons/AppIcons';
import ReportHeader from './ReportHeader';
import ConfirmationModal from './ConfirmationModal';

interface TeklifPageProps {
  teklifler: Teklif[];
  varliklar: Varlik[];
  projeler: Proje[];
  ayarlar: Ayarlar;
  onSave: (teklif: Omit<Teklif, 'id'> | Teklif) => void;
  onDelete: (id: number) => void;
}

const TeklifPage: React.FC<TeklifPageProps> = ({ teklifler, varliklar, projeler, ayarlar, onSave, onDelete }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenTeklif, setDuzenlenenTeklif] = useState<Teklif | null>(null);
  const [detayAcik, setDetayAcik] = useState<Teklif | null>(null); // State for detail modal
  const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<{ veri: string; tip: string; } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const handleYeniEkle = () => {
    setDuzenlenenTeklif(null);
    setModalAcik(true);
  };
  
  const handleDuzenle = (teklif: Teklif) => {
    setDuzenlenenTeklif(teklif);
    setModalAcik(true);
  };

  const handleSave = (teklif: Omit<Teklif, 'id'> | Teklif) => {
    onSave(teklif);
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
  
  const handleDurumGuncelle = (teklifId: number, yeniDurum: string) => {
    const teklif = teklifler.find(t => t.id === teklifId);
    if (teklif) {
      onSave({ ...teklif, durum: yeniDurum });
    }
  };

  const filtrelenmisTeklifler = useMemo(() => {
    const varlikMap = new Map(varliklar.map(v => v.type === 'firma' ? [v.id, v.sirketAdi] : null).filter(Boolean) as [number, string][]);
    return teklifler.filter(t => {
      const varlikAdi = varlikMap.get(t.varlikId)?.toLowerCase() || '';
      return varlikAdi.includes(searchTerm.toLowerCase()) || t.konu.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [teklifler, varliklar, searchTerm]);
  
  const reportStats = useMemo(() => {
    const colorMap: { [key: string]: string } = {
      'Değerlendiriliyor': 'border-yellow-500',
      'Kabul Edildi': 'border-green-500',
      'Reddedildi': 'border-red-500',
      'İptal': 'border-gray-400'
    };
    const stats = ayarlar.teklifDurumlari.map(durum => ({
      label: durum,
      value: teklifler.filter(t => t.durum === durum).length,
      colorClass: colorMap[durum] || 'border-slate-500'
    }));
    stats.unshift({ label: 'Toplam Teklif', value: teklifler.length, colorClass: 'border-blue-500' });
    return stats;
  }, [teklifler, ayarlar.teklifDurumlari]);


  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Teklifler</h1>
        <p className="text-slate-500 mt-2 text-lg">Müşterilerinize sunduğunuz teklifleri yönetin.</p>
      </header>
      
      <ReportHeader stats={reportStats} />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input type="text" placeholder="Ara (Firma, Konu...)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg"/>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          </div>
          <button onClick={handleYeniEkle} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Teklif</span>
          </button>
        </div>
        <TeklifListesi 
            teklifler={filtrelenmisTeklifler}
            varliklar={varliklar}
            ayarlar={ayarlar}
            onEdit={handleDuzenle}
            onDelete={handleDeleteRequest}
            onDurumGuncelle={handleDurumGuncelle}
            onDosyaGoruntule={setGoruntulenecekDosya}
            onRowClick={setDetayAcik} // Pass the row click handler
        />
      </main>

      {modalAcik && (
        <TeklifEkleModal 
            onClose={() => setModalAcik(false)}
            onSave={handleSave}
            mevcutTeklif={duzenlenenTeklif}
            varliklar={varliklar}
            projeler={projeler}
            ayarlar={ayarlar}
        />
      )}
      
      {detayAcik && (
        <TeklifDetayModal
            teklif={detayAcik}
            varlik={varliklar.find(v => v.id === detayAcik.varlikId)}
            proje={projeler.find(p => p.id === detayAcik.projeId)}
            ayarlar={ayarlar}
            onClose={() => setDetayAcik(null)}
            onDosyaGoruntule={(dosya) => {
                setGoruntulenecekDosya(dosya);
                setDetayAcik(null); // Close detail modal to show file viewer
            }}
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
          title="Teklifi Sil"
          message="Bu teklifi silmek istediğinizden emin misiniz?"
        />
      )}
    </div>
  );
};

export default TeklifPage;