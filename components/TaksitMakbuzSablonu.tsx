import React from 'react';
import { Taksit, Varlik, Fatura, Ayarlar } from '../types';

interface TaksitMakbuzSablonuProps {
  taksit: Taksit;
  varlik: Varlik;
  fatura: Fatura | null;
  ayarlar: Ayarlar;
}

const TaksitMakbuzSablonu: React.FC<TaksitMakbuzSablonuProps> = ({ taksit, varlik, fatura, ayarlar }) => {
  const { sirketBilgileri, logo } = ayarlar;
  const varlikAdi = varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
  const sembol = ayarlar.paraBirimleri.find(p => p.kod === taksit.paraBirimi)?.sembol || taksit.paraBirimi;

  return (
    <div className="w-[800px] bg-white p-12 font-sans text-gray-800">
      <header className="flex justify-between items-start pb-6 border-b-2 border-green-600">
        <div className="w-2/5">
          {logo ? <img src={logo} alt="Şirket Logosu" className="max-h-20" /> : <h1 className="text-2xl font-bold">{sirketBilgileri.ad}</h1>}
          <p className="text-xs text-gray-500 mt-2">{sirketBilgileri.adres}</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold uppercase text-green-600">TAHSİLAT MAKBUZU</h1>
          <p className="mt-2"><span className="font-semibold">Makbuz No:</span> TAKSIT-{taksit.id}</p>
          <p><span className="font-semibold">Ödeme Tarihi:</span> {taksit.odemeTarihi ? new Date(taksit.odemeTarihi).toLocaleDateString('tr-TR') : '-'}</p>
        </div>
      </header>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-gray-500">ÖDEME YAPAN</h2>
        <p className="text-lg font-bold mt-1">{varlikAdi}</p>
        <p className="text-sm text-gray-600">{varlik.adres}</p>
      </section>
      <section className="mt-10">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left text-xs font-semibold uppercase text-slate-700 tracking-wider">Açıklama</th>
              <th className="p-3 text-right text-xs font-semibold uppercase text-slate-700 tracking-wider">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-b">
                <p className="font-semibold text-slate-900">
                  {fatura ? `Fatura No: ${fatura.faturaNo}` : taksit.aciklama || 'Genel Taksit Ödemesi'} - {taksit.taksitNo}. Taksit
                </p>
                <p className="text-sm text-gray-500">Vade Tarihi: {new Date(taksit.vadeTarihi).toLocaleDateString('tr-TR')}</p>
              </td>
              <td className="p-3 border-b text-right font-semibold text-slate-900">{sembol}{taksit.tutar.toFixed(2)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="font-bold text-lg">
              <td className="p-3 text-right text-slate-900">TOPLAM ÖDENEN</td>
              <td className="p-3 text-right text-slate-900">{sembol}{taksit.tutar.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
      <footer className="mt-16 pt-6 border-t text-center text-xs text-gray-500">
        <p>Ödemeniz için teşekkür ederiz.</p>
        <p className="font-semibold">{sirketBilgileri.ad}</p>
      </footer>
    </div>
  );
};

export default TaksitMakbuzSablonu;