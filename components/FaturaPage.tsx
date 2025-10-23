import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
// FIX: Corrected import path for types
import { Fatura, Varlik, Ayarlar, Proje, Cek, OdemeKaydi } from '../types';
import FaturaListesi from './FaturaListesi';
import FaturaForm from './FaturaForm';
import FaturaDetayModal from './FaturaDetayModal';
import FaturaSablonu from './FaturaSablonu';
import TahsilatMakbuzSablonu from './TahsilatMakbuzSablonu';
import PlusIcon from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';
import ReportHeader from './ReportHeader';
import CurrencySummaryWidget from './CurrencySummaryWidget';
import ConfirmationModal from './ConfirmationModal';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';

interface PartialPaymentModalProps {
  fatura: Fatura;
  onClose: () => void;
  onSave: (faturaId: number, odeme: Omit<OdemeKaydi, 'id'>) => void;
  ayarlar: Ayarlar;
}

const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({ fatura, onClose, onSave, ayarlar }) => {
  const odenenTutar = fatura.odemeler?.reduce((sum, p) => sum + p.tutar, 0) || 0;
  const kalanTutar = fatura.toplamTutar - odenenTutar;

  const [odeme, setOdeme] = useState({
    tarih: new Date().toISOString().split('T')[0],
    tutar: kalanTutar > 0 ? kalanTutar : 0,
    odemeTipi: ayarlar.odemeTipleri[0] || 'Nakit',
    aciklama: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOdeme(prev => ({ ...prev, [name]: name === 'tutar' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (odeme.tutar <= 0 || odeme.tutar > kalanTutar + 0.01) { // Add epsilon for float comparison
      alert(`Ödeme tutarı 0'dan büyük ve kalan tutardan (${kalanTutar.toFixed(2)}) küçük veya eşit olmalıdır.`);
      return;
    }
    onSave(fatura.id, odeme);
  };

  const labelClasses = "block text-sm font-medium text-slate-700 mb-1";
  
  return (
    <PageOverlay
      title={`Fatura #${fatura.faturaNo} için Ödeme Ekle`}
      onClose={onClose}
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300">İptal</button>
        <button type="submit" form="payment-form" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Kaydet</button>
      </>}
    >
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-slate-100 rounded-md grid grid-cols-2 gap-4">
            <div><p className="text-sm text-slate-500">Toplam Fatura Tutarı</p><p className="font-bold text-lg text-slate-900">{fatura.toplamTutar.toFixed(2)}</p></div>
            <div><p className="text-sm text-slate-500">Kalan Tutar</p><p className="font-bold text-lg text-red-600">{kalanTutar.toFixed(2)}</p></div>
        </div>
        <div>
            <label className={labelClasses}>Ödenen Tutar</label>
            <input type="number" name="tutar" value={odeme.tutar} onChange={handleChange} max={kalanTutar} step="0.01" required className="w-full p-2 border rounded-md"/>
        </div>
        <div>
            <label className={labelClasses}>Ödeme Tarihi</label>
            <DatePickerInput value={odeme.tarih} onChange={date => setOdeme(p => ({ ...p, tarih: date }))} />
        </div>
        <div>
            <label className={labelClasses}>Ödeme Tipi</label>
            <select name="odemeTipi" value={odeme.odemeTipi} onChange={handleChange} required className="w-full p-2 border rounded-md">
                {ayarlar.odemeTipleri.map(tip => <option key={tip} value={tip}>{tip}</option>)}
            </select>
        </div>
        <div>
            <label className={labelClasses}>Açıklama (Opsiyonel)</label>
            <textarea name="aciklama" value={odeme.aciklama} onChange={handleChange} rows={2} className="w-full p-2 border rounded-md"></textarea>
        </div>
      </form>
    </PageOverlay>
  );
};


interface FaturaPageProps {
  faturalar: Fatura[];
  varliklar: Varlik[];
  projeler: Proje[];
  cekler: Cek[];
  ayarlar: Ayarlar;
  onSave: (fatura: Omit<Fatura, 'id'> | Fatura) => void;
  onSil: (id: number) => void;
  onDurumGuncelle: (faturaId: number, yeniDurum: string) => void;
  partialPaymentModal: Fatura | null;
  setPartialPaymentModal: (fatura: Fatura | null) => void;
  onPartialPaymentSave: (faturaId: number, odeme: Omit<OdemeKaydi, 'id'>) => void;
}

const FaturaPage: React.FC<FaturaPageProps> = ({ faturalar, varliklar, projeler, cekler, ayarlar, onSave, onSil, onDurumGuncelle, partialPaymentModal, setPartialPaymentModal, onPartialPaymentSave }) => {
  const [formAcik, setFormAcik] = useState(false);
  const [detayAcik, setDetayAcik] = useState<Fatura | null>(null);
  const [duzenlenenFatura, setDuzenlenenFatura] = useState<Fatura | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gelir' | 'gider'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
  const [makbuzData, setMakbuzData] = useState<{ odeme: OdemeKaydi, fatura: Fatura } | null>(null);

  useEffect(() => {
    if (makbuzData) {
      const generatePdf = async () => {
        const input = document.getElementById(`tahsilat-makbuz-sablonu`);
        if (!input) return;
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow component to render

        html2canvas(input, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'pt', 'a4');
          // ... (rest of the PDF generation logic is similar to others)
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgProps = pdf.getImageProperties(imgData);
          const ratio = imgProps.width / pdfWidth;
          const imgHeight = imgProps.height / ratio;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
          pdf.save(`tahsilat-makbuzu-${makbuzData.fatura.faturaNo}-${makbuzData.odeme.id}.pdf`);
          setMakbuzData(null); // Clean up
        });
      };
      generatePdf();
    }
  }, [makbuzData]);

  const handleDuzenle = (fatura: Fatura) => {
    setDuzenlenenFatura(fatura);
    setFormAcik(true);
  };

  const handleYeniEkle = () => {
    setDuzenlenenFatura(null);
    setFormAcik(true);
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

  const handleFaturaPdfIndir = async (fatura: Fatura) => {
    const input = document.getElementById(`fatura-sablon-${fatura.id}`);
    if (!input) return;

    // Step 1: Create the PDF from the invoice template
    const canvas = await html2canvas(input, { scale: 2 });
    const invoiceImgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / pdfWidth;
    const imgHeight = canvasHeight / ratio;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(invoiceImgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(invoiceImgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Step 2: If there's an image attachment, add it on a new page, scaled to fit
    if (fatura.ekDosya && fatura.ekDosya.tip.startsWith('image/')) {
        const attachmentData = fatura.ekDosya.veri;

        const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = reject;
                img.src = src;
            });
        };

        try {
            const { width: imgWidth, height: imgHeight } = await getImageDimensions(attachmentData);
            
            pdf.addPage();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 40; // pt
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - (margin * 2);
            
            const imgRatio = imgWidth / imgHeight;
            const pageRatio = availableWidth / availableHeight;

            let finalWidth, finalHeight;

            if (imgRatio > pageRatio) {
                finalWidth = availableWidth;
                finalHeight = finalWidth / imgRatio;
            } else {
                finalHeight = availableHeight;
                finalWidth = finalHeight * imgRatio;
            }

            const x = (pageWidth - finalWidth) / 2;
            const y = (pageHeight - finalHeight) / 2;
            
            const format = fatura.ekDosya.tip.split('/')[1].toUpperCase();
            pdf.addImage(attachmentData, format, x, y, finalWidth, finalHeight);

        } catch (error) {
            console.error("Ek dosya PDF'e eklenirken hata oluştu:", error);
        }
    }

    // Step 3: Save the final PDF
    pdf.save(`fatura-${fatura.faturaNo}.pdf`);
  };

  const filtrelenmisFaturalar = useMemo(() => {
    // FIX: Explicitly set Map types to resolve type inference issue where .get() returns `unknown`.
    const varlikMap = new Map<number, string>(varliklar.map(v => [v.id, v.type === 'musteri' ? `${v.isim} ${v.soyisim}`: v.sirketAdi]));
    return faturalar
      .filter(f => filterType === 'all' || f.tip === filterType)
      .filter(f => {
        const varlikAdi = varlikMap.get(f.varlikId)?.toLowerCase() || '';
        return f.faturaNo.toLowerCase().includes(searchTerm.toLowerCase()) || varlikAdi.includes(searchTerm.toLowerCase());
      });
  }, [faturalar, varliklar, searchTerm, filterType]);
  
  const reportStats = useMemo(() => {
    const stats = {
        toplam: faturalar.length,
        odendi: faturalar.filter(f => f.odemeDurumu === 'Ödendi').length,
        odenmedi: faturalar.filter(f => f.odemeDurumu === 'Ödenmedi').length,
        kismen: faturalar.filter(f => f.odemeDurumu === 'Kısmen Ödendi').length,
        iptal: faturalar.filter(f => f.odemeDurumu === 'İptal').length,
    };
    return [
        { label: 'Toplam Fatura', value: stats.toplam, colorClass: 'border-slate-500' },
        { label: 'Ödendi', value: stats.odendi, colorClass: 'border-green-500' },
        { label: 'Ödenmedi', value: stats.odenmedi, colorClass: 'border-red-500' },
        { label: 'Kısmen Ödendi', value: stats.kismen, colorClass: 'border-yellow-500' },
        { label: 'İptal', value: stats.iptal, colorClass: 'border-gray-400' },
    ];
  }, [faturalar]);


  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Faturalar</h1>
        <p className="text-slate-500 mt-2 text-lg">Gelir ve gider faturalarınızı yönetin.</p>
      </header>

      <ReportHeader stats={reportStats} />

      <CurrencySummaryWidget
        items={filtrelenmisFaturalar}
        ayarlar={ayarlar}
        title="Para Birimine Göre Finansal Özet"
        tutarField="toplamTutar"
        paraBirimiField="paraBirimi"
        tipField="tip"
      />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-72">
                <input
                    type="text"
                    placeholder="Ara (Fatura No, Müşteri...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="p-2 border border-slate-300 rounded-lg">
                    <option value="all">Tümü</option>
                    <option value="gelir">Gelir</option>
                    <option value="gider">Gider</option>
                </select>
                <button
                    onClick={handleYeniEkle}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                    <PlusIcon />
                    <span>Yeni Fatura</span>
                </button>
            </div>
        </div>

        <FaturaListesi 
            faturalar={filtrelenmisFaturalar}
            varliklar={varliklar}
            ayarlar={ayarlar}
            onDuzenle={handleDuzenle}
            onSil={handleDeleteRequest}
            onPdfIndir={handleFaturaPdfIndir}
            onDurumGuncelle={onDurumGuncelle}
            onRowClick={setDetayAcik}
        />
      </main>

      {formAcik && (
        <FaturaForm 
            onClose={() => setFormAcik(false)}
            onSave={(fatura) => { onSave(fatura); setFormAcik(false); }}
            mevcutFatura={duzenlenenFatura}
            varliklar={varliklar}
            projeler={projeler}
            ayarlar={ayarlar}
        />
      )}
      {detayAcik && (
        <FaturaDetayModal
            fatura={detayAcik}
            varlik={varliklar.find(v => v.id === detayAcik.varlikId)!}
            ayarlar={ayarlar}
            cekler={cekler}
            onClose={() => setDetayAcik(null)}
            onMakbuzIndir={(odeme) => setMakbuzData({ odeme, fatura: detayAcik })}
        />
      )}
      {deleteConfirm.isOpen && (
          <ConfirmationModal 
              onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
              onConfirm={handleDeleteConfirm}
              title="Faturayı Sil"
              message="Bu faturayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
          />
      )}
      {partialPaymentModal && (
          <PartialPaymentModal 
            fatura={partialPaymentModal}
            onClose={() => setPartialPaymentModal(null)}
            onSave={onPartialPaymentSave}
            ayarlar={ayarlar}
          />
      )}
      {/* For PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
        {filtrelenmisFaturalar.map(fatura => (
            varliklar.find(v => v.id === fatura.varlikId) &&
            <div key={fatura.id} id={`fatura-sablon-${fatura.id}`}>
                <FaturaSablonu fatura={fatura} varlik={varliklar.find(v => v.id === fatura.varlikId)!} ayarlar={ayarlar} />
            </div>
        ))}
        {makbuzData && (
            <div id="tahsilat-makbuz-sablonu">
                <TahsilatMakbuzSablonu 
                    odeme={makbuzData.odeme}
                    fatura={makbuzData.fatura}
                    varlik={varliklar.find(v => v.id === makbuzData.fatura.varlikId)!}
                    ayarlar={ayarlar}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default FaturaPage;