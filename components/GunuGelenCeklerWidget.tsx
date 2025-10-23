
import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Cek, Varlik, Ayarlar } from '../types';

interface GunuGelenCeklerWidgetProps {
  cekler: Cek[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
}

const GunuGelenCeklerWidget: React.FC<GunuGelenCeklerWidgetProps> = ({ cekler, varliklar, ayarlar }) => {
  const gunuGelenCekler = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    return cekler
      .filter(cek => {
        // Parse the date string 'YYYY-MM-DD' as local time to avoid timezone issues.
        const [year, month, day] = cek.vadeTarihi.split('-').map(Number);
        const vadeTarihi = new Date(year, month - 1, day);

        return vadeTarihi >= today && vadeTarihi <= oneWeekFromNow && cek.durum !== 'Ödendi' && cek.durum !== 'İptal';
      })
      .sort((a, b) => new Date(a.vadeTarihi).getTime() - new Date(b.vadeTarihi).getTime());
  }, [cekler]);

  const getVarlikAdi = (id: number) => {
    const varlik = varliklar.find(v => v.id === id);
    return varlik?.type === 'firma' ? varlik.sirketAdi : 'Bilinmiyor';
  };

  const getParaBirimiSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('tr-TR');
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Vadesi Yaklaşan Çekler (7 Gün)</h3>
      {gunuGelenCekler.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Vadesi yaklaşan çek bulunmamaktadır.</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {gunuGelenCekler.map(cek => (
            <li key={cek.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-sky-700">{formatDate(cek.vadeTarihi)}</p>
                    <p className="text-sm text-slate-600">{getVarlikAdi(cek.varlikId)}</p>
                </div>
                <p className="font-bold text-slate-800 text-sm">
                    {getParaBirimiSembolu(cek.paraBirimi)}{cek.tutar.toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GunuGelenCeklerWidget;
