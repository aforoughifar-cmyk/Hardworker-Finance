import React, { useState, useRef, useEffect } from 'react';
import { Teklif, Varlik, Ayarlar } from '../types';
import { EditIcon, TrashIcon, PaperClipIcon } from './icons/AppIcons';

interface TeklifListesiProps {
  teklifler: Teklif[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
  onEdit: (teklif: Teklif) => void;
  onDelete: (id: number) => void;
  onDurumGuncelle: (teklifId: number, yeniDurum: string) => void;
  onDosyaGoruntule: (dosya: { veri: string; tip: string; }) => void;
  onRowClick?: (teklif: Teklif) => void; // Add new prop
}

const TeklifListesi: React.FC<TeklifListesiProps> = ({ teklifler, varliklar, ayarlar, onEdit, onDelete, onDurumGuncelle, onDosyaGoruntule, onRowClick }) => {
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
  
  const getVarlikAdi = (id: number) => {
    const varlik = varliklar.find(v => v.id === id);
    return varlik?.type === 'firma' ? varlik.sirketAdi : "Bilinmiyor";
  };
  
  const getParaBirimiSembolu = (kod: string) => {
    return ayarlar.paraBirimleri.find(p => p.kod === kod)?.sembol || kod;
  };
  
  if (teklifler.length === 0) {
    return <div className="text-center py-12 text-slate-500"><p>Görüntülenecek teklif yok.</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Konu</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Firma</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tutar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Ek</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Eylemler</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {teklifler.map((teklif) => (
            <tr key={teklif.id} onClick={() => onRowClick && onRowClick(teklif)} className={`transition-colors hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{teklif.konu}</td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{getVarlikAdi(teklif.varlikId)}</td>
              <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">{getParaBirimiSembolu(teklif.paraBirimi)}{teklif.tutar.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setAcikMenuId(teklif.id === acikMenuId ? null : teklif.id); }}
                    className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {teklif.durum}
                  </button>
                  {acikMenuId === teklif.id && (
                    <div ref={menuRef} className="absolute z-10 mt-2 w-40 bg-white rounded-md shadow-lg border">
                        <ul className="py-1">
                            {ayarlar.teklifDurumlari.map(durum => (
                                <li key={durum}>
                                    <button onClick={(e) => { e.stopPropagation(); onDurumGuncelle(teklif.id, durum); setAcikMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                        {durum}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {teklif.ekDosya && (
                  <button onClick={(e) => { e.stopPropagation(); onDosyaGoruntule(teklif.ekDosya!); }} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100">
                    <PaperClipIcon />
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(teklif); }} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(teklif.id); }} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeklifListesi;