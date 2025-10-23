import React, { useMemo } from 'react';
import { Calisan } from '../types';

interface CalismaIzniBitenlerWidgetProps {
  calisanlar: Calisan[];
}

const CalismaIzniBitenlerWidget: React.FC<CalismaIzniBitenlerWidgetProps> = ({ calisanlar }) => {
  const yaklasanIzinler = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setDate(today.getDate() + 30);
    
    return calisanlar
      .filter(c => 
        c.aktif && 
        c.calismaIzniVarMi && 
        c.calismaIzniBitis
      )
      .map(c => {
        // FIX: Parse date string as local time to avoid timezone issues.
        const [year, month, day] = c.calismaIzniBitis!.split('-').map(Number);
        const izinBitisTarihi = new Date(year, month - 1, day);
        return {
          ...c,
          izinBitisTarihi
        };
      })
      .filter(c => 
        c.izinBitisTarihi >= today && c.izinBitisTarihi <= oneMonthFromNow
      )
      .sort((a, b) => a.izinBitisTarihi.getTime() - b.izinBitisTarihi.getTime());
  }, [calisanlar]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Yaklaşan Çalışma İzni Bitişleri (30 Gün)</h3>
      {yaklasanIzinler.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Yaklaşan çalışma izni bitişi bulunmamaktadır.</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {yaklasanIzinler.map(calisan => (
            <li key={calisan.id} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-slate-800">{calisan.isim} {calisan.soyisim}</p>
                    <p className="text-sm font-bold text-red-600">{calisan.izinBitisTarihi.toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalismaIzniBitenlerWidget;