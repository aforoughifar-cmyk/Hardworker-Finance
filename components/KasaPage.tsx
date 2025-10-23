import React, { useState, useEffect } from 'react';
import { KasaHesap, KasaIslem, Ayarlar } from '../types';
import KasaHesaplariListesi from './KasaHesaplariListesi';
import KasaIslemListesi from './KasaIslemListesi';
import HesapEkleModal from './HesapEkleModal';
import IslemEkleModal from './IslemEkleModal';
import PlusIcon from './icons/PlusIcon';
import FileViewerModal from './FileViewerModal';
import ConfirmationModal from './ConfirmationModal';

interface KasaPageProps {
  hesaplar: KasaHesap[];
  islemler: KasaIslem[];
  ayarlar: Ayarlar;
  onHesapSave: (hesap: Omit<KasaHesap, 'id' | 'bakiye'> | KasaHesap) => void;
  onIslemSave: (islem: Omit<KasaIslem, 'id'> | KasaIslem) => void;
  onHesapDelete: (id: number) => void;
  onIslemDelete: (id: number) => void;
}

const KasaPage: React.FC<KasaPageProps> = ({ hesaplar, islemler, ayarlar, onHesapSave, onIslemSave, onHesapDelete, onIslemDelete }) => {
  const [hesapModalAcik, setHesapModalAcik] = useState(false);
  const [islemModalAcik, setIslemModalAcik] = useState(false);
  const [seciliHesap, setSeciliHesap] = useState<KasaHesap | null>(hesaplar[0] || null);
  const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<{ veri: string; tip: string; } | null>(null);

  const [duzenlenenHesap, setDuzenlenenHesap] = useState<KasaHesap | null>(null);
  const [duzenlenenIslem, setDuzenlenenIslem] = useState<KasaIslem | null>(null);
  
  const [hesapDeleteConfirm, setHesapDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
  const [islemDeleteConfirm, setIslemDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  useEffect(() => {
    // If the selected account is deleted, select the first one in the list or null
    if (seciliHesap && !hesaplar.some(h => h.id === seciliHesap.id)) {
      setSeciliHesap(hesaplar[0] || null);
    }
    // If no account is selected and there are accounts, select the first one
    if (!seciliHesap && hesaplar.length > 0) {
        setSeciliHesap(hesaplar[0]);
    }
  }, [hesaplar, seciliHesap]);

  const handleHesapDuzenle = (hesap: KasaHesap) => {
    setDuzenlenenHesap(hesap);
    setHesapModalAcik(true);
  };

  const handleIslemDuzenle = (islem: KasaIslem) => {
    setDuzenlenenIslem(islem);
    setIslemModalAcik(true);
  };

  const handleHesapKaydet = (hesap: Omit<KasaHesap, 'id' | 'bakiye'> | KasaHesap) => {
      onHesapSave(hesap);
      setHesapModalAcik(false);
      setDuzenlenenHesap(null);
  };

  const handleIslemKaydet = (islem: Omit<KasaIslem, 'id'> | KasaIslem) => {
      onIslemSave(islem);
      setIslemModalAcik(false);
      setDuzenlenenIslem(null);
  }

  const handleHesapDeleteRequest = (id: number) => {
    if (islemler.some(islem => islem.hesapId === id)) {
      alert("Bu hesapta işlem kayıtları bulunduğu için silinemez. Lütfen önce ilgili işlemleri silin.");
      return;
    }
    setHesapDeleteConfirm({ isOpen: true, id });
  };
  const handleHesapDeleteConfirm = () => {
    if (hesapDeleteConfirm.id) {
      onHesapDelete(hesapDeleteConfirm.id);
    }
    setHesapDeleteConfirm({ isOpen: false, id: null });
  };

  const handleIslemDeleteRequest = (id: number) => {
    setIslemDeleteConfirm({ isOpen: true, id });
  };
  const handleIslemDeleteConfirm = () => {
    if (islemDeleteConfirm.id) {
      onIslemDelete(islemDeleteConfirm.id);
    }
    setIslemDeleteConfirm({ isOpen: false, id: null });
  };


  const filtrelenmisIslemler = seciliHesap ? islemler.filter(i => i.hesapId === seciliHesap.id) : islemler;

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Kasa Yönetimi</h1>
        <p className="text-slate-500 mt-2 text-lg">Nakit akışınızı ve kasa hesaplarınızı yönetin.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <button
            onClick={() => { setDuzenlenenHesap(null); setHesapModalAcik(true); }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            <PlusIcon />
            <span>Yeni Hesap Ekle</span>
          </button>
          <KasaHesaplariListesi
            hesaplar={hesaplar}
            aktifHesapId={seciliHesap?.id}
            onHesapSec={setSeciliHesap}
            onDelete={handleHesapDeleteRequest}
            onEdit={handleHesapDuzenle}
          />
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-700">{seciliHesap ? `${seciliHesap.ad} İşlemleri` : 'Tüm İşlemler'}</h2>
            <button
              onClick={() => { setDuzenlenenIslem(null); setIslemModalAcik(true); }}
              disabled={!seciliHesap}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <PlusIcon />
              <span>Yeni İşlem</span>
            </button>
          </div>
          <KasaIslemListesi 
            islemler={filtrelenmisIslemler}
            hesaplar={hesaplar}
            ayarlar={ayarlar} 
            onDelete={handleIslemDeleteRequest}
            onEdit={handleIslemDuzenle}
            onDosyaGoruntule={setGoruntulenecekDosya}
          />
        </div>
      </main>

      {hesapModalAcik && (
        <HesapEkleModal
          onClose={() => { setHesapModalAcik(false); setDuzenlenenHesap(null); }}
          onSave={handleHesapKaydet}
          ayarlar={ayarlar}
          mevcutHesap={duzenlenenHesap}
        />
      )}

      {islemModalAcik && seciliHesap && (
        <IslemEkleModal
          onClose={() => { setIslemModalAcik(false); setDuzenlenenIslem(null); }}
          onSave={handleIslemKaydet}
          hesap={duzenlenenIslem ? hesaplar.find(h => h.id === duzenlenenIslem.hesapId)! : seciliHesap}
          ayarlar={ayarlar}
          mevcutIslem={duzenlenenIslem}
        />
      )}

      {goruntulenecekDosya && (
        <FileViewerModal 
            fileUrl={goruntulenecekDosya.veri}
            fileType={goruntulenecekDosya.tip}
            onClose={() => setGoruntulenecekDosya(null)}
        />
      )}

      {hesapDeleteConfirm.isOpen && (
        <ConfirmationModal
          onClose={() => setHesapDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={handleHesapDeleteConfirm}
          title="Hesabı Sil"
          message="Bu kasa hesabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        />
      )}

      {islemDeleteConfirm.isOpen && (
        <ConfirmationModal
          onClose={() => setIslemDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={handleIslemDeleteConfirm}
          title="İşlemi Sil"
          message="Bu kasa işlemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        />
      )}
    </div>
  );
};

export default KasaPage;