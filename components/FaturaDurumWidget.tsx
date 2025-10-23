
import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Fatura, Ayarlar } from '../types';

interface FaturaDurumWidgetProps {
  faturalar: Fatura[];
  ayarlar: Ayarlar;
}

const FaturaDurumWidget: React.FC<FaturaDurumWidgetProps> = ({ faturalar, ayarlar }) => {
  const durumSayilari = useMemo(() => {
    const sayilar: { [key: string]: number } = {};
    for (const durum of ayarlar.odemeDurumlari) {
      sayilar[durum] = 0;
    }
    for (const fatura of faturalar) {
      if (sayilar[fatura.odemeDurumu] !== undefined) {
        sayilar[fatura.odemeDurumu]++;
      }
    }
    return Object.entries(sayilar);
  }, [faturalar, ayarlar.odemeDurumlari]);
  
  const renkEslestir = (durum: string) => {
    switch(durum.toLowerCase()){
        case 'ödendi':
            return 'border-green-500';
        case 'ödenmedi':
            return 'border-red-500';
        case 'kısmen ödendi':
            return 'border-yellow-500';
        default:
            return 'border-slate-500';
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
       <h3 className="text-xl font-bold text-slate-700 mb-4">Fatura Durum Özeti</h3>
       <div className={`grid grid-cols-2 md:grid-cols-${Math.max(durumSayilari.length, 2)} gap-4`}>
        {durumSayilari.map(([durum, sayi]) => (
          <div key={durum} className={`p-4 rounded-lg border-l-4 ${renkEslestir(durum)} bg-slate-50`}>
            <p className="text-sm font-medium text-slate-500">{durum}</p>
            <p className="text-3xl font-bold text-slate-800">{sayi}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaturaDurumWidget;
