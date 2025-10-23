

import React, { useMemo } from 'react';
// FIX: Corrected import path for types
import { Cek, Varlik, Ayarlar } from '../types';

interface CekOnizlemeProps {
  cek: Partial<Cek>;
  varlik: Varlik | null;
  ayarlar: Ayarlar;
}

const CekOnizleme: React.FC<CekOnizlemeProps> = ({ cek, varlik, ayarlar }) => {
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'DD.MM.YYYY';
    try {
      const date = new Date(dateString);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('tr-TR');
    } catch {
      return 'DD.MM.YYYY';
    }
  }

  const formatTutar = (tutar: number | undefined, paraBirimi: string | undefined) => {
    const sembol = ayarlar.paraBirimleri.find(p => p.kod === paraBirimi)?.sembol || '';
    if (tutar === undefined) return `0,00 ${sembol}`;
    return `${tutar.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${sembol}`;
  }
  
  const durumRengi = useMemo(() => {
    // FIX: Corrected typo 'cekDurumlari' to access correct property.
    return ayarlar.cekDurumlari.find(d => d.durum === cek.durum)?.renk || '#cccccc';
  }, [cek.durum, ayarlar.cekDurumlari]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 sticky top-4">
      <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Çek Önizleme</h3>
      <div className="p-4 rounded-lg font-mono text-sm space-y-2 border-2 border-dashed" style={{ borderColor: durumRengi }}>
        <div className="flex justify-between items-center">
          <span className="text-slate-700">{cek.cekNo || '12345678'}</span>
          <span className="font-bold text-slate-800">{formatTutar(cek.tutar, cek.paraBirimi)}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">{formatDate(cek.vadeTarihi)}</span>
            <span className="font-semibold text-slate-700">{varlik?.type === 'firma' ? varlik.sirketAdi : 'ALICI FİRMA'}</span>
        </div>
        <div className="pt-2">
            <span className="text-xs text-slate-500">Ödeyiniz: <span className="font-semibold text-slate-800">{cek.lehtar || 'Lehtar Adı'}</span></span>
        </div>
        <div className="pt-2 text-right text-xs text-slate-500">
            <span>Tanzim: {formatDate(cek.tanzimTarihi)}</span>
        </div>
      </div>
    </div>
  );
};

export default CekOnizleme;
