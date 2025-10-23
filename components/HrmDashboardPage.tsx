import React, { useMemo } from 'react';
import { Calisan, Avans, HrmMaas } from '../types';
import { UsersIcon, ReceiptIcon } from './icons/AppIcons';

interface HrmDashboardPageProps {
  calisanlar: Calisan[];
  avanslar: Avans[];
  maaslar: HrmMaas[];
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 ${color}`}>
        {icon}
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);


const HrmDashboardPage: React.FC<HrmDashboardPageProps> = ({ calisanlar, avanslar, maaslar }) => {
    const stats = useMemo(() => {
        const aktifCalisanSayisi = calisanlar.filter(c => c.aktif).length;
        
        const thisMonth = new Date().toISOString().slice(0, 7);
        const buAyinAvanslari = avanslar.filter(a => a.tarih.startsWith(thisMonth));
        const toplamAvans = buAyinAvanslari.reduce((sum, a) => sum + a.tutar, 0);
        
        return {
            aktifCalisanSayisi,
            buAyinAvansSayisi: buAyinAvanslari.length,
            toplamAvans
        }
    }, [calisanlar, avanslar]);

  return (
    <div className="w-full page-container">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Personel Yönetim Paneli</h1>
        <p className="text-slate-500 mt-2 text-lg">Personel durumuna genel bakış.</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            icon={<UsersIcon />} 
            label="Aktif Çalışan Sayısı" 
            value={stats.aktifCalisanSayisi}
            color="border-green-500"
        />
        <StatCard 
            icon={<ReceiptIcon />} 
            label="Bu Ay Verilen Avans" 
            value={`${stats.buAyinAvansSayisi} adet`}
            color="border-yellow-500"
        />
        <StatCard 
            icon={<ReceiptIcon />} 
            label="Bu Ayki Avans Toplamı" 
            value={`${stats.toplamAvans.toFixed(2)}`}
            color="border-blue-500"
        />
      </main>
    </div>
  );
};

export default HrmDashboardPage;
