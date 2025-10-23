import React, { useMemo } from 'react';
import { Ayarlar } from '../../types';

interface EmlakRaporuProps {
  data: any;
  selectedCurrency: string;
  ayarlar: Ayarlar;
}

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

const EmlakRaporu: React.FC<EmlakRaporuProps> = ({ data, selectedCurrency, ayarlar }) => {
    const stats = useMemo(() => {
        const { emlaklar } = data;
        const odemeGeliriByCurrency: { [key: string]: number } = {};

        data.emlakOdemeler
            .filter((o: any) => selectedCurrency === 'all' || o.paraBirimi === selectedCurrency)
            .forEach((o: any) => {
                if (!odemeGeliriByCurrency[o.paraBirimi]) {
                    odemeGeliriByCurrency[o.paraBirimi] = 0;
                }
                odemeGeliriByCurrency[o.paraBirimi] += o.tutar;
            });
            
        return {
            satilik: emlaklar.filter((e: any) => e.durum === 'satilik').length,
            kiralik: emlaklar.filter((e: any) => e.durum === 'kiralik').length,
            satildi: emlaklar.filter((e: any) => e.durum === 'satildi').length,
            kiralandi: emlaklar.filter((e: any) => e.durum === 'kiralandi').length,
            odemeGeliri: Object.entries(odemeGeliriByCurrency),
        }
    }, [data, selectedCurrency]);

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Emlak Durum Özeti</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Satılık" value={stats.satilik} />
            <StatCard label="Kiralık" value={stats.kiralik} />
            <StatCard label="Satıldı" value={stats.satildi} />
            <StatCard label="Kiralandı" value={stats.kiralandi} />
        </div>
         <h2 className="text-xl font-bold text-gray-800 mt-6">Finansal Özet</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.odemeGeliri.map(([currency, total]) => {
                const sembol = ayarlar.paraBirimleri.find(p => p.kod === currency)?.sembol || currency;
                return (
                    <div key={currency} className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Dönem İçi Ödeme Geliri ({currency})</p>
                        <p className="text-2xl font-bold text-green-800">{sembol}{total.toLocaleString('tr-TR')}</p>
                    </div>
                )
            })}
             {stats.odemeGeliri.length === 0 && <p className="text-gray-500 col-span-full text-center">Bu dönem için ödeme geliri yok.</p>}
         </div>
    </div>
  );
};

export default EmlakRaporu;