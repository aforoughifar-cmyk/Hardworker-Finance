import React from 'react';
import { Komisyon, EmlakDanismani, Ayarlar, Sozlesme } from '../types';

interface KomisyonMakbuzSablonuProps {
  komisyon: Komisyon;
  danisman: EmlakDanismani;
  sozlesmeler: Sozlesme[];
  ayarlar: Ayarlar;
}

const KomisyonMakbuzSablonu: React.FC<KomisyonMakbuzSablonuProps> = ({ komisyon, danisman, sozlesmeler, ayarlar }) => {
  const { sirketBilgileri, logo } = ayarlar;
  const sembol = ayarlar.paraBirimleri.find(p => p.kod === komisyon.paraBirimi)?.sembol || komisyon.paraBirimi;
  const ilgiliSozlesmeler = sozlesmeler.filter(s => komisyon.sozlesmeIds.includes(s.id));

  return (
    <div className="w-[800px] bg-white p-12 font-sans text-gray-800">
      <header className="flex justify-between items-start pb-6 border-b-2 border-indigo-600">
        <div className="w-2/5">
           {logo ? <img src={logo} alt="Şirket Logosu" className="max-h-24" /> : <h1 className="text-2xl font-bold">{sirketBilgileri.ad}</h1>}
           <p className="text-xs text-gray-500 mt-2">{sirketBilgileri.adres}<br />T: {sirketBilgileri.telefon} | E: {sirketBilgileri.email}</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold uppercase text-indigo-600">KOMİSYON MAKBUZU</h1>
          <div className="mt-4 text-sm">
            <p><span className="font-semibold text-gray-600">Makbuz ID:</span> KOM-{komisyon.id}</p>
            <p><span className="font-semibold text-gray-600">Tarih:</span> {new Date(komisyon.tarih).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
      </header>
      
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-gray-500">ÖDEME YAPILAN DANIŞMAN</h2>
        <div className="mt-2 p-4 bg-slate-50 rounded-lg">
            {danisman.type === 'kisi' ? (
                <>
                    <p className="text-lg font-bold">{danisman.isim} {danisman.soyisim}</p>
                    <p className="text-sm text-gray-600">{danisman.email} | {danisman.telefon}</p>
                    <p className="text-sm text-gray-600">Kimlik No: {danisman.kimlikNo} | IBAN: {danisman.iban}</p>
                </>
            ) : (
                <>
                    <p className="text-lg font-bold">{danisman.sirketAdi}</p>
                    <p className="text-sm text-gray-600">{danisman.telefon}</p>
                    <p className="text-sm text-gray-600">Vergi No: {danisman.vergiNo} | IBAN: {danisman.iban}</p>
                </>
            )}
            <p className="text-sm text-gray-600">{danisman.adres}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">KOMİSYON DETAYLARI</h2>
        <table className="w-full">
            <thead className="bg-slate-100 text-left text-xs uppercase">
                <tr>
                    <th className="p-2">Açıklama</th>
                    <th className="p-2 text-right">Tutar</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b"><td className="p-2">İlgili Sözleşme Tutarı</td><td className="p-2 text-right">{sembol}{komisyon.sozlesmeTutari.toFixed(2)}</td></tr>
                <tr className="border-b"><td className="p-2">Komisyon Oranı</td><td className="p-2 text-right">{komisyon.komisyonYuzdesi}%</td></tr>
                <tr className="border-b"><td className="p-2 font-semibold">Brüt Komisyon Tutarı</td><td className="p-2 text-right font-semibold">{sembol}{(komisyon.sozlesmeTutari * komisyon.komisyonYuzdesi / 100).toFixed(2)}</td></tr>
                <tr className="border-b"><td className="p-2 text-red-600">İndirim Oranı</td><td className="p-2 text-right text-red-600">{komisyon.indirimYuzdesi}%</td></tr>
                <tr className="border-b"><td className="p-2 text-red-600">İndirim Tutarı</td><td className="p-2 text-right text-red-600">-{sembol}{(komisyon.sozlesmeTutari * komisyon.komisyonYuzdesi / 100 * komisyon.indirimYuzdesi / 100).toFixed(2)}</td></tr>
            </tbody>
            <tfoot>
                <tr className="bg-indigo-50 font-bold text-lg"><td className="p-3">Net Ödenecek Komisyon Tutarı</td><td className="p-3 text-right">{sembol}{komisyon.netKomisyonTutari.toFixed(2)}</td></tr>
            </tfoot>
        </table>
      </section>

       <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">İlgili Sözleşmeler</h2>
        <ul className="text-sm list-disc list-inside">
          {ilgiliSozlesmeler.map(s => <li key={s.id}>{s.baslik} (Tutar: {s.toplamTutar.toFixed(2)} {s.paraBirimi})</li>)}
        </ul>
       </section>
      
      <footer className="mt-16 pt-6 border-t text-center text-xs text-gray-500">
        <p>Bu makbuz, belirtilen tarihte, yukarıdaki detaylara göre komisyon ödemesinin yapıldığını teyit eder.</p>
        <p className="mt-1 font-semibold">{sirketBilgileri.ad}</p>
      </footer>
    </div>
  );
};

export default KomisyonMakbuzSablonu;