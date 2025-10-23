import React from 'react';
import { OdemeKaydi, Fatura, Varlik, Ayarlar } from '../types';

interface TahsilatMakbuzSablonuProps {
  odeme: OdemeKaydi;
  fatura: Fatura;
  varlik: Varlik;
  ayarlar: Ayarlar;
}

const TahsilatMakbuzSablonu: React.FC<TahsilatMakbuzSablonuProps> = ({ odeme, fatura, varlik, ayarlar }) => {
  const { sirketBilgileri, logo } = ayarlar;
  const varlikAdi = varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
  const sembol = ayarlar.paraBirimleri.find(p => p.kod === fatura.paraBirimi)?.sembol || fatura.paraBirimi;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-[800px] bg-white p-12 font-sans text-gray-800">
      <header className="flex justify-between items-start pb-6 border-b-2 border-green-600">
        <div className="w-2/5">
          {logo ? <img src={logo} alt="Şirket Logosu" className="max-h-20" /> : <h1 className="text-2xl font-bold">{sirketBilgileri.ad}</h1>}
          <p className="text-xs text-gray-500 mt-2">{sirketBilgileri.adres}</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold uppercase text-green-600">TAHSİLAT MAKBUZU</h1>
          <p className="mt-2"><span className="font-semibold">Makbuz No:</span> ODEME-{odeme.id.slice(-6)}</p>
          <p><span className="font-semibold">Ödeme Tarihi:</span> {formatDate(odeme.tarih)}</p>
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
                  {fatura.faturaNo} numaralı faturaya istinaden yapılan ödeme.
                </p>
                <p className="text-sm text-gray-500">Ödeme Tipi: {odeme.odemeTipi}</p>
                {odeme.aciklama && <p className="text-sm text-gray-500">Not: {odeme.aciklama}</p>}
              </td>
              <td className="p-3 border-b text-right font-semibold text-slate-900">{sembol}{odeme.tutar.toFixed(2)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="font-bold text-lg">
              <td className="p-3 text-right text-slate-900">TOPLAM ÖDENEN</td>
              <td className="p-3 text-right text-slate-900">{sembol}{odeme.tutar.toFixed(2)}</td>
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

export default TahsilatMakbuzSablonu;