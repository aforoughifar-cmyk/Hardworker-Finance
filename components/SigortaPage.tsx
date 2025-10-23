import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { HrmSigorta, Calisan } from '../types';
import PeriodSelector from './PeriodSelector';

interface SigortaPageProps {
  sigortalar: HrmSigorta[];
  calisanlar: Calisan[];
  onUpdate: (yeniSigortalar: HrmSigorta[]) => void;
  onEtkinlikEkle: (aciklama: string, tarih: string, tip: 'manuel') => void;
}

const SigortaPage: React.FC<SigortaPageProps> = ({ sigortalar, calisanlar, onUpdate, onEtkinlikEkle }) => {
  const [period, setPeriod] = useState<{ year: number, month: number }>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });

  const donemStr = useMemo(() => `${period.year}-${String(period.month).padStart(2, '0')}`, [period]);

  // Ensure records exist for the selected period
  useEffect(() => {
    const aktifCalisanlar = calisanlar.filter(c => c.aktif);
    const mevcutKayitlar = new Set(sigortalar.filter(s => s.donem === donemStr).map(s => s.calisanId));
    
    const eksikKayitlar: HrmSigorta[] = [];
    let maxId = Math.max(0, ...sigortalar.map(s => s.id));

    aktifCalisanlar.forEach(calisan => {
      if (!mevcutKayitlar.has(calisan.id)) {
        eksikKayitlar.push({
          id: ++maxId,
          calisanId: calisan.id,
          donem: donemStr,
          odendi: false,
          odemeTarihi: null,
        });
      }
    });

    if (eksikKayitlar.length > 0) {
      onUpdate([...sigortalar, ...eksikKayitlar]);
    }
  }, [donemStr, calisanlar, sigortalar, onUpdate]);

  const donemSigortalari = useMemo(() => {
      const calisanMap = new Map(calisanlar.map(c => [c.id, c]));
      return sigortalar
          .filter(s => s.donem === donemStr)
          .map(s => ({ ...s, calisan: calisanMap.get(s.calisanId) }))
          .filter(s => s.calisan?.aktif); // Only show active employees for the period
  }, [donemStr, sigortalar, calisanlar]);

  const handleToggle = (sigortaId: number) => {
    onUpdate(produce(sigortalar, draft => {
        const sigorta = draft.find(s => s.id === sigortaId);
        if(sigorta){
            const wasPaid = sigorta.odendi;
            sigorta.odendi = !sigorta.odendi;
            sigorta.odemeTarihi = sigorta.odendi ? new Date().toISOString().split('T')[0] : null;

            if (!wasPaid && sigorta.odendi) {
                const calisan = calisanlar.find(c => c.id === sigorta.calisanId);
                if (calisan && sigorta.odemeTarihi) {
                    const aciklama = `${calisan.isim} ${calisan.soyisim} - ${sigorta.donem} sigortası ödendi.`;
                    onEtkinlikEkle(aciklama, sigorta.odemeTarihi, 'manuel');
                }
            }
        }
    }));
  };
  
  const handleMarkAll = (odendi: boolean) => {
    const guncelTarih = new Date().toISOString().split('T')[0];
    onUpdate(produce(sigortalar, draft => {
        donemSigortalari.forEach(donemKaydi => {
            const sigorta = draft.find(s => s.id === donemKaydi.id);
            if(sigorta) {
                const wasPaid = sigorta.odendi;
                sigorta.odendi = odendi;
                sigorta.odemeTarihi = odendi ? guncelTarih : null;

                 if (!wasPaid && sigorta.odendi) {
                    const calisan = calisanlar.find(c => c.id === sigorta.calisanId);
                    if (calisan && sigorta.odemeTarihi) {
                        const aciklama = `${calisan.isim} ${calisan.soyisim} - ${sigorta.donem} sigortası ödendi.`;
                        onEtkinlikEkle(aciklama, sigorta.odemeTarihi, 'manuel');
                    }
                }
            }
        });
    }));
  };

  return (
    <div className="w-full page-container">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Aylık Sigorta Takibi</h1>
        <p className="text-slate-500 mt-2 text-lg">Seçilen dönem için çalışanların sigorta ödeme durumlarını yönetin.</p>
      </header>
      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <PeriodSelector period={period} onPeriodChange={setPeriod} />
            <div className="flex items-center gap-2">
                <button onClick={() => handleMarkAll(true)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Tümünü Ödendi İşaretle</button>
                <button onClick={() => handleMarkAll(false)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Tümünü Ödenmedi İşaretle</button>
            </div>
        </div>
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Çalışan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ödeme Durumu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ödeme Tarihi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {donemSigortalari.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{s.calisan ? `${s.calisan.isim} ${s.calisan.soyisim}` : 'Bilinmiyor'}</td>
                        <td className="px-6 py-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={s.odendi} onChange={() => handleToggle(s.id)} className="sr-only peer"/>
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">{s.odendi ? 'Ödendi' : 'Ödenmedi'}</span>
                            </label>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{s.odemeTarihi ? new Date(s.odemeTarihi).toLocaleDateString('tr-TR') : '-'}</td>
                    </tr>
                ))}
            </tbody>
           </table>
           {donemSigortalari.length === 0 && <p className="text-center py-12 text-slate-500">Bu dönem için aktif çalışan bulunamadı.</p>}
        </div>
      </main>
    </div>
  );
};

export default SigortaPage;