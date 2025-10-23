import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Proje, Fatura, Varlik, Ayarlar, Teklif, Irsaliye, Cek, Sozlesme } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import FaturaListesi from './FaturaListesi';
import TeklifListesi from './TeklifListesi';
import IrsaliyeListesi from './IrsaliyeListesi';
import CekListesi from './CekListesi';
import SozlesmeListesi from './SozlesmeListesi';
import ReportHeader from './ReportHeader';

interface ProjeDetayPageProps {
  proje: Proje;
  onBack: () => void;
  faturalar: Fatura[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
  teklifler: Teklif[];
  irsaliyeler: Irsaliye[];
  cekler: Cek[];
  sozlesmeler: Sozlesme[];
}

const ProjeDetayPage: React.FC<ProjeDetayPageProps> = ({ proje, onBack, faturalar, varliklar, ayarlar, teklifler, irsaliyeler, cekler, sozlesmeler }) => {
  const ilgiliFaturalar = faturalar.filter(f => f.projeId === proje.id);
  const ilgiliTeklifler = teklifler.filter(t => t.projeId === proje.id);
  const ilgiliIrsaliyeler = irsaliyeler.filter(i => i.projeId === proje.id);
  const ilgiliCekler = cekler.filter(c => c.projeId === proje.id);
  const ilgiliSozlesmeler = sozlesmeler.filter(s => s.projeId === proje.id);

  const projeOzeti = useMemo(() => {
    const gelirler: { [key: string]: number } = {};
    const giderler: { [key: string]: number } = {};

    ilgiliFaturalar.forEach(fatura => {
        const paraBirimi = fatura.paraBirimi;
        if (fatura.tip === 'gelir') {
            if (!gelirler[paraBirimi]) gelirler[paraBirimi] = 0;
            gelirler[paraBirimi] += fatura.toplamTutar;
        } else {
            if (!giderler[paraBirimi]) giderler[paraBirimi] = 0;
            giderler[paraBirimi] += fatura.toplamTutar;
        }
    });

    const formatCurrencySummary = (summary: { [key: string]: number }) => {
        if (Object.keys(summary).length === 0) return '0';
        return Object.entries(summary).map(([kod, tutar]) => {
            const sembol = ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
            return `${sembol}${tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
        }).join(' | ');
    };

    return {
        gelirlerStr: formatCurrencySummary(gelirler),
        giderlerStr: formatCurrencySummary(giderler),
        teklifSayisi: ilgiliTeklifler.length,
        irsaliyeSayisi: ilgiliIrsaliyeler.length,
        sozlesmeSayisi: ilgiliSozlesmeler.length,
        cekSayisi: ilgiliCekler.length,
    };
  }, [ilgiliFaturalar, ilgiliTeklifler, ilgiliIrsaliyeler, ilgiliSozlesmeler, ilgiliCekler, ayarlar.paraBirimleri]);

  const reportStats = [
    { label: 'Toplam Gelir', value: projeOzeti.gelirlerStr, colorClass: 'border-emerald-500' },
    { label: 'Toplam Gider', value: projeOzeti.giderlerStr, colorClass: 'border-red-500' },
    { label: 'Teklif Sayısı', value: projeOzeti.teklifSayisi, colorClass: 'border-sky-500' },
    { label: 'Sözleşme Sayısı', value: projeOzeti.sozlesmeSayisi, colorClass: 'border-blue-500' },
    { label: 'İrsaliye Sayısı', value: projeOzeti.irsaliyeSayisi, colorClass: 'border-purple-500' },
    { label: 'Çek Sayısı', value: projeOzeti.cekSayisi, colorClass: 'border-amber-500' },
  ];

  const InfoField: React.FC<{label: string; value: string | React.ReactNode}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-md text-slate-800">{value}</p>
    </div>
  );

  return (
    <div className="w-full space-y-8">
      <header>
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 mb-4">
            <ArrowLeftIcon />
            <span>Geri Dön</span>
        </button>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{proje.ad}</h1>
        <p className="text-slate-500 mt-2 text-lg">Proje Detayları</p>
      </header>
      
      <ReportHeader stats={reportStats} />
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4 self-start">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Proje Bilgileri</h2>
            <InfoField label="Başlangıç Tarihi" value={new Date(proje.baslangicTarihi).toLocaleDateString('tr-TR')} />
            <InfoField label="Bitiş Tarihi" value={new Date(proje.bitisTarihi).toLocaleDateString('tr-TR')} />
            <InfoField 
                label="İlerleme" 
                value={
                    <div className="flex items-center">
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${proje.ilerlemeYuzdesi}%`}}></div>
                        </div>
                        <span className="text-xs text-slate-500 ml-3">{proje.ilerlemeYuzdesi}%</span>
                    </div>
                } 
            />
            <div>
                 <p className="text-sm font-medium text-slate-500">Açıklama</p>
                 <p className="text-sm text-slate-700 mt-1">{proje.aciklama}</p>
            </div>
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">İlişkili Faturalar</h2>
                <FaturaListesi 
                    faturalar={ilgiliFaturalar}
                    varliklar={varliklar}
                    ayarlar={ayarlar}
                />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">İlişkili İrsaliyeler</h2>
                 <IrsaliyeListesi
                    irsaliyeler={ilgiliIrsaliyeler}
                    varliklar={varliklar}
                    ayarlar={ayarlar}
                    onDelete={()=>{}}
                    onEdit={()=>{}}
                    onFaturaEt={()=>{}}
                    onDosyaGoruntule={()=>{}}
                    onDurumGuncelle={() => {}}
                 />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">İlişkili Sözleşmeler</h2>
                <SozlesmeListesi 
                    sozlesmeler={ilgiliSozlesmeler}
                    varliklar={varliklar}
                    onDelete={() => {}} 
                    onEdit={() => {}}
                    onDosyaGoruntule={() => {}}
                />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">İlişkili Çekler</h2>
                <CekListesi 
                    cekler={ilgiliCekler}
                    varliklar={varliklar}
                    faturalar={faturalar}
                    ayarlar={ayarlar}
                />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">İlişkili Teklifler</h2>
                <TeklifListesi 
                    teklifler={ilgiliTeklifler}
                    varliklar={varliklar}
                    ayarlar={ayarlar}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    onDurumGuncelle={() => {}}
                    onDosyaGoruntule={() => {}}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default ProjeDetayPage;