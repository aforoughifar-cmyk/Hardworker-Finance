import React from 'react';
import { EmlakDanismani } from '../types';
import { EditIcon, TrashIcon } from './icons/AppIcons';

interface EmlakDanismaniListesiProps {
  danismanlar: EmlakDanismani[];
  onEdit: (danisman: EmlakDanismani) => void;
  onDelete: (id: number) => void;
  onRowClick: (danisman: EmlakDanismani) => void;
}

const EmlakDanismaniListesi: React.FC<EmlakDanismaniListesiProps> = ({ danismanlar, onEdit, onDelete, onRowClick }) => {

  if (danismanlar.length === 0) {
    return <div className="text-center py-12 text-slate-500"><p>Kayıtlı emlak danışmanı bulunamadı.</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">İsim / Şirket Adı</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tip</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Telefon</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">E-posta / Vergi No</th>
            <th className="relative px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {danismanlar.map(d => (
            <tr key={d.id} onClick={() => onRowClick(d)} className="hover:bg-slate-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {d.type === 'kisi' ? (
                       <img className="h-10 w-10 rounded-full object-cover" src={d.resim || undefined} alt="" />
                    ) : (
                       <img className="h-10 w-10 rounded-md object-contain" src={d.logo || undefined} alt="" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-slate-900">
                        {d.type === 'kisi' ? `${d.isim} ${d.soyisim}`: d.sirketAdi}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ d.type === 'kisi' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800' }`}>
                    {d.type === 'kisi' ? 'Kişi' : 'Şirket'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{d.telefon}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{d.type === 'kisi' ? d.email : d.vergiNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(d); }} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(d.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmlakDanismaniListesi;