import React, { useMemo } from 'react';
import { Ayarlar } from '../../types';

interface PersonelRaporuProps {
  data: any;
  selectedCurrency: string;
  ayarlar: Ayarlar;
}

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);


const PersonelRaporu: React.FC<PersonelRaporuProps> = ({ data, selectedCurrency, ayarlar }) => {
    const stats = useMemo(() => {
        const { calisanlar, maaslar } = data;
        // FIX: Explicitly set Map types to resolve type inference issue where .get() returns `unknown`.
        const calisanCurrencyMap = new Map<number, string>(calisanlar.map((c: any) => [c.id, c.paraBirimi]));
        const maasGideriByCurrency: { [key: string]: number } = {};
        
        maaslar
            .filter((m: any) => {
                const currency = calisanCurrencyMap.get(m.calisanId);
                return selectedCurrency === 'all' || currency === selectedCurrency;
            })
            .forEach((m: any) => {
                const currency = calisanCurrencyMap.get(m.calisanId);
                if (currency) {
                    if (!maasGideriByCurrency[currency]) {
                        maasGideriByCurrency[currency] = 0;
                    }
                    maasGideriByCurrency[currency] += m.netMaas;
                }
            });

        return {
            aktifCalisan: calisanlar.filter((c: any) => c.aktif).length,
            toplamMaasGideri: Object.entries(maasGideriByCurrency)
        }
    }, [data, selectedCurrency]);

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Personel Özet</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Aktif Çalışan Sayısı" value={stats.aktifCalisan} />
            {stats.toplamMaasGideri.map(([currency, total]) => {
                const sembol = ayarlar.paraBirimleri.find(p => p.kod === currency)?.sembol || currency;
                return (
                    <div key={currency} className="md:col-span-2 bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600">Dönem İçi Maaş Gideri ({currency})</p>
                        <p className="text-2xl font-bold text-red-800">{sembol}{total.toLocaleString('tr-TR')}</p>
                    </div>
                )
            })}
             {stats.toplamMaasGideri.length === 0 && (
                <div className="md:col-span-2 bg-red-50 p-4 rounded-lg">
                     <p className="text-sm text-red-600">Dönem İçi Maaş Gideri</p>
                     <p className="text-2xl font-bold text-red-800">0</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default PersonelRaporu;