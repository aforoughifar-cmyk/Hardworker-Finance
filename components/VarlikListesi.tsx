import React from 'react';
// FIX: Corrected import path for types
import { Varlik } from '../types';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';

interface VarlikListesiProps {
  varliklar: Varlik[];
  onDelete: (id: number) => void;
  onEdit: (varlik: Varlik) => void;
  onRowClick: (varlik: Varlik) => void;
}

const VarlikListesi: React.FC<VarlikListesiProps> = ({ varliklar, onDelete, onEdit, onRowClick }) => {
  if (varliklar.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg">Görüntülenecek bir varlık bulunamadı.</p>
        <p className="text-base mt-2">Filtrenizi kontrol edin veya yeni bir varlık ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tip</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">İsim / Şirket Adı</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">E-posta</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefon</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Eylemler</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {varliklar.map((varlik) => (
            <tr key={varlik.id} onClick={() => onRowClick(varlik)} className="hover:bg-slate-50 transition-colors cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  varlik.type === 'musteri' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {varlik.type === 'musteri' ? 'Müşteri' : 'Firma'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-500">{varlik.type === 'musteri' ? varlik.email : varlik.sirketEmail}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {varlik.type === 'musteri' ? varlik.telefon : varlik.sirketTelefon}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(varlik); }} className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-100" aria-label="Düzenle">
                  <EditIcon />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(varlik.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100" aria-label="Sil">
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

export default VarlikListesi;
