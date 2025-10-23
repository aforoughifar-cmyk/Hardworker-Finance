import React from 'react';
import { Taksit, Varlik, Ayarlar } from '../types';

interface TaksitDokumuSablonuProps {
  varlik: Varlik;
  taksitler: Taksit[];
  ayarlar: Ayarlar;
}

const TaksitDokumuSablonu: React.FC<TaksitDokumuSablonuProps> = ({ varlik, taksitler, ayarlar }) => {
  const { sirketBilgileri, logo } = ayarlar;
  const varlikAdi = varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;

  const totals = taksitler.reduce((acc, taksit) => {
    const sembol = ayarlar.paraBirimleri.find(p => p.kod === taksit.paraBirimi)?.sembol || taksit.paraBirimi;
    if (!acc[sembol]) {
        acc[sembol] = { toplam: 0, odenen: 0, kalan: 0 };
    }
    acc[sembol].toplam += taksit.tutar;
    if (taksit.durum === 'Ödendi') {
        acc[sembol].odenen += taksit.tutar;
    } else {
        acc[sembol].kalan += taksit.tutar;
    }
    return acc;
  }, {} as {[key: string]: { toplam: number; odenen: number; kalan: number }});

  return (
    <div className="w-[800px] bg-white p-12 font-sans text-gray-800">
      <header className="flex justify-between items-start pb-6 border-b-2 border-indigo-600">
        <div className="w-2/5">
          {logo ? <img src={logo} alt="Şirket Logosu" className="max-h-20" /> : <h1 className="text-2xl font-bold">{sirketBilgileri.ad}</h1>}
          <p className="text-xs text-gray-500 mt-2">{sirketBilgileri.adres}</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold uppercase text-indigo-600">TAKSİT ÖDEME PLANI</h1>
          <p className="mt-2"><span className="font-semibold">Döküm Tarihi:</span> {new Date().toLocaleDateString('tr-TR')}</p>
        </div>
      </header>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Müşteri / Firma</h2>
        <p className="text-lg font-bold mt-1">{varlikAdi}</p>
        <p className="text-sm text-gray-600">{varlik.adres}</p>
      </section>
      <section className="mt-10">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left font-semibold uppercase text-slate-700">Taksit No</th>
              <th className="p-3 text-left font-semibold uppercase text-slate-700">Açıklama</th>
              <th className="p-3 text-left font-semibold uppercase text-slate-700">Vade Tarihi</th>
              <th className="p-3 text-right font-semibold uppercase text-slate-700">Tutar</th>
              <th className="p-3 text-center font-semibold uppercase text-slate-700">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {taksitler.map(taksit => (
                 <tr key={taksit.id} className="text-slate-800">
                    <td className="p-2">{taksit.taksitNo}</td>
                    <td className="p-2">{taksit.aciklama || 'Fatura Taksiti'}</td>
                    <td className="p-2">{new Date(taksit.vadeTarihi).toLocaleDateString('tr-TR')}</td>
                    <td className="p-2 text-right font-semibold">
                        {(ayarlar.paraBirimleri.find(p => p.kod === taksit.paraBirimi)?.sembol || '')}{taksit.tutar.toFixed(2)}
                    </td>
                    <td className={`p-2 text-center font-semibold ${taksit.durum === 'Ödendi' ? 'text-green-600' : 'text-yellow-600'}`}>{taksit.durum}</td>
                 </tr>
            ))}
          </tbody>
        </table>
      </section>

       <section className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-2 text-sm">
                <h3 className="text-md font-bold text-gray-700 border-b pb-1">Özet</h3>
                {Object.entries(totals).map(([sembol, { toplam, odenen, kalan }]) => (
                    <div key={sembol}>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Toplam Borç ({sembol})</span>
                            <span className="font-semibold">{toplam.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-600">Toplam Ödenen ({sembol})</span>
                            <span className="font-semibold text-green-600">{odenen.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span className="text-red-600">Kalan Borç ({sembol})</span>
                            <span className="text-red-600">{kalan.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>

      <footer className="mt-16 pt-6 border-t text-center text-xs text-gray-500">
        <p>Bu döküman bilgilendirme amaçlıdır.</p>
        <p className="font-semibold">{sirketBilgileri.ad}</p>
      </footer>
    </div>
  );
};

export default TaksitDokumuSablonu;