import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import { Fatura, Varlik, Ayarlar } from '../types';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import PdfIcon from './icons/PdfIcon';

interface FaturaListesiProps {
  faturalar: Fatura[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
  onDuzenle?: (fatura: Fatura) => void;
  onSil?: (id: number) => void;
  onPdfIndir?: (fatura: Fatura) => void;
  onDurumGuncelle?: (faturaId: number, yeniDurum: string) => void;
  onRowClick?: (fatura: Fatura) => void;
}

const FaturaListesi: React.FC<FaturaListesiProps> = ({ faturalar, varliklar, ayarlar, onDuzenle, onSil, onPdfIndir, onDurumGuncelle, onRowClick }) => {
  const [acikMenuId, setAcikMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasActions = !!(onDuzenle || onSil || onPdfIndir);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAcikMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  
  const getVarlikAdi = (id: number) => {
    const varlik = varliklar.find(v => v.id === id);
    return varlik ? (varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi) : "Bilinmiyor";
  };
  
  const getParaBirimiSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };


  if (faturalar.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg">Görüntülenecek bir fatura bulunamadı.</p>
        <p className="text-base mt-2">Filtrenizi kontrol edin veya yeni bir fatura ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fatura No</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Müşteri/Firma</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fatura Tarihi</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tutar</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tip</th>
            {hasActions && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Eylemler</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {faturalar.map((fatura) => {
            const odenenTutar = fatura.odemeler?.reduce((sum, p) => sum + p.tutar, 0) || 0;
            const kalanTutar = fatura.toplamTutar - odenenTutar;

            return (
              <tr key={fatura.id} onClick={() => onRowClick && onRowClick(fatura)} className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{fatura.faturaNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{getVarlikAdi(fatura.varlikId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(fatura.faturaTarihi)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <p className="font-semibold text-slate-800">{getParaBirimiSembolu(fatura.paraBirimi)}{fatura.toplamTutar.toFixed(2)}</p>
                  {odenenTutar > 0 && kalanTutar > 0.01 && (
                      <p className="text-xs text-red-600">Kalan: {getParaBirimiSembolu(fatura.paraBirimi)}{kalanTutar.toFixed(2)}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDurumGuncelle && setAcikMenuId(fatura.id === acikMenuId ? null : fatura.id); }}
                    disabled={!onDurumGuncelle}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    fatura.odemeDurumu === 'Ödendi' ? 'bg-green-100 text-green-800' : (fatura.odemeDurumu === 'Kısmen Ödendi' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800')
                  } ${onDurumGuncelle ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                    {fatura.odemeDurumu}
                  </button>
                  {acikMenuId === fatura.id && onDurumGuncelle && (
                      <div ref={menuRef} className="absolute z-10 mt-2 w-40 bg-white rounded-md shadow-lg border border-slate-200">
                          <ul className="py-1">
                              {ayarlar.odemeDurumlari.map(durum => (
                                  <li key={durum}>
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              onDurumGuncelle(fatura.id, durum);
                                              setAcikMenuId(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                      >
                                          {durum}
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    fatura.tip === 'gelir' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {fatura.tip === 'gelir' ? 'Gelir' : 'Gider'}
                  </span>
                </td>
                {hasActions &&
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {onDuzenle && <button onClick={(e) => { e.stopPropagation(); onDuzenle(fatura); }} className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-100" aria-label="Düzenle"><EditIcon /></button>}
                    {onPdfIndir && <button onClick={(e) => { e.stopPropagation(); onPdfIndir(fatura); }} className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100" aria-label="PDF İndir"><PdfIcon /></button>}
                    {onSil && <button onClick={(e) => { e.stopPropagation(); onSil(fatura.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100" aria-label="Sil"><TrashIcon /></button>}
                  </td>
                }
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FaturaListesi;