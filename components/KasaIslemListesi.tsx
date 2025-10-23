import React from 'react';
import { KasaIslem, Ayarlar, KasaHesap } from '../types';
import { TrashIcon, PaperClipIcon, EditIcon } from './icons/AppIcons';

interface KasaIslemListesiProps {
  islemler: KasaIslem[];
  hesaplar: KasaHesap[];
  ayarlar: Ayarlar;
  onDelete: (id: number) => void;
  onEdit: (islem: KasaIslem) => void;
  onDosyaGoruntule: (dosya: { veri: string; tip: string; }) => void;
}

const KasaIslemListesi: React.FC<KasaIslemListesiProps> = ({ islemler, hesaplar, ayarlar, onDelete, onEdit, onDosyaGoruntule }) => {
  const getParaBirimiSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('tr-TR');
  };

  if (islemler.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Görüntülenecek bir işlem bulunamadı.</p>
        <p className="text-sm mt-1">Yeni bir işlem ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tarih</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Açıklama</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Tutar</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Belge</th>
            <th className="relative px-4 py-3"><span className="sr-only">Eylemler</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {islemler.map(islem => (
            <tr key={islem.id}>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(islem.tarih)}</td>
              <td className="px-4 py-4">
                <p className="text-sm font-medium text-slate-900">{islem.aciklama}</p>
                <p className="text-xs text-slate-500">{islem.kategori}</p>
              </td>
              <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold text-right ${islem.tip === 'gelir' ? 'text-emerald-600' : 'text-red-600'}`}>
                {islem.tip === 'gelir' ? '+' : '-'}
                {/* FIX: Corrected logic to find currency symbol. The `hesaplar` prop was missing and the expression was overly complex and incorrect. */}
                {getParaBirimiSembolu(hesaplar.find(h => h.id === islem.hesapId)?.paraBirimi || '')}{islem.tutar.toFixed(2)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                {islem.ekDosya && (
                  <button 
                      onClick={() => onDosyaGoruntule(islem.ekDosya!)}
                      className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"
                      aria-label="Belgeyi Görüntüle"
                  >
                      <PaperClipIcon />
                  </button>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm space-x-1">
                 <button onClick={() => onEdit(islem)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100" aria-label="Düzenle">
                    <EditIcon />
                 </button>
                 <button onClick={() => onDelete(islem.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100" aria-label="Sil">
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

export default KasaIslemListesi;