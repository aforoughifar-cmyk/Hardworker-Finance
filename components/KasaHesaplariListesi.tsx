import React from 'react';
import { KasaHesap } from '../types';
import { TrashIcon, EditIcon } from './icons/AppIcons';

interface KasaHesaplariListesiProps {
  hesaplar: KasaHesap[];
  aktifHesapId?: number | null;
  onHesapSec: (hesap: KasaHesap) => void;
  onDelete: (id: number) => void;
  onEdit: (hesap: KasaHesap) => void;
}

const KasaHesaplariListesi: React.FC<KasaHesaplariListesiProps> = ({ hesaplar, aktifHesapId, onHesapSec, onDelete, onEdit }) => {

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-slate-700 mb-4">Kasa Hesapları</h2>
      {hesaplar.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Henüz kasa hesabı eklenmedi.</p>
      ) : (
        <ul className="space-y-3">
          {hesaplar.map(hesap => (
            <li
              key={hesap.id}
              onClick={() => onHesapSec(hesap)}
              className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                aktifHesapId === hesap.id ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div>
                <p className="font-semibold text-slate-800">{hesap.ad}</p>
                <p className={`text-lg font-bold ${hesap.bakiye >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {hesap.bakiye.toFixed(2)} {hesap.paraBirimi}
                </p>
              </div>
              <div className="flex items-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(hesap); }}
                    className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"
                    aria-label="Düzenle"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(hesap.id); }}
                    className="p-1.5 rounded-full text-red-500 hover:bg-red-100"
                    aria-label="Sil"
                  >
                    <TrashIcon />
                  </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KasaHesaplariListesi;