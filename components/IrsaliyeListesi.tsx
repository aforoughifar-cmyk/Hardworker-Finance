import React, { useState, useRef, useEffect } from 'react';
import { Irsaliye, Varlik, Ayarlar } from '../types';
import { EditIcon, TrashIcon, PaperClipIcon } from './icons/AppIcons';

interface IrsaliyeListesiProps {
  irsaliyeler: Irsaliye[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
  onEdit: (irsaliye: Irsaliye) => void;
  onDelete: (id: number) => void;
  onFaturaEt: (irsaliye: Irsaliye) => void;
  onDosyaGoruntule: (dosya: { veri: string; tip: string; }) => void;
  onDurumGuncelle: (id: number, yeniDurum: string) => void;
}

const IrsaliyeListesi: React.FC<IrsaliyeListesiProps> = ({ irsaliyeler, varliklar, ayarlar, onEdit, onDelete, onFaturaEt, onDosyaGoruntule, onDurumGuncelle }) => {
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
    return varlik ? (varlik.type === 'firma' ? varlik.sirketAdi : "Hata: Müşteri") : "Bilinmiyor";
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('tr-TR');
  }

  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'Hazırlanıyor': return 'bg-yellow-100 text-yellow-800';
      case 'Yolda': return 'bg-orange-100 text-orange-800';
      case 'Teslim Edildi': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (irsaliyeler.length === 0) {
    return <div className="text-center py-12 text-slate-500"><p>Görüntülenecek irsaliye bulunamadı.</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tarih</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Firma</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Açıklama</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Belge</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Eylemler</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {irsaliyeler.map((irsaliye) => (
            <tr key={irsaliye.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(irsaliye.tarih)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{getVarlikAdi(irsaliye.varlikId)}</td>
              <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-sm">{irsaliye.aciklama}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                {irsaliye.faturaId ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 cursor-not-allowed">
                        Faturalandı
                    </span>
                ) : (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setAcikMenuId(irsaliye.id === acikMenuId ? null : irsaliye.id); }}
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusColor(irsaliye.durum)}`}
                        >
                            {irsaliye.durum}
                        </button>
                        {acikMenuId === irsaliye.id && (
                            <div ref={menuRef} className="absolute z-10 mt-2 w-40 bg-white rounded-md shadow-lg border">
                                <ul className="py-1">
                                    {ayarlar.irsaliyeDurumlari.map(durum => (
                                        <li key={durum}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDurumGuncelle(irsaliye.id, durum);
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
                    </>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {irsaliye.ekDosya && (
                  <button onClick={() => onDosyaGoruntule(irsaliye.ekDosya!)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100">
                    <PaperClipIcon />
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                {!irsaliye.faturaId && irsaliye.durum === 'Teslim Edildi' && (
                    <button onClick={() => onFaturaEt(irsaliye)} className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md">Fatura Et</button>
                )}
                <button onClick={() => onEdit(irsaliye)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                <button onClick={() => onDelete(irsaliye.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IrsaliyeListesi;
