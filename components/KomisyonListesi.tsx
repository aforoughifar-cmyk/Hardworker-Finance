import React from 'react';
import { Komisyon, EmlakDanismani, Sozlesme, Ayarlar } from '../types';
import { EditIcon, TrashIcon, PdfIcon } from './icons/AppIcons';

interface KomisyonListesiProps {
  komisyonlar: Komisyon[];
  danismanlar: EmlakDanismani[];
  sozlesmeler: Sozlesme[];
  ayarlar: Ayarlar;
  onEdit: (komisyon: Komisyon) => void;
  onDelete: (id: number) => void;
  onPdfIndir: (komisyon: Komisyon) => void;
}

const KomisyonListesi: React.FC<KomisyonListesiProps> = ({ komisyonlar, danismanlar, sozlesmeler, ayarlar, onEdit, onDelete, onPdfIndir }) => {
  const danismanMap = new Map(danismanlar.map(d => [d.id, d.type === 'kisi' ? `${d.isim} ${d.soyisim}` : d.sirketAdi]));
  const sozlesmeMap = new Map(sozlesmeler.map(s => [s.id, s.baslik]));

  const getParaSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  };
  
  if (komisyonlar.length === 0) {
    return <div className="text-center py-12 text-slate-500"><p>Kayıtlı komisyon bulunamadı.</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Danışman</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">İlgili Sözleşme(ler)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tarih</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Net Komisyon</th>
            <th className="relative px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {komisyonlar.map(k => (
            <tr key={k.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{danismanMap.get(k.danismanId) || 'Bilinmiyor'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {k.sozlesmeIds.map(id => sozlesmeMap.get(id) || `ID:${id}`).join(', ')}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">{new Date(k.tarih).toLocaleDateString('tr-TR')}</td>
              <td className="px-6 py-4 font-semibold text-emerald-600">
                {getParaSembolu(k.paraBirimi)}{k.netKomisyonTutari.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => onEdit(k)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                <button onClick={() => onPdfIndir(k)} className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100"><PdfIcon /></button>
                <button onClick={() => onDelete(k.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KomisyonListesi;