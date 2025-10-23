import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Komisyon, EmlakDanismani, Sozlesme, Emlak, Ayarlar } from '../types';
import KomisyonListesi from './KomisyonListesi';
import KomisyonEkleModal from './KomisyonEkleModal';
import KomisyonMakbuzSablonu from './KomisyonMakbuzSablonu';
import { PlusIcon, SearchIcon } from './icons/AppIcons';
import ReportHeader from './ReportHeader';

interface KomisyonPageProps {
  komisyonlar: Komisyon[];
  danismanlar: EmlakDanismani[];
  sozlesmeler: Sozlesme[];
  emlaklar: Emlak[];
  ayarlar: Ayarlar;
  onSave: (komisyon: Omit<Komisyon, 'id'> | Komisyon) => void;
  onDelete: (id: number) => void;
}

const KomisyonPage: React.FC<KomisyonPageProps> = ({ komisyonlar, danismanlar, sozlesmeler, emlaklar, ayarlar, onSave, onDelete }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenKomisyon, setDuzenlenenKomisyon] = useState<Komisyon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleYeniEkle = () => {
    setDuzenlenenKomisyon(null);
    setModalAcik(true);
  };

  const handleDuzenle = (komisyon: Komisyon) => {
    setDuzenlenenKomisyon(komisyon);
    setModalAcik(true);
  };
  
  const handleSave = (komisyon: Omit<Komisyon, 'id'> | Komisyon) => {
    onSave(komisyon);
    setModalAcik(false);
  };
  
  const handlePdfIndir = (komisyon: Komisyon) => {
    const input = document.getElementById(`makbuz-sablon-${komisyon.id}`);
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
        pdf.save(`komisyon-makbuzu-${komisyon.id}.pdf`);
      });
    }
  };
  
  const danismanMap = useMemo(() => new Map(danismanlar.map(d => [d.id, d.type === 'kisi' ? `${d.isim} ${d.soyisim}` : d.sirketAdi])), [danismanlar]);
  
  const filtrelenmisKomisyonlar = useMemo(() => {
    return komisyonlar.filter(k => {
      const danismanAdi = danismanMap.get(k.danismanId)?.toLowerCase() || '';
      return danismanAdi.includes(searchTerm.toLowerCase());
    });
  }, [komisyonlar, danismanMap, searchTerm]);

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Komisyon Yönetimi</h1>
        <p className="text-slate-500 mt-2 text-lg">Emlak satış ve kiralama komisyonlarını yönetin.</p>
      </header>
      
      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input type="text" placeholder="Danışman Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg"/>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          </div>
          <button onClick={handleYeniEkle} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Komisyon Ekle</span>
          </button>
        </div>
        <KomisyonListesi
            komisyonlar={filtrelenmisKomisyonlar}
            danismanlar={danismanlar}
            sozlesmeler={sozlesmeler}
            ayarlar={ayarlar}
            onEdit={handleDuzenle}
            onDelete={onDelete}
            onPdfIndir={handlePdfIndir}
        />
      </main>

      {modalAcik && (
        <KomisyonEkleModal
            onClose={() => setModalAcik(false)}
            onSave={handleSave}
            mevcutKomisyon={duzenlenenKomisyon}
            danismanlar={danismanlar}
            sozlesmeler={sozlesmeler}
            emlaklar={emlaklar}
            ayarlar={ayarlar}
        />
      )}

      {/* For PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {filtrelenmisKomisyonlar.map(k => {
            const danisman = danismanlar.find(d => d.id === k.danismanId);
            if (!danisman) return null;
            return (
                <div key={k.id} id={`makbuz-sablon-${k.id}`}>
                    <KomisyonMakbuzSablonu komisyon={k} danisman={danisman} sozlesmeler={sozlesmeler} ayarlar={ayarlar} />
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default KomisyonPage;