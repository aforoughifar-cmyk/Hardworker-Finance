import React from 'react';
import { Ayarlar } from '../types';

interface SummaryItem {
  [key: string]: any;
}

interface CurrencySummaryWidgetProps {
  items: SummaryItem[];
  ayarlar: Ayarlar;
  title: string;
  tutarField: string;
  paraBirimiField: string;
  tipField?: string; // e.g., 'gelir' | 'gider'
}

const CurrencySummaryWidget: React.FC<CurrencySummaryWidgetProps> = ({ items, ayarlar, title, tutarField, paraBirimiField, tipField }) => {
  const summary: { [key: string]: { gelir: number; gider: number } } = {};

  // Initialize summary for all available currencies
  for (const currency of ayarlar.paraBirimleri) {
    summary[currency.kod] = { gelir: 0, gider: 0 };
  }

  // Calculate totals
  for (const item of items) {
    const currency = item[paraBirimiField];
    const amount = item[tutarField];
    
    if (summary[currency] && typeof amount === 'number') {
      if (tipField && item[tipField] === 'gelir') {
        summary[currency].gelir += amount;
      } else if (tipField && item[tipField] === 'gider') {
        summary[currency].gider += amount;
      } else { // If no type field, treat everything as a positive total (gelir)
        summary[currency].gelir += amount; 
      }
    }
  }

  const hasGelirData = Object.values(summary).some(s => s.gelir > 0);
  const hasGiderData = Object.values(summary).some(s => s.gider > 0);
  
  // Filter out currencies that have no activity at all
  const relevantCurrencies = Object.entries(summary).filter(([, totals]) => totals.gelir > 0 || totals.gider > 0);

  if(relevantCurrencies.length === 0) {
      return null; // Don't render anything if there's no data to show
  }

  const showGelir = tipField ? hasGelirData : true;
  const showGider = tipField ? hasGiderData : false;

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
            <thead className="bg-slate-50">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Para Birimi</th>
                    {showGelir && <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">{tipField ? 'Toplam Gelir' : 'Toplam Tutar'}</th>}
                    {showGider && <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Toplam Gider</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {relevantCurrencies.map(([kod, totals]) => {
                    const sembol = ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
                    return (
                        <tr key={kod}>
                            <td className="px-4 py-3 font-semibold text-slate-700">{kod}</td>
                            {showGelir && <td className="px-4 py-3 text-right font-mono text-emerald-600">{sembol}{totals.gelir.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>}
                            {showGider && <td className="px-4 py-3 text-right font-mono text-red-600">{sembol}{totals.gider.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>}
                        </tr>
                    )
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencySummaryWidget;
