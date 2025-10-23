import React from 'react';
import { Teklif, Varlik, Proje, Ayarlar } from '../types';
import PageOverlay from './PageOverlay';
import { PaperClipIcon } from './icons/AppIcons';

interface TeklifDetayModalProps {
  teklif: Teklif;
  varlik: Varlik | undefined;
  proje: Proje | undefined;
  ayarlar: Ayarlar;
  onClose: () => void;
  onDosyaGoruntule: (dosya: { veri: string; tip: string; }) => void;
}

const InfoField: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="text-md text-slate-800">{value || '-'}</p>
  </div>
);

const TeklifDetayModal: React.FC<TeklifDetayModalProps> = ({ teklif, varlik, proje, ayarlar, onClose, onDosyaGoruntule }) => {
  
  const varlikAdi = varlik ? (varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi) : "Bilinmiyor";
  const paraBirimiSembolu = ayarlar.paraBirimleri.find(p => p.kod === teklif.paraBirimi)?.sembol || teklif.paraBirimi;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  
  return (
    <PageOverlay
      title={`Teklif Detayı - ${teklif.konu}`}
      onClose={onClose}
      footer={
        <button onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800">
          Kapat
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-lg">
          <InfoField label="Müşteri/Firma" value={varlikAdi} />
          <InfoField label="İlgili Proje" value={proje?.ad || 'Yok'} />
          <InfoField label="Tarih" value={formatDate(teklif.tarih)} />
          <InfoField label="Tutar" value={`${paraBirimiSembolu}${teklif.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} />
          <InfoField label="Para Birimi" value={teklif.paraBirimi} />
           <div>
              <p className="text-sm font-medium text-slate-500">Durum</p>
              <span className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {teklif.durum}
              </span>
            </div>
        </div>
        
        {teklif.aciklama && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Açıklama</h3>
            <p className="text-slate-600 bg-white p-3 rounded-md border">{teklif.aciklama}</p>
          </div>
        )}
        
        {teklif.ekDosya && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Ekli Dosya</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => onDosyaGoruntule(teklif.ekDosya!)} className="flex items-center gap-2 text-indigo-600 hover:underline">
                <PaperClipIcon />
                <span>{teklif.ekDosya.ad}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </PageOverlay>
  );
};

export default TeklifDetayModal;