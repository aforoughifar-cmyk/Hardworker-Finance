import React, { useState, useMemo } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Taksit, Fatura, Varlik, Ayarlar } from '../types';
import TaksitListesi from './TaksitListesi';
import { TaksitEkleModal } from './TaksitEkleModal';
import TaksitMakbuzSablonu from './TaksitMakbuzSablonu';
import { PlusIcon, SearchIcon } from './icons/AppIcons';
import ReportHeader from './ReportHeader';
import CurrencySummaryWidget from './CurrencySummaryWidget';
import ConfirmationModal from './ConfirmationModal';

interface TaksitPageProps {
  taksitler: Taksit[];
  faturalar: Fatura[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
  onTaksitPlanKaydet: (yeniTaksitler: Omit<Taksit, 'id'>[]) => void;
  onTaksitGuncelle: (taksitId: number, data: Partial<Taksit>) => void;
  onTaksitDurumGuncelle: (taksitId: number, yeniDurum: string) => void;
  onTaksitSil: (taksitId: number) => void;
}

const TaksitPage: React.FC<TaksitPageProps> = ({ taksitler, faturalar, varliklar, ayarlar, onTaksitPlanKaydet, onTaksitGuncelle, onTaksitDurumGuncelle, onTaksitSil }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDurum, setFilterDurum] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const faturaMap = useMemo(() => new Map(faturalar.map(f => [f.id, f])), [faturalar]);
  const varlikMap = useMemo(() => new Map(varliklar.map(v => [v.id, v])), [varliklar]);

  const filtrelenmisTaksitler = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return taksitler.filter(t => {
      const fatura = t.faturaId ? faturaMap.get(t.faturaId) : null;
      const varlik = varlikMap.get(t.varlikId);
      if (!varlik) return false;
      const varlikAdi = varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;

      let durumMatch = true;
      switch (filterDurum) {
        case 'Ödendi':
            durumMatch = t.durum === 'Ödendi';
            break;
        case 'Ödenmedi':
            durumMatch = t.durum === 'Ödenmedi';
            break;
        case 'vadesi-gecmis':
            durumMatch = t.durum === 'Ödenmedi' && new Date(t.vadeTarihi) < today;
            break;
        case 'yakinda-vadesi-gelecek':
            const vadeTarihi = new Date(t.vadeTarihi);
            durumMatch = t.durum === 'Ödenmedi' && vadeTarihi >= today && vadeTarihi <= sevenDaysFromNow;
            break;
      }
      
      const searchMatch = !searchTerm || (fatura?.faturaNo.toLowerCase().includes(searchTerm.toLowerCase())) || (varlikAdi.toLowerCase().includes(searchTerm.toLowerCase()));

      return durumMatch && searchMatch;
    });
  }, [taksitler, faturaMap, varlikMap, searchTerm, filterDurum]);

  const handleSave = (yeniTaksitler: Omit<Taksit, 'id'>[]) => {
    onTaksitPlanKaydet(yeniTaksitler);
    setModalAcik(false);
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id) {
      onTaksitSil(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handlePdfIndir = (taksit: Taksit) => {
    const input = document.getElementById(`taksit-makbuz-${taksit.id}`);
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps= pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const w = imgWidth * ratio;
        const h = imgHeight * ratio;
        
        const x = (pdfWidth - w) / 2;
        const y = 0;

        pdf.addImage(imgData, 'PNG', x, y, w, h);
        pdf.save(`tahsilat-makbuzu-taksit-${taksit.id}.pdf`);
      });
    }
  };

  const reportStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return [
      { label: 'Toplam Taksit', value: taksitler.length, colorClass: 'border-slate-500' },
      { label: 'Ödenen', value: taksitler.filter(t => t.durum === 'Ödendi').length, colorClass: 'border-green-500' },
      { label: 'Ödenmeyen', value: taksitler.filter(t => t.durum === 'Ödenmedi').length, colorClass: 'border-yellow-500' },
      { label: 'Vadesi Geçen', value: taksitler.filter(t => t.vadeTarihi < today && t.durum === 'Ödenmedi').length, colorClass: 'border-red-500' },
    ];
  }, [taksitler]);

  const odenmemisTaksitlerWithCurrency = useMemo(() => {
    return filtrelenmisTaksitler.filter(t => t.durum === 'Ödenmedi');
  }, [filtrelenmisTaksitler]);
  
  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Taksit Yönetimi</h1>
        <p className="text-slate-500 mt-2 text-lg">Faturalarınızı taksitlendirin ve ödemeleri takip edin.</p>
      </header>

      <ReportHeader stats={reportStats} />

      <CurrencySummaryWidget
        items={odenmemisTaksitlerWithCurrency}
        ayarlar={ayarlar}
        title="Para Birimine Göre Kalan Borç Özeti"
        tutarField="tutar"
        paraBirimiField="paraBirimi"
      />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-72">
                <input type="text" placeholder="Ara (Fatura No, Müşteri...)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg"/>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            </div>
            <div className="flex items-center gap-2">
                <select value={filterDurum} onChange={e => setFilterDurum(e.target.value)} className="p-2 border rounded-lg">
                    <option value="all">Tümü</option>
                    <option value="Ödendi">Ödendi</option>
                    <option value="Ödenmedi">Ödenmedi</option>
                    <option value="vadesi-gecmis">Vadesi Geçmiş</option>
                    <option value="yakinda-vadesi-gelecek">Yakında Vadesi Gelecek (7 gün)</option>
                </select>
                <button onClick={() => setModalAcik(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                    <PlusIcon />
                    <span>Yeni Taksit Planı</span>
                </button>
            </div>
        </div>

        <TaksitListesi 
            taksitler={filtrelenmisTaksitler}
            faturalar={faturalar}
            varliklar={varliklar}
            ayarlar={ayarlar}
            onTaksitGuncelle={onTaksitGuncelle}
            onDurumGuncelle={onTaksitDurumGuncelle}
            onTaksitSil={handleDeleteRequest}
            onPdfIndir={handlePdfIndir}
        />
      </main>

      {modalAcik && (
        <TaksitEkleModal
            onClose={() => setModalAcik(false)}
            onSave={handleSave}
            faturalar={faturalar}
            varliklar={varliklar}
            ayarlar={ayarlar}
        />
      )}
      
      {deleteConfirm.isOpen && (
        <ConfirmationModal
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={handleDeleteConfirm}
          title="Taksiti Sil"
          message="Bu taksiti silmek istediğinizden emin misiniz?"
        />
      )}

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {filtrelenmisTaksitler.map(taksit => {
            if (taksit.durum !== 'Ödendi') return null;
            const varlik = varlikMap.get(taksit.varlikId);
            const fatura = taksit.faturaId ? faturaMap.get(taksit.faturaId) : null;
            if (!varlik) return null;

            return (
                <div key={taksit.id} id={`taksit-makbuz-${taksit.id}`}>
                    <TaksitMakbuzSablonu taksit={taksit} varlik={varlik} fatura={fatura || null} ayarlar={ayarlar} />
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default TaksitPage;