
import React, { useMemo } from 'react';
import { Emlak } from '../types';
import { HomeModernIcon } from './icons/AppIcons';

interface EmlakOzetWidgetProps {
  emlaklar: Emlak[];
}

const StatItem: React.FC<{ label: string; value: number; }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{value} adet</span>
    </div>
);


const EmlakOzetWidget: React.FC<EmlakOzetWidgetProps> = ({ emlaklar }) => {
    const ozet = useMemo(() => {
        return {
            toplam: emlaklar.length,
            satilik: emlaklar.filter(e => e.durum === 'satilik').length,
            kiralik: emlaklar.filter(e => e.durum === 'kiralik').length,
            satildi: emlaklar.filter(e => e.durum === 'satildi').length,
            kiralandi: emlaklar.filter(e => e.durum === 'kiralandi').length,
        };
    }, [emlaklar]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
                <HomeModernIcon />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-700">Emlak Özeti</h3>
                <p className="text-xs text-slate-500">{ozet.toplam} Toplam Birim</p>
            </div>
        </div>
        <div className="space-y-3">
            <StatItem label="Satılık" value={ozet.satilik} />
            <StatItem label="Kiralık" value={ozet.kiralik} />
            <StatItem label="Satılan" value={ozet.satildi} />
            <StatItem label="Kiralanan" value={ozet.kiralandi} />
        </div>
    </div>
  );
};

export default EmlakOzetWidget;