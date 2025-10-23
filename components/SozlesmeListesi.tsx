import React from 'react';
import { Sozlesme, Varlik } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import { PaperClipIcon } from './icons/AppIcons';

interface SozlesmeListesiProps {
  sozlesmeler: Sozlesme[];
  varliklar: Varlik[];
  onEdit: (sozlesme: Sozlesme) => void;
  onDelete: (id: number) => void;
  onDosyaGoruntule: (dosya: { veri: string; tip: string; }) => void;
  onRowClick?: (sozlesme: Sozlesme) => void;
}

const SozlesmeListesi: React.FC<SozlesmeListesiProps> = ({ sozlesmeler, varliklar, onEdit, onDelete, onDosyaGoruntule, onRowClick }) => {
  const getVarlikAdi = (id: number) => {
    const varlik = varliklar.find(v => v.id === id);
    if (!varlik) return "Bilinmiyor";
    return varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
  };

  const tipMap = {
    satis: { text: 'Satış', color: 'bg-emerald-100 text-emerald-800' },
    kira: { text: 'Kira', color: 'bg-sky-100 text-sky-800' },
    diger: { text: 'Diğer', color: 'bg-slate-100 text-slate-800' },
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Başlık</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Taraf</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tip</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tarih</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Ek</th>
            <th className="relative px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {sozlesmeler.map(s => (
            <tr key={s.id} onClick={() => onRowClick && onRowClick(s)} className="hover:bg-slate-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{s.baslik}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{getVarlikAdi(s.varlikId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tipMap[s.tip].color}`}>
                  {tipMap[s.tip].text}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(s.sozlesmeTarihi).toLocaleDateString('tr-TR')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{s.durum}</td>
              <td className="px-6 py-4 text-center">
                {s.ekDosya && (
                  <button onClick={(e) => { e.stopPropagation(); onDosyaGoruntule(s.ekDosya!); }} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100">
                    <PaperClipIcon />
                  </button>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(s); }} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SozlesmeListesi;