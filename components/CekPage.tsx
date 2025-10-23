import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// FIX: Corrected import path for types
import { Cek, Varlik, Fatura, Proje, Ayarlar } from '../types';
import CekListesi from './CekListesi';
import CekEkleModal from './CekEkleModal';
import MakbuzSablonu from './MakbuzSablonu';
import PlusIcon from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';
import ReportHeader from './ReportHeader';
import CurrencySummaryWidget from './CurrencySummaryWidget';
import DatePickerInput from './DatePickerInput';
import ConfirmationModal from './ConfirmationModal';

interface CekPageProps {
  cekler: Cek[];
  varliklar: Varlik[];
  faturalar: Fatura[];
  projeler: Proje[];
  ayarlar: Ayarlar;
  onSave: (cek: Omit<Cek, 'id'> | Cek) => void;
  onSil: (id: number) => void;
  onDurumGuncelle: (cekId: number, yeniDurum: string) => void;
}

const CekPage: React.FC<CekPageProps> = ({ cekler, varliklar, faturalar, projeler, ayarlar, onSave, onSil, onDurumGuncelle }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenCek, setDuzenlenenCek] = useState<Cek | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTarih, setFilterTarih] = useState<{ baslangic: string, bitis: string }>({ baslangic: '', bitis: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const handleDuzenle = (cek: Cek) => {
    setDuzenlenenCek(cek);
    setModalAcik(true);
  };

  const handleYeniEkle = () => {
    setDuzenlenenCek(null);
    setModalAcik(true);
  };
  
  const handleSave = (cek: Omit<Cek, 'id'> | Cek) => {
    onSave(cek);
    setModalAcik(false);
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id) {
      onSil(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handlePdfIndir = (cek: Cek) => {
    const input = document.getElementById(`makbuz-sablon-${cek.id}`);
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
        const y = 0; // Align to top

        pdf.addImage(imgData, 'PNG', x, y, w, h);
        pdf.save(`makbuz-${cek.makbuzNo}.pdf`);
      });
    }
  };

  const filtrelenmisCekler = useMemo(() => {
    const varlikMap = new Map(varliklar.map(v => v.type === 'firma' ? [v.id, v.sirketAdi] : null).filter(Boolean) as [number, string][] );
    return cekler.filter(cek => {
      const varlikAdi = varlikMap.get(cek.varlikId)?.toLowerCase() || '';
      const searchMatch = (
        cek.cekNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cek.makbuzNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        varlikAdi.includes(searchTerm.toLowerCase())
      );

      const dateMatch = (!filterTarih.baslangic || cek.vadeTarihi >= filterTarih.baslangic) &&
                        (!filterTarih.bitis || cek.vadeTarihi <= filterTarih.bitis);

      return searchMatch && dateMatch;
    });
  }, [cekler, varliklar, searchTerm, filterTarih]);

  const reportStats = useMemo(() => {
    const colorMap: { [key: string]: string } = {
        'Beklemede': 'border-amber-500',
        'Ödendi': 'border-emerald-500',
        'İptal Edildi': 'border-slate-500',
    };
    const stats = ayarlar.cekDurumlari.map(durum => ({
        label: durum.durum,
        value: cekler.filter(c => c.durum === durum.durum).length,
        colorClass: colorMap[durum.durum] || 'border-gray-500',
    }));
    stats.unshift({ label: 'Toplam Çek', value: cekler.length, colorClass: 'border-blue-500' });
    return stats;
  }, [cekler, ayarlar.cekDurumlari]);


  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Çek Yönetimi</h1>
        <p className="text-slate-500 mt-2 text-lg">Çeklerinizi kaydedin ve durumlarını takip edin.</p>
      </header>

      <ReportHeader stats={reportStats} />

      <CurrencySummaryWidget
        items={filtrelenmisCekler}
        ayarlar={ayarlar}
        title="Para Birimine Göre Çek Özeti"
        tutarField="tutar"
        paraBirimiField="paraBirimi"
      />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara (Çek No, Firma...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
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
            <span>Yeni Çek Ekle</span>
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
            <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Vade Tarihi Aralığı</label>
                <div className="flex items-center gap-2">
                    <DatePickerInput value={filterTarih.baslangic} onChange={date => setFilterTarih(f => ({...f, baslangic: date}))} />
                    <span>-</span>
                    <DatePickerInput value={filterTarih.bitis} onChange={date => setFilterTarih(f => ({...f, bitis: date}))} />
                </div>
            </div>
        </div>

        <CekListesi
          cekler={filtrelenmisCekler}
          varliklar={varliklar}
          faturalar={faturalar}
          ayarlar={ayarlar}
          onDuzenle={handleDuzenle}
          onSil={handleDeleteRequest}
          onDurumGuncelle={onDurumGuncelle}
          onPdfIndir={handlePdfIndir}
        />
      </main>

      {modalAcik && (
        <CekEkleModal
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutCek={duzenlenenCek}
          varliklar={varliklar}
          faturalar={faturalar}
          projeler={projeler}
          ayarlar={ayarlar}
        />
      )}
      {deleteConfirm.isOpen && (
        <ConfirmationModal
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={handleDeleteConfirm}
          title="Çeki Sil"
          message="Bu çeki silmek istediğinizden emin misiniz?"
        />
      )}
       {/* For PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {filtrelenmisCekler.map(cek => (
            varliklar.find(v => v.id === cek.varlikId) &&
            <div key={cek.id} id={`makbuz-sablon-${cek.id}`}>
                <MakbuzSablonu cek={cek} varlik={varliklar.find(v => v.id === cek.varlikId)!} faturalar={faturalar} />
            </div>
        ))}
      </div>
    </div>
  );
};

export default CekPage;