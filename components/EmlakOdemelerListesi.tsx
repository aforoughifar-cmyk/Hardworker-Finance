import React, { useState, useRef, useEffect } from 'react';
import { EmlakOdeme, Emlak, GiderTuru, Ayarlar } from '../types';
import { EditIcon, TrashIcon, PdfIcon } from './icons/AppIcons';

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
    </svg>
);


interface EmlakOdemelerListesiProps {
  odemeler: EmlakOdeme[];
  emlaklar: Emlak[];
  giderTurleri: GiderTuru[];
  ayarlar: Ayarlar;
  onEdit: (odeme: EmlakOdeme) => void;
  onDelete: (id: number) => void;
  onDurumGuncelle: (id: number, durum: 'Ödendi' | 'Ödenmedi') => void;
  onPdfIndir: (odeme: EmlakOdeme) => void;
}

const EmlakOdemelerListesi: React.FC<EmlakOdemelerListesiProps> = ({ odemeler, emlaklar, giderTurleri, ayarlar, onEdit, onDelete, onDurumGuncelle, onPdfIndir }) => {
  const [acikMenuId, setAcikMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAcikMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getEmlakAdi = (emlakId: number) => {
    const emlak = emlaklar.find(e => e.id === emlakId);
    return emlak ? `${emlak.blok} Blok, Kat ${emlak.kat}, No ${emlak.daireNo}` : 'Bilinmiyor';
  };

  const getGiderTuruAdi = (giderTuruId: number) => {
    return giderTurleri.find(gt => gt.id === giderTuruId)?.ad || 'Bilinmiyor';
  };

  const getParaSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('tr-TR');
  }

  if (odemeler.length === 0) {
    return <div className="text-center py-12 text-slate-500"><p>Filtreye uygun kayıtlı emlak ödemesi bulunamadı.</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Birim</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tarih</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gider Türü</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tutar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
            <th className="relative px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {odemeler.map(odeme => (
            <tr key={odeme.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{getEmlakAdi(odeme.emlakId)}</td>
              <td className="px-6 py-4 text-slate-600">{formatDate(odeme.tarih)}</td>
              <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                {getGiderTuruAdi(odeme.giderTuruId)}
                {(odeme.tekrarliMi || odeme.kaynakOdemeId) && <span title="Tekrarlayan Ödeme"><RefreshIcon /></span>}
                </td>
              <td className="px-6 py-4 font-semibold text-slate-800">{getParaSembolu(odeme.paraBirimi)}{odeme.tutar.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setAcikMenuId(odeme.id === acikMenuId ? null : odeme.id); }} 
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        odeme.durum === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {odeme.durum}
                </button>
                {acikMenuId === odeme.id && (
                    <div ref={menuRef} className="absolute z-10 mt-2 w-32 bg-white rounded-md shadow-lg border">
                        <ul className="py-1">
                            {['Ödendi', 'Ödenmedi'].map(durum => (
                                <li key={durum}>
                                    <button onClick={(e) => { e.stopPropagation(); onDurumGuncelle(odeme.id, durum as 'Ödendi' | 'Ödenmedi'); setAcikMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                        {durum}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {odeme.durum === 'Ödendi' && (
                    <button onClick={() => onPdfIndir(odeme)} className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100" aria-label="Makbuz İndir">
                        <PdfIcon />
                    </button>
                )}
                <button onClick={() => onEdit(odeme)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                <button onClick={() => onDelete(odeme.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmlakOdemelerListesi;