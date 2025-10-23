import React from 'react';
import { Emlak, Proje } from '../types';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';

interface EmlakListesiProps {
  emlaklar: Emlak[];
  projeler: Proje[];
  onDelete: (id: number) => void;
  onEdit: (emlak: Emlak) => void;
  onRowClick: (emlak: Emlak) => void;
}

const EmlakListesi: React.FC<EmlakListesiProps> = ({ emlaklar, projeler, onDelete, onEdit, onRowClick }) => {
  const getProjeAdi = (projeId: number) => {
    return projeler.find(p => p.id === projeId)?.ad || 'Bilinmiyor';
  };

  if (emlaklar.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Görüntülenecek bir emlak bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Proje</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Blok</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kat</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Daire No</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Metraj</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Eylemler</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {emlaklar.map((emlak) => (
            <tr key={emlak.id} onClick={() => onRowClick(emlak)} className="hover:bg-slate-50 transition-colors cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{getProjeAdi(emlak.projeId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emlak.blok}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emlak.kat}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emlak.daireNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emlak.metraj} m²</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  emlak.durum === 'satilik' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                }`}>
                  {emlak.durum === 'satilik' ? 'Satılık' : 'Kiralık'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(emlak); }} className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-100" aria-label="Düzenle">
                  <EditIcon />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(emlak.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100" aria-label="Sil">
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default EmlakListesi;