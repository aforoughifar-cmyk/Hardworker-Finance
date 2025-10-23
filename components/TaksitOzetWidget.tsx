
import React, { useMemo } from 'react';
import { Taksit } from '../types';
import { PieChartIcon } from './icons/AppIcons';

interface TaksitOzetWidgetProps {
  taksitler: Taksit[];
}

const StatCard: React.FC<{ label: string; value: number | string; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className={`p-3 rounded-lg border-l-4 ${colorClass} bg-slate-50`}>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
);


const TaksitOzetWidget: React.FC<TaksitOzetWidgetProps> = ({ taksitler }) => {
    const ozet = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        const oneWeekStr = oneWeekFromNow.toISOString().split('T')[0];

        const toplam = taksitler.length;
        const odenen = taksitler.filter(t => t.durum === 'Ödendi').length;
        const vadesiGecen = taksitler.filter(t => t.vadeTarihi < today && t.durum !== 'Ödendi').length;
        const yaklasan = taksitler.filter(t => t.vadeTarihi >= today && t.vadeTarihi <= oneWeekStr && t.durum !== 'Ödendi').length;
        
        return { toplam, odenen, vadesiGecen, yaklasan };
    }, [taksitler]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-100 text-teal-600">
                <PieChartIcon />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-700">Taksit Özeti</h3>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
           <StatCard label="Toplam Taksit" value={ozet.toplam} colorClass="border-slate-500" />
           <StatCard label="Ödenen" value={ozet.odenen} colorClass="border-emerald-500" />
           <StatCard label="Vadesi Geçen" value={ozet.vadesiGecen} colorClass="border-red-500" />
           <StatCard label="Yaklaşan (7 gün)" value={ozet.yaklasan} colorClass="border-amber-500" />
        </div>
    </div>
  );
};

export default TaksitOzetWidget;