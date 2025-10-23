import React, { useMemo } from 'react';
import { Ayarlar } from '../../types';

interface GenelBakisRaporuProps {
  data: any;
  selectedCurrency: string;
  ayarlar: Ayarlar;
}

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="p-6 bg-indigo-50 rounded-lg text-center">
    <h3 className="text-base font-medium text-indigo-500">{title}</h3>
    <p className="mt-1 text-4xl font-bold text-indigo-900">{value}</p>
  </div>
);

const GenelBakisRaporu: React.FC<GenelBakisRaporuProps> = ({ data, selectedCurrency, ayarlar }) => {
    
    const statsByCurrency = useMemo(() => {
        const currencyStats: { [key: string]: { gelir: number; gider: number } } = {};
        
        // FIX: Explicitly set Map types to resolve type inference issue where .get() returns `unknown`.
        const kasaHesapCurrencyMap = new Map<number, string>(data.kasaHesaplar.map((h: any) => [h.id, h.paraBirimi]));
        // FIX: Explicitly set Map types to resolve type inference issue where .get() returns `unknown`.
        const calisanCurrencyMap = new Map<number, string>(data.calisanlar.map((c: any) => [c.id, c.paraBirimi]));
        
        const processTx = (type: 'gelir' | 'gider', amount: number, currency: string | undefined) => {
            if (!currency || (selectedCurrency !== 'all' && selectedCurrency !== currency)) return;
            if (!currencyStats[currency]) currencyStats[currency] = { gelir: 0, gider: 0 };
            currencyStats[currency][type] += amount;
        };

        // Gelirler
        data.faturalar.filter((f: any) => f.tip === 'gelir').forEach((f: any) => processTx('gelir', f.toplamTutar, f.paraBirimi));
        data.kasaIslemler.filter((i: any) => i.tip === 'gelir').forEach((i: any) => processTx('gelir', i.tutar, kasaHesapCurrencyMap.get(i.hesapId)));

        // Giderler
        data.faturalar.filter((f: any) => f.tip === 'gider').forEach((f: any) => processTx('gider', f.toplamTutar, f.paraBirimi));
        data.kasaIslemler.filter((i: any) => i.tip === 'gider').forEach((i: any) => processTx('gider', i.tutar, kasaHesapCurrencyMap.get(i.hesapId)));
        data.maaslar.forEach((m: any) => processTx('gider', m.netMaas, calisanCurrencyMap.get(m.calisanId)));

        return Object.entries(currencyStats);

    }, [data, selectedCurrency, ayarlar]);

  return (
    <div className="space-y-6">
      {statsByCurrency.map(([currency, stats]) => (
        <div key={currency}>
            <h2 className="text-xl font-bold text-gray-700 mb-2">{currency} Özeti</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title={`Toplam Gelir (${currency})`} value={stats.gelir.toLocaleString('tr-TR')} />
                <StatCard title={`Toplam Gider (${currency})`} value={stats.gider.toLocaleString('tr-TR')} />
                <StatCard title={`Net Durum (${currency})`} value={(stats.gelir - stats.gider).toLocaleString('tr-TR')} />
                <StatCard title="Aktif Proje Sayısı" value={data.projeler.length} />
            </div>
        </div>
      ))}
       {statsByCurrency.length === 0 && <p className="text-center py-8 text-gray-500">Seçilen kriterlere uygun finansal veri bulunamadı.</p>}
    </div>
  );
};

export default GenelBakisRaporu;