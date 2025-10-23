import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { EmlakOdeme, Emlak, Sozlesme, GiderTuru, Ayarlar, Varlik } from '../types';
import EmlakOdemelerListesi from './EmlakOdemelerListesi';
import EmlakOdemeEkleModal from './EmlakOdemeEkleModal';
import { PlusIcon } from './icons/AppIcons';
import DatePickerInput from './DatePickerInput';
import EmlakOdemeMakbuzSablonu from './EmlakOdemeMakbuzSablonu';


interface EmlakOdemelerPageProps {
  emlakOdemeler: EmlakOdeme[];
  emlaklar: Emlak[];
  sozlesmeler: Sozlesme[];
  giderTurleri: GiderTuru[];
  ayarlar: Ayarlar;
  onSave: (odeme: Omit<EmlakOdeme, 'id'> | EmlakOdeme) => void;
  onDelete: (id: number) => void;
  onDurumGuncelle: (id: number, durum: 'Ödendi' | 'Ödenmedi') => void;
  // FIX: Added the missing 'varliklar' prop to the interface.
  varliklar: Varlik[];
}

const EmlakOdemelerPage: React.FC<EmlakOdemelerPageProps> = ({ emlakOdemeler, emlaklar, sozlesmeler, giderTurleri, ayarlar, onSave, onDelete, onDurumGuncelle, varliklar }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenOdeme, setDuzenlenenOdeme] = useState<EmlakOdeme | null>(null);
  const [emlakFiltresi, setEmlakFiltresi] = useState<number | ''>('');
  const [tarihFiltresi, setTarihFiltresi] = useState<{ baslangic: string, bitis: string }>({ baslangic: '', bitis: '' });
  
  const handleYeniEkle = () => {
    setDuzenlenenOdeme(null);
    setModalAcik(true);
  };
  
  const handleDuzenle = (odeme: EmlakOdeme) => {
    setDuzenlenenOdeme(odeme);
    setModalAcik(true);
  };

  const handleSave = (odeme: Omit<EmlakOdeme, 'id'> | EmlakOdeme) => {
    onSave(odeme);
    setModalAcik(false);
  };

  const handlePdfIndir = (odeme: EmlakOdeme) => {
    const input = document.getElementById(`emlak-odeme-makbuz-${odeme.id}`);
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
        pdf.save(`emlak-odeme-makbuzu-${odeme.id}.pdf`);
      });
    }
  };

  const filtrelenmisOdemeler = useMemo(() => {
    return emlakOdemeler
      .filter(odeme => {
        if (emlakFiltresi === '') return true;
        return odeme.emlakId === emlakFiltresi;
      })
      .filter(odeme => {
        if (!tarihFiltresi.baslangic || !tarihFiltresi.bitis) return true;
        const odemeTarihi = new Date(odeme.tarih);
        const baslangic = new Date(tarihFiltresi.baslangic);
        const bitis = new Date(tarihFiltresi.bitis);
        return odemeTarihi >= baslangic && odemeTarihi <= bitis;
      });
  }, [emlakOdemeler, emlakFiltresi, tarihFiltresi]);

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Emlak Faturalar & Ödemeler</h1>
        <p className="text-slate-500 mt-2 text-lg">Kiralanan birimlere ait gider ve ödemeleri yönetin.</p>
      </header>
      
      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
                <select 
                    value={emlakFiltresi} 
                    onChange={e => setEmlakFiltresi(e.target.value ? Number(e.target.value) : '')} 
                    className="p-2 border rounded-lg bg-white"
                >
                    <option value="">Tüm Birimler</option>
                    {emlaklar.map(e => <option key={e.id} value={e.id}>{`${e.blok} Blok, Kat ${e.kat}, No ${e.daireNo}`}</option>)}
                </select>
                <div className="flex items-center gap-2">
                    <DatePickerInput value={tarihFiltresi.baslangic} onChange={date => setTarihFiltresi(f => ({...f, baslangic: date}))} />
                    <span>-</span>
                    <DatePickerInput value={tarihFiltresi.bitis} onChange={date => setTarihFiltresi(f => ({...f, bitis: date}))} />
                </div>
            </div>
            <button onClick={handleYeniEkle} className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                <PlusIcon />
                <span>Yeni Ödeme Ekle</span>
            </button>
        </div>
        <EmlakOdemelerListesi
            odemeler={filtrelenmisOdemeler}
            emlaklar={emlaklar}
            giderTurleri={giderTurleri}
            ayarlar={ayarlar}
            onEdit={handleDuzenle}
            onDelete={onDelete}
            onDurumGuncelle={onDurumGuncelle}
            onPdfIndir={handlePdfIndir}
        />
      </main>

      {modalAcik && (
        <EmlakOdemeEkleModal
            onClose={() => setModalAcik(false)}
            onSave={handleSave}
            mevcutOdeme={duzenlenenOdeme}
            emlaklar={emlaklar}
            sozlesmeler={sozlesmeler}
            giderTurleri={giderTurleri}
            ayarlar={ayarlar}
        />
      )}

      {/* For PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {filtrelenmisOdemeler.map(odeme => {
            if (odeme.durum !== 'Ödendi') return null;
            const emlak = emlaklar.find(e => e.id === odeme.emlakId);
            const sozlesme = sozlesmeler.find(s => s.id === odeme.sozlesmeId);
            const varlik = sozlesme ? varliklar.find(v => v.id === sozlesme.varlikId) : null;
            const giderTuru = giderTurleri.find(g => g.id === odeme.giderTuruId);
            if (!emlak || !sozlesme || !varlik || !giderTuru) return null;

            return (
                <div key={odeme.id} id={`emlak-odeme-makbuz-${odeme.id}`}>
                    <EmlakOdemeMakbuzSablonu 
                        odeme={odeme} 
                        emlak={emlak}
                        sozlesme={sozlesme}
                        varlik={varlik}
                        giderTuru={giderTuru}
                        ayarlar={ayarlar} 
                    />
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default EmlakOdemelerPage;