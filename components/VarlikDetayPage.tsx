import React, { useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// FIX: Corrected import path for types
import { Varlik, Fatura, Proje, Cek, Ayarlar, Sozlesme, Taksit, Emlak, EmlakOdeme, GiderTuru } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import FaturaListesi from './FaturaListesi';
import CekListesi from './CekListesi';
import TaksitDokumuSablonu from './TaksitDokumuSablonu';

interface VarlikDetayPageProps {
  varlik: Varlik;
  onBack: () => void;
  faturalar: Fatura[];
  projeler: Proje[];
  cekler: Cek[];
  ayarlar: Ayarlar;
  sozlesmeler: Sozlesme[];
  taksitler: Taksit[];
  varliklar: Varlik[];
  emlaklar: Emlak[];
  emlakOdemeler: EmlakOdeme[];
  giderTurleri: GiderTuru[];
}

const VarlikDetayPage: React.FC<VarlikDetayPageProps> = ({ varlik, onBack, faturalar, projeler, cekler, ayarlar, sozlesmeler, taksitler, varliklar, emlaklar, emlakOdemeler, giderTurleri }) => {
  const ilgiliFaturalar = faturalar.filter(f => f.varlikId === varlik.id);
  const ilgiliSozlesmeler = sozlesmeler.filter(s => s.varlikId === varlik.id);
  const ilgiliCekler = cekler.filter(c => c.varlikId === varlik.id);
  
  const ilgiliTaksitler = useMemo(() => {
    return taksitler.filter(t => t.varlikId === varlik.id);
  }, [taksitler, varlik.id]);

  const ilgiliEmlakOdemeleri = useMemo(() => {
      const varlikSozlesmeIds = new Set(ilgiliSozlesmeler.map(s => s.id));
      return emlakOdemeler.filter(o => varlikSozlesmeIds.has(o.sozlesmeId));
  }, [emlakOdemeler, ilgiliSozlesmeler]);

  const handleTaksitPdfIndir = () => {
    const input = document.getElementById('taksit-dokumu-sablonu');
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const w = imgWidth * ratio;
        const h = imgHeight * ratio;
        
        const x = (pdfWidth - w) / 2;
        const y = 0;

        pdf.addImage(imgData, 'PNG', x, y, w, h);
        pdf.save(`taksit-dokumu-${varlik.id}.pdf`);
      });
    }
  };

  const taksitOzeti = useMemo(() => {
    const toplamTaksitSayisi = ilgiliTaksitler.length;
    const odenenTaksitSayisi = ilgiliTaksitler.filter(t => t.durum === 'Ödendi').length;

    const totalsByCurrency: { [key: string]: { odenen: number, odenmeyen: number } } = {};
    
    ilgiliTaksitler.forEach(taksit => {
        const currency = taksit.paraBirimi;
        if (!totalsByCurrency[currency]) {
            totalsByCurrency[currency] = { odenen: 0, odenmeyen: 0 };
        }
        if (taksit.durum === 'Ödendi') {
            totalsByCurrency[currency].odenen += taksit.tutar;
        } else {
            totalsByCurrency[currency].odenmeyen += taksit.tutar;
        }
    });

    return {
        toplamTaksitSayisi,
        odenenTaksitSayisi,
        totalsByCurrency: Object.entries(totalsByCurrency)
    };
  }, [ilgiliTaksitler]);
  
  const InfoField: React.FC<{label: string; value: string | React.ReactNode}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-md text-slate-800">{value}</p>
    </div>
  )

  return (
    <div className="w-full space-y-8">
      <header>
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 mb-4">
            <ArrowLeftIcon />
            <span>Geri Dön</span>
        </button>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            {varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi}
        </h1>
        <p className="text-slate-500 mt-2 text-lg capitalize">{varlik.type} Detayları</p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 self-start">
            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">İletişim Bilgileri</h2>
                {varlik.type === 'musteri' ? (
                    <>
                        <InfoField label="E-posta" value={varlik.email || '-'} />
                        <InfoField label="Telefon" value={varlik.telefon} />
                        <InfoField label="Kimlik No" value={varlik.kimlikNo || '-'} />
                    </>
                ) : (
                    <>
                        <InfoField label="Şirket E-postası" value={varlik.sirketEmail || '-'} />
                        <InfoField label="Şirket Telefonu" value={varlik.sirketTelefon} />
                        <InfoField label="Vergi No" value={varlik.vergiNo || '-'} />
                        <InfoField label="Web Sitesi" value={varlik.webSitesi || '-'} />
                    </>
                )}
                <InfoField label="Adres" value={varlik.adres} />
            </div>
            {ilgiliTaksitler.length > 0 && (
                 <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h2 className="text-xl font-bold text-slate-800">Taksit Özeti</h2>
                      <button onClick={handleTaksitPdfIndir} className="text-sm bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700">Taksit Dökümü PDF</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Toplam Taksit" value={taksitOzeti.toplamTaksitSayisi.toString()} />
                        <InfoField label="Ödenen Taksit" value={taksitOzeti.odenenTaksitSayisi.toString()} />
                    </div>
                    {taksitOzeti.totalsByCurrency.map(([currency, totals]) => {
                        const sembol = ayarlar.paraBirimleri.find(p => p.kod === currency)?.sembol || currency;
                        return (
                            <div key={currency} className="pt-2 border-t">
                                <p className="font-semibold text-slate-700">{currency}</p>
                                <div className="text-sm space-y-1 mt-1">
                                    <p className="flex justify-between"><span>Ödenen Tutar:</span> <span className="font-medium text-green-600">{sembol}{totals.odenen.toFixed(2)}</span></p>
                                    <p className="flex justify-between"><span>Kalan Borç:</span> <span className="font-medium text-red-600">{sembol}{totals.odenmeyen.toFixed(2)}</span></p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            {ilgiliEmlakOdemeleri.length > 0 && (
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Emlak Ödemeleri</h2>
                    <ul className="divide-y divide-slate-200">
                        {ilgiliEmlakOdemeleri.map(o => {
                            const emlak = emlaklar.find(e => e.id === o.emlakId);
                            const emlakAdi = emlak ? `${emlak.blok} Blok, Daire ${emlak.daireNo}` : 'Bilinmeyen Birim';
                            const sembol = ayarlar.paraBirimleri.find(p => p.kod === o.paraBirimi)?.sembol || o.paraBirimi;
                            return (
                                <li key={o.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-900">{emlakAdi}</p>
                                        <p className="text-sm text-slate-500">{new Date(o.tarih).toLocaleDateString('tr-TR')} - {giderTurleri.find(g=>g.id === o.giderTuruId)?.ad}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className="font-bold text-slate-800">{sembol}{o.tutar.toFixed(2)}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.durum === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.durum}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">İlişkili Faturalar</h2>
                <FaturaListesi 
                    faturalar={ilgiliFaturalar}
                    varliklar={[varlik]}
                    ayarlar={ayarlar}
                />
            </div>
            
            {ilgiliCekler.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">İlişkili Çekler</h2>
                    <CekListesi 
                        cekler={ilgiliCekler}
                        varliklar={varliklar}
                        faturalar={faturalar}
                        ayarlar={ayarlar}
                    />
                </div>
            )}

            {ilgiliSozlesmeler.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">İlgili Sözleşmeler</h2>
                    <ul className="divide-y divide-slate-200">
                        {ilgiliSozlesmeler.map(s => (
                            <li key={s.id} className="py-3">
                                <p className="font-semibold text-slate-900">{s.baslik}</p>
                                <p className="text-sm text-slate-500">Tarih: {new Date(s.sozlesmeTarihi).toLocaleDateString('tr-TR')} - Durum: {s.durum}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      </main>

       {/* PDF Dökümü için gizli alan */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div id="taksit-dokumu-sablonu">
          <TaksitDokumuSablonu varlik={varlik} taksitler={ilgiliTaksitler} ayarlar={ayarlar} />
        </div>
      </div>
    </div>
  );
};

export default VarlikDetayPage;