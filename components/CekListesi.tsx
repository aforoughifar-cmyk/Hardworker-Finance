import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import { Cek, Varlik, Ayarlar, Fatura } from '../types';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import PdfIcon from './icons/PdfIcon';

interface CekListesiProps {
  cekler: Cek[];
  varliklar: Varlik[];
  faturalar?: Fatura[];
  ayarlar: Ayarlar;
  onDuzenle?: (cek: Cek) => void;
  onSil?: (id: number) => void;
  onPdfIndir?: (cek: Cek) => void;
  onDurumGuncelle?: (cekId: number, yeniDurum: string) => void;
}

const CekListesi: React.FC<CekListesiProps> = ({ cekler, varliklar, faturalar, ayarlar, onDuzenle, onSil, onPdfIndir, onDurumGuncelle }) => {
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
    return varlik && varlik.type === 'firma' ? varlik.sirketAdi : "Bilinmiyor";
  };
  
  const getParaBirimiSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  }
  
  const getDurumRenk = (durum: string) => {
    // FIX: Corrected typo 'cekDurumlari' to access correct property.
    return ayarlar.cekDurumlari.find(d => d.durum === durum)?.renk || '#cccccc';
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('tr-TR');
  };

  if (cekler.length === 0) {
    return <div className="text-center py-12 text-slate-500"><p>Görüntülenecek bir çek bulunamadı.</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Makbuz No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Çek No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vade Tarihi</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tutar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Alıcı Firma</th>
            {faturalar && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">İlişkili Faturalar</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
            {hasActions && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Eylemler</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {cekler.map((cek) => (
            <tr key={cek.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cek.makbuzNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cek.cekNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(cek.vadeTarihi)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{getParaBirimiSembolu(cek.paraBirimi)}{cek.tutar.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{getVarlikAdi(cek.varlikId)}</td>
              {faturalar && (
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {cek.faturaIds.map(id => faturalar.find(f => f.id === id)?.faturaNo).filter(Boolean).join(', ')}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); onDurumGuncelle && setAcikMenuId(cek.id === acikMenuId ? null : cek.id); }} 
                    disabled={!onDurumGuncelle}
                    className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                    style={{ backgroundColor: getDurumRenk(cek.durum) }}
                >
                  {cek.durum}
                </button>
                {acikMenuId === cek.id && onDurumGuncelle && (
                    <div ref={menuRef} className="absolute z-10 mt-2 w-40 bg-white rounded-md shadow-lg border">
                        <ul className="py-1">
                            {/* FIX: Corrected typo 'cekDurumlari' to access correct property. */}
                            {ayarlar.cekDurumlari.map(d => (
                                <li key={d.durum}>
                                    <button onClick={(e) => { e.stopPropagation(); onDurumGuncelle(cek.id, d.durum); setAcikMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                        {d.durum}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </td>
              {hasActions && 
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {onDuzenle && <button onClick={() => onDuzenle(cek)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>}
                    {onPdfIndir && <button onClick={() => onPdfIndir(cek)} className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100"><PdfIcon /></button>}
                    {onSil && <button onClick={() => onSil(cek.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>}
                </td>
              }
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CekListesi;