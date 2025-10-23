import React, { useState, useMemo } from 'react';
import { HrmMaas, HrmSigorta, Calisan } from '../types';
import PeriodSelector from './PeriodSelector';

interface HrmRaporlarPageProps {
  maaslar: HrmMaas[];
  sigortalar: HrmSigorta[];
  calisanlar: Calisan[];
}

const StatCard: React.FC<{ label: string; value: string | number; colorClass?: string }> = ({ label, value, colorClass = 'text-gray-800' }) => (
    <div className="bg-slate-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
);


const HrmRaporlarPage: React.FC<HrmRaporlarPageProps> = ({ maaslar, sigortalar, calisanlar }) => {
  const [period, setPeriod] = useState<{ year: number, month: number }>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });

  const donemStr = useMemo(() => `${period.year}-${String(period.month).padStart(2, '0')}`, [period]);

  const raporData = useMemo(() => {
    const aktifCalisanIds = new Set(calisanlar.filter(c => c.aktif).map(c => c.id));
    
    const donemMaaslari = maaslar.filter(m => m.donem === donemStr && aktifCalisanIds.has(m.calisanId));
    const donemSigortalari = sigortalar.filter(s => s.donem === donemStr && aktifCalisanIds.has(s.calisanId));

    const toplamBrut = donemMaaslari.reduce((acc, m) => acc + m.brutMaas, 0);
    const toplamAvans = donemMaaslari.reduce((acc, m) => acc + m.avanslar, 0);
    const toplamNet = donemMaaslari.reduce((acc, m) => acc + m.netMaas, 0);
    const odenenMaasSayisi = donemMaaslari.filter(m => m.odendi).length;

    const odenenSigortaSayisi = donemSigortalari.filter(s => s.odendi).length;
    
    const paraBirimi = calisanlar.length > 0 ? calisanlar[0].paraBirimi : 'TRY'; // Assume single currency for simplicity

    return {
        toplamBrut,
        toplamAvans,
        toplamNet,
        maasKaydiSayisi: donemMaaslari.length,
        odenenMaasSayisi,
        sigortaKaydiSayisi: donemSigortalari.length,
        odenenSigortaSayisi,
        paraBirimi
    }

  }, [donemStr, maaslar, sigortalar, calisanlar]);

  return (
    <div className="w-full page-container">
       <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">HRM Raporları</h1>
        <p className="text-slate-500 mt-2 text-lg">Seçilen dönem için personel maliyet ve durum özetleri.</p>
      </header>
      <main className="bg-white p-6 rounded-xl shadow-md">
         <div className="flex justify-center mb-6">
            <PeriodSelector period={period} onPeriodChange={setPeriod} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Maaş Raporları */}
            <div className="md:col-span-2 lg:col-span-2 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-slate-700 mb-4">Maaş Özeti</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Toplam Brüt Maaş" value={`${raporData.toplamBrut.toFixed(2)} ${raporData.paraBirimi}`} colorClass="text-blue-600"/>
                    <StatCard label="Toplam Avans" value={`${raporData.toplamAvans.toFixed(2)} ${raporData.paraBirimi}`} colorClass="text-yellow-600"/>
                    <StatCard label="Toplam Net Maaş" value={`${raporData.toplamNet.toFixed(2)} ${raporData.paraBirimi}`} colorClass="text-green-600"/>
                </div>
            </div>
            {/* Durum Raporları */}
            <div className="bg-gray-50 p-6 rounded-lg">
                 <h2 className="text-xl font-bold text-slate-700 mb-4">Ödeme Durumları</h2>
                 <div className="grid grid-cols-2 gap-4">
                     <StatCard label="Maaş Ödemeleri" value={`${raporData.odenenMaasSayisi} / ${raporData.maasKaydiSayisi}`} />
                     <StatCard label="Sigorta Ödemeleri" value={`${raporData.odenenSigortaSayisi} / ${raporData.sigortaKaydiSayisi}`} />
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default HrmRaporlarPage;
