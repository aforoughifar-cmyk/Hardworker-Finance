
import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Proje, Fatura, Ayarlar } from '../types';
// FIX: Corrected import path for AppIcons
import { BriefcaseIcon } from './icons/AppIcons';

interface ProjeOzetWidgetProps {
  projeler: Proje[];
  faturalar: Fatura[];
  ayarlar: Ayarlar;
}

const ProjeOzetWidget: React.FC<ProjeOzetWidgetProps> = ({ projeler, faturalar, ayarlar }) => {
  const projeSayisi = projeler.length;

  const ortalamaIlerleme = useMemo(() => {
    if (projeSayisi === 0) return 0;
    const toplamIlerleme = projeler.reduce((acc, p) => acc + p.ilerlemeYuzdesi, 0);
    return Math.round(toplamIlerleme / projeSayisi);
  }, [projeler, projeSayisi]);

  const toplamProjeGiderleri = useMemo(() => {
    const giderler: { [key: string]: number } = {};
    const projeFaturalari = faturalar.filter(f => f.projeId && f.tip === 'gider');

    for (const fatura of projeFaturalari) {
      if (!giderler[fatura.paraBirimi]) {
        giderler[fatura.paraBirimi] = 0;
      }
      giderler[fatura.paraBirimi] += fatura.toplamTutar;
    }
    return Object.entries(giderler);
  }, [faturalar]);
  
  const getParaBirimiSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col col-span-1 md:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
          <BriefcaseIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Proje Özeti</p>
          <p className="text-2xl font-bold text-slate-800">{projeSayisi} Proje</p>
        </div>
      </div>
      
      <div className="space-y-3 mt-auto">
        <div>
           <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-semibold text-slate-500">Ortalama İlerleme</span>
             <span className="text-xs font-bold text-sky-600">{ortalamaIlerleme}%</span>
           </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-sky-600 h-2.5 rounded-full" style={{width: `${ortalamaIlerleme}%`}}></div>
            </div>
        </div>

        <div>
            <span className="text-xs font-semibold text-slate-500">Toplam Proje Giderleri</span>
             {toplamProjeGiderleri.length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {toplamProjeGiderleri.map(([kod, tutar]) => (
                        <p key={kod} className="text-sm font-bold text-red-600">
                           {getParaBirimiSembolu(kod)}{tutar.toFixed(2)}
                        </p>
                    ))}
                </div>
             ) : (
                <p className="text-sm text-slate-400 mt-1">Henüz gider yok.</p>
             )}
        </div>
      </div>
    </div>
  );
};

export default ProjeOzetWidget;
