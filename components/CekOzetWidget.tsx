

import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Cek, Ayarlar } from '../types';
// FIX: Corrected import path for AppIcons
import { ChequeIcon } from './icons/AppIcons'; 

interface CekOzetWidgetProps {
  cekler: Cek[];
  ayarlar: Ayarlar;
}

const CekOzetWidget: React.FC<CekOzetWidgetProps> = ({ cekler, ayarlar }) => {

  const durumSayilari = useMemo(() => {
    const sayilar: { [key: string]: { sayi: number; renk: string } } = {};
    // FIX: Corrected typo 'cekDurumlari' to access correct property.
    for (const durum of ayarlar.cekDurumlari) {
      sayilar[durum.durum] = { sayi: 0, renk: durum.renk };
    }
    for (const cek of cekler) {
      if (sayilar[cek.durum]) {
        sayilar[cek.durum].sayi++;
      }
    }
    return Object.entries(sayilar);
  }, [cekler, ayarlar.cekDurumlari]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md col-span-1 md:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
          <ChequeIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Çek Durum Özeti</p>
          <p className="text-2xl font-bold text-slate-800">{cekler.length} Toplam Çek</p>
        </div>
      </div>
      
       <div className="space-y-3">
        {durumSayilari.length > 0 ? (
          durumSayilari.map(([durum, {sayi, renk}]) => (
            <div key={durum} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: renk}}></span>
                    <span className="text-sm font-medium text-slate-600">{durum}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{sayi} adet</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 text-center pt-4">Görüntülenecek çek durumu yok.</p>
        )}
      </div>
    </div>
  );
};

export default CekOzetWidget;
