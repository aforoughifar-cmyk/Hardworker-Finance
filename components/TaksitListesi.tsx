import React, { useState, useRef, useEffect } from 'react';
import { Taksit, Fatura, Varlik, Ayarlar } from '../types';
import { TrashIcon, EditIcon, PdfIcon } from './icons/AppIcons';
import DatePickerInput from './DatePickerInput';

interface TaksitListesiProps {
  taksitler: Taksit[];
  faturalar: Fatura[];
  varliklar: Varlik[];
  ayarlar: Ayarlar;
  onTaksitGuncelle: (taksitId: number, data: Partial<Taksit>) => void;
  onDurumGuncelle: (taksitId: number, yeniDurum: string) => void;
  onTaksitSil: (taksitId: number) => void;
  onPdfIndir: (taksit: Taksit) => void;
}

const TaksitListesi: React.FC<TaksitListesiProps> = ({ taksitler, faturalar, varliklar, ayarlar, onTaksitGuncelle, onDurumGuncelle, onTaksitSil, onPdfIndir }) => {
    const [acikMenuId, setAcikMenuId] = useState<number | null>(null);
    const [editing, setEditing] = useState<{ id: number, field: 'tutar' | 'vadeTarihi' } | null>(null);
    const [editValue, setEditValue] = useState<string | number>('');
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setAcikMenuId(null);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);
    
    useEffect(() => {
        if(editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const getTaksitDetay = (taksit: Taksit) => {
        const fatura = taksit.faturaId ? faturalar.find(f => f.id === taksit.faturaId) : null;
        const varlik = varliklar.find(v => v.id === taksit.varlikId);
        const varlikAdi = varlik ? (varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi) : 'Bilinmiyor';
        const paraBirimiSembolu = ayarlar.paraBirimleri.find(p => p.kod === taksit.paraBirimi)?.sembol || taksit.paraBirimi;

        return { 
            konu: fatura ? `Fatura #${fatura.faturaNo}` : taksit.aciklama || 'Genel Taksit', 
            varlikAdi, 
            paraBirimiSembolu 
        };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('tr-TR');
    };
    
    const handleEditStart = (taksit: Taksit, field: 'tutar' | 'vadeTarihi') => {
        setEditing({ id: taksit.id, field });
        setEditValue(taksit[field] || '');
    };

    // FIX: Refactored function to be type-safe and resolve operator error.
    const handleEditSave = () => {
        if (!editing) return;

        if (editing.field === 'tutar') {
            const updatedValue = Number(editValue);
            if (updatedValue > 0) {
                onTaksitGuncelle(editing.id, { tutar: updatedValue });
            }
        } else if (editing.field === 'vadeTarihi') {
            const updatedValue = String(editValue);
            onTaksitGuncelle(editing.id, { vadeTarihi: updatedValue });
        }

        setEditing(null);
    };

    if(taksitler.length === 0) {
        return <div className="text-center py-12 text-slate-500"><p>Görüntülenecek taksit bulunamadı.</p></div>
    }

    return (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Konu / Fatura No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Müşteri/Firma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Taksit No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vade Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tutar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
                <th className="relative px-6 py-3"><span className="sr-only">Eylemler</span></th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
            {taksitler.map((taksit) => {
                const { konu, varlikAdi, paraBirimiSembolu } = getTaksitDetay(taksit);
                const isEditingTutar = editing?.id === taksit.id && editing?.field === 'tutar';
                const isEditingVade = editing?.id === taksit.id && editing?.field === 'vadeTarihi';
                return (
                <tr key={taksit.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{konu}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{varlikAdi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{taksit.taksitNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" onClick={() => handleEditStart(taksit, 'vadeTarihi')}>
                       {isEditingVade ? (
                           <DatePickerInput 
                                value={editValue as string}
                                onChange={date => setEditValue(date)}
                                // @ts-ignore
                                onBlur={handleEditSave}
                           />
                       ) : formatDate(taksit.vadeTarihi)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800" onClick={() => handleEditStart(taksit, 'tutar')}>
                       {isEditingTutar ? (
                           <input
                                ref={inputRef}
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleEditSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                className="w-24 p-1 border rounded"
                           />
                       ) : `${paraBirimiSembolu}${taksit.tutar.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setAcikMenuId(taksit.id === acikMenuId ? null : taksit.id); }} 
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                taksit.durum === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                        {taksit.durum}
                        </button>
                         {acikMenuId === taksit.id && (
                            <div ref={menuRef} className="absolute z-10 mt-2 w-40 bg-white rounded-md shadow-lg border">
                                <ul className="py-1">
                                    {ayarlar.taksitDurumlari.map(durum => (
                                        <li key={durum}>
                                            <button onClick={(e) => { e.stopPropagation(); onDurumGuncelle(taksit.id, durum); setAcikMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                                {durum}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        {taksit.durum === 'Ödendi' && (
                            <button onClick={() => onPdfIndir(taksit)} className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100" aria-label="Makbuzu İndir">
                                <PdfIcon />
                            </button>
                        )}
                        <button onClick={() => onTaksitSil(taksit.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100" aria-label="Taksiti Sil">
                            <TrashIcon />
                        </button>
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
        </div>
    );
};

export default TaksitListesi;