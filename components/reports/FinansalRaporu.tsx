import React, { useMemo } from 'react';
import BarChart from '../charts/BarChart';
import { Ayarlar } from '../../types';

interface FinansalRaporuProps {
  data: any;
  selectedCurrency: string;
  ayarlar: Ayarlar;
}

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className={`p-4 bg-gray-50 rounded-lg border-l-4 ${color}`}>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const FinansalRaporu: React.FC<FinansalRaporuProps> = ({ data, selectedCurrency, ayarlar }) => {

  const { statsByCurrency, monthlyData } = useMemo(() => {
    const currencyStats: { [key: string]: { gelir: number; gider: number } } = {};
    ayarlar.paraBirimleri.forEach(p => {
        currencyStats[p.kod] = { gelir: 0, gider: 0 };
    });
    
    const kasaHesapCurrencyMap = new Map(data.kasaHesaplar.map((h: any) => [h.id, h.paraBirimi]));
    const calisanCurrencyMap = new Map(data.calisanlar.map((c: any) => [c.id, c.paraBirimi]));
    
    const allTransactions = [
        ...data.faturalar.map((f:any) => ({ date: f.faturaTarihi, amount: f.toplamTutar, type: f.tip, currency: f.paraBirimi })),
        ...data.kasaIslemler.map((i:any) => ({ date: i.tarih, amount: i.tutar, type: i.tip, currency: kasaHesapCurrencyMap.get(i.hesapId) })),
        ...data.emlakOdemeler.map((o:any) => ({ date: o.tarih, amount: o.tutar, type: 'gider', currency: o.paraBirimi })),
        ...data.komisyonlar.map((k:any) => ({ date: k.tarih, amount: k.netKomisyonTutari, type: 'gider', currency: k.paraBirimi })),
        ...data.maaslar.map((m:any) => ({ date: `${m.donem}-01`, amount: m.netMaas, type: 'gider', currency: calisanCurrencyMap.get(m.calisanId) })),
    ];
    
    allTransactions.forEach(t => {
        if (!t.currency || !currencyStats[t.currency]) return;
        
        if(t.type === 'gelir') currencyStats[t.currency].gelir += t.amount;
        else currencyStats[t.currency].gider += t.amount;
    });

    // Monthly breakdown for chart
    const monthly: { [key: string]: { gelir: number; gider: number } } = {};
    const monthFormatter = new Intl.DateTimeFormat('tr', { month: 'short', year: '2-digit' });
    
    allTransactions
      .filter(t => selectedCurrency === 'all' || t.currency === selectedCurrency)
      .forEach(t => {
        const key = monthFormatter.format(new Date(t.date));
        if(!monthly[key]) monthly[key] = { gelir: 0, gider: 0 };
        if(t.type === 'gelir') monthly[key].gelir += t.amount;
        else monthly[key].gider += t.amount;
    });
    
    const chartData = Object.entries(monthly).map(([label, values]) => ({
      label,
      values: [
        { value: values.gelir, color: '#22c55e' },
        { value: values.gider, color: '#ef4444' },
      ]
    })).sort((a, b) => {
        const [aMonth, aYear] = a.label.split(' ');
        const [bMonth, bYear] = b.label.split(' ');
        const monthOrder = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        if (aYear !== bYear) return Number(aYear) - Number(bYear);
        return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    const finalStats = selectedCurrency === 'all'
        ? Object.entries(currencyStats).filter(([, s]) => s.gelir > 0 || s.gider > 0)
        : Object.entries(currencyStats).filter(([c]) => c === selectedCurrency);

    return {
      statsByCurrency: finalStats,
      monthlyData: chartData
    };
  }, [data, selectedCurrency, ayarlar]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Finansal Özet</h2>
       {statsByCurrency.map(([currency, stats]) => {
         const netKar = stats.gelir - stats.gider;
         const sembol = ayarlar.paraBirimleri.find(p => p.kod === currency)?.sembol || currency;
         return (
            <div key={currency} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <StatCard title={`Toplam Gelir (${currency})`} value={`${sembol}${stats.gelir.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="border-green-500" />
                <StatCard title={`Toplam Gider (${currency})`} value={`${sembol}${stats.gider.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="border-red-500" />
                <StatCard title={`Net Kar (${currency})`} value={`${sembol}${netKar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color={netKar >= 0 ? "border-blue-500" : "border-red-500"} />
            </div>
         );
       })}
       {statsByCurrency.length === 0 && <p className="text-center py-4 text-gray-500">Seçilen para birimi için veri bulunamadı.</p>}

      <div>
        <h2 className="text-xl font-bold text-gray-800 my-4">Aylık Gelir/Gider Dağılımı ({selectedCurrency === 'all' ? 'Tümü' : selectedCurrency})</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <BarChart data={monthlyData} />
        </div>
        <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-700">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Gelir</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Gider</div>
        </div>
      </div>
    </div>
  );
};

export default FinansalRaporu;