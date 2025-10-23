
import React from 'react';
// FIX: Corrected import path for types
import { TakvimEtkinligi } from '../types';
import TrashIcon from './icons/TrashIcon';

interface EtkinlikListesiProps {
  etkinlikler: TakvimEtkinligi[];
  etkinlikSil: (id: string) => void;
}

const EtkinlikListesi: React.FC<EtkinlikListesiProps> = ({ etkinlikler, etkinlikSil }) => {
  const today = new Date().toISOString().split('T')[0];

  const bugununEtkinlikleri = etkinlikler
    .filter(e => e.tarih >= today)
    .sort((a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime())
    .slice(0, 10); // Show upcoming 10 events

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">Yaklaşan Etkinlikler</h3>
      {bugununEtkinlikleri.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Yaklaşan bir etkinlik bulunmamaktadır.</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {bugununEtkinlikleri.map(etkinlik => (
            <li key={etkinlik.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm text-slate-800">{etkinlik.aciklama}</p>
                <p className="text-xs text-slate-500">
                  {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button 
                onClick={() => etkinlikSil(etkinlik.id)}
                className="p-1.5 rounded-full text-red-500 hover:bg-red-100"
                aria-label="Etkinliği Sil"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EtkinlikListesi;
