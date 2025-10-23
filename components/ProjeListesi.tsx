import React from 'react';
// FIX: Corrected import path for types
import { Proje } from '../types';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';

interface ProjeListesiProps {
  projeler: Proje[];
  onDelete: (id: number) => void;
  onEdit: (proje: Proje) => void;
  onRowClick: (proje: Proje) => void;
}

const ProjeListesi: React.FC<ProjeListesiProps> = ({ projeler, onDelete, onEdit, onRowClick }) => {
  if (projeler.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg">Görüntülenecek bir proje bulunamadı.</p>
        <p className="text-base mt-2">Yeni bir proje ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proje Adı</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bitiş Tarihi</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">İlerleme</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Eylemler</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {projeler.map((proje) => (
            <tr key={proje.id} onClick={() => onRowClick(proje)} className="hover:bg-slate-50 transition-colors cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{proje.ad}</div>
                <div className="text-xs text-slate-500">{proje.aciklama.substring(0, 50)}...</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(proje.bitisTarihi).toLocaleDateString('tr-TR')}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${proje.ilerlemeYuzdesi}%`}}></div>
                    </div>
                    <span className="text-xs text-slate-500 ml-3">{proje.ilerlemeYuzdesi}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(proje); }} className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-100" aria-label="Düzenle">
                  <EditIcon />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(proje.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100" aria-label="Sil">
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

export default ProjeListesi;
