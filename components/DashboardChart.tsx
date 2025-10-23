
import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Fatura, Ayarlar } from '../types';

interface DashboardChartProps {
  faturalar: Fatura[];
  ayarlar: Ayarlar;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ faturalar, ayarlar }) => {
  const chartData = useMemo(() => {
    const data: { [key: string]: { gelir: number; gider: number; sembol: string } } = {};

    for (const paraBirimi of ayarlar.paraBirimleri) {
      data[paraBirimi.kod] = { gelir: 0, gider: 0, sembol: paraBirimi.sembol };
    }

    for (const fatura of faturalar) {
      if (data[fatura.paraBirimi]) {
        if (fatura.tip === 'gelir') {
          data[fatura.paraBirimi].gelir += fatura.toplamTutar;
        } else {
          data[fatura.paraBirimi].gider += fatura.toplamTutar;
        }
      }
    }
    return Object.entries(data).filter(([, val]) => val.gelir > 0 || val.gider > 0);
  }, [faturalar, ayarlar.paraBirimleri]);

  if (chartData.length === 0) {
    return (
       <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-slate-700 mb-2">Finansal Özet</h3>
        <p className="text-slate-500 text-center py-8">Grafik için görüntülenecek fatura verisi yok.</p>
      </div>
    )
  }

  const maxGelir = Math.max(...chartData.map(d => d[1].gelir));
  const maxGider = Math.max(...chartData.map(d => d[1].gider));
  const maxDeger = Math.max(maxGelir, maxGider, 1); // 0'a bölünmeyi önle

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-slate-700 mb-4">Finansal Özet (Para Birimine Göre)</h3>
      <div className="space-y-6">
        {chartData.map(([kod, { gelir, gider, sembol }]) => (
          <div key={kod}>
            <h4 className="font-semibold text-slate-600 mb-2">{kod} - {sembol}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-emerald-600 w-12 text-right">Gelir</span>
                <div className="w-full bg-emerald-100 rounded-full h-6">
                  <div 
                    className="bg-emerald-500 h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold"
                    style={{ width: `${(gelir / maxDeger) * 100}%` }}
                  >
                   {gelir > 0 ? `${sembol}${gelir.toFixed(2)}` : ''}
                  </div>
                </div>
              </div>
               <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-red-600 w-12 text-right">Gider</span>
                <div className="w-full bg-red-100 rounded-full h-6">
                  <div 
                    className="bg-red-500 h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold"
                    style={{ width: `${(gider / maxDeger) * 100}%` }}
                  >
                   {gider > 0 ? `${sembol}${gider.toFixed(2)}` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardChart;
