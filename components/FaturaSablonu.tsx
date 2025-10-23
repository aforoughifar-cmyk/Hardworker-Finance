import React from 'react';
// FIX: Corrected import path for types
import { Fatura, Varlik, Ayarlar } from '../types';

interface FaturaSablonuProps {
  fatura: Fatura;
  varlik: Varlik;
  ayarlar: Ayarlar;
}

const FaturaSablonu: React.FC<FaturaSablonuProps> = ({ fatura, varlik, ayarlar }) => {
  const sembol = ayarlar.paraBirimleri.find(p => p.kod === fatura.paraBirimi)?.sembol || fatura.paraBirimi;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  
  const varlikAdi = varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
  const varlikAdres = varlik.adres;
  const varlikEmail = varlik.type === 'musteri' ? varlik.email : varlik.sirketEmail;
  const varlikTelefon = varlik.type === 'musteri' ? varlik.telefon : varlik.sirketTelefon;

  // FIX: Cast vergiOrani to a number before using it in a calculation, as it can be an empty string.
  const vergiTutari = fatura.araToplam * ((Number(fatura.vergiOrani) || 0) / 100);
  const odenenTutar = fatura.odemeler?.reduce((sum, p) => sum + p.tutar, 0) || 0;
  const kalanTutar = fatura.toplamTutar - odenenTutar;


  return (
    <div className="w-[800px] bg-white font-sans text-gray-800">
      <div className="p-12">
        {/* Header */}
        <header className="flex justify-between items-start pb-6 border-b-2" style={{borderColor: ayarlar.faturaRenk}}>
          <div className="w-2/5">
             {ayarlar.logo ? (
                <img src={ayarlar.logo} alt="Şirket Logosu" className="max-h-24" />
             ) : (
               <h1 className="text-2xl font-bold">{ayarlar.sirketBilgileri.ad}</h1>
             )}
             <p className="text-sm text-gray-500 mt-2">
                  {ayarlar.sirketBilgileri.adres}<br />
                  Telefon: {ayarlar.sirketBilgileri.telefon} <br />
                  E-posta: {ayarlar.sirketBilgileri.email}
              </p>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-bold uppercase" style={{color: ayarlar.faturaRenk}}>FATURA</h1>
            <div className="mt-4 text-sm">
              <p><span className="font-semibold text-gray-600">Fatura No:</span> {fatura.faturaNo}</p>
              <p><span className="font-semibold text-gray-600">Fatura Tarihi:</span> {formatDate(fatura.faturaTarihi)}</p>
            </div>
          </div>
        </header>

        {/* Müşteri Bilgileri */}
        <section className="flex justify-between mt-8">
          <div>
              <h2 className="text-sm font-semibold uppercase text-gray-500">FATURA KESİLEN</h2>
              <p className="text-lg font-bold mt-1">{varlikAdi}</p>
              <p className="text-sm text-gray-600">
                  {varlikAdres}<br/>
                  {varlikEmail}<br/>
                  {varlikTelefon}
              </p>
          </div>
          <div className="text-right">
              <h2 className="text-sm font-semibold uppercase text-gray-500">ÖDEME DETAYLARI</h2>
              <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Ödeme Tarihi:</span> {formatDate(fatura.odemeTarihi)}<br/>
                  <span className="font-semibold">Ödeme Tipi:</span> {fatura.odemeTipi}<br/>
                  {fatura.cekNumarasi && <><span className="font-semibold">Çek No:</span> {fatura.cekNumarasi}<br/></>}
                  <span className="font-semibold">Durum:</span> <span className="font-bold">{fatura.odemeDurumu}</span>
              </p>
          </div>
        </section>

        {/* Fatura Kalemleri */}
        <section className="mt-10">
          <table className="w-full">
            <thead >
              <tr className="text-left text-white text-sm uppercase" style={{backgroundColor: ayarlar.faturaRenk}}>
                <th className="p-3 font-semibold">Açıklama</th>
                <th className="p-3 font-semibold text-center w-20">Adet</th>
                <th className="p-3 font-semibold text-center w-20">Birim</th>
                <th className="p-3 font-semibold text-right w-32">Birim Fiyat</th>
                <th className="p-3 font-semibold text-right w-32">Toplam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {fatura.kalemler.map(kalem => (
                <tr key={kalem.id}>
                  <td className="p-3">{kalem.aciklama}</td>
                  <td className="p-3 text-center">{kalem.adet}</td>
                  <td className="p-3 text-center">{kalem.birim}</td>
                  <td className="p-3 text-right">{sembol}{kalem.birimFiyat.toFixed(2)}</td>
                  <td className="p-3 text-right font-semibold">{sembol}{kalem.toplam.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        
        {/* Toplamlar */}
         <section className="flex justify-between mt-8">
          <div className="w-1/2 text-sm text-gray-600">
              {fatura.aciklama && (
                  <>
                      <h3 className="font-semibold text-gray-700">Notlar</h3>
                      <p>{fatura.aciklama}</p>
                  </>
              )}
          </div>
          <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>{sembol}{fatura.araToplam.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                  <span className="text-gray-600">Vergi ({fatura.vergiOrani}%)</span>
                  <span>{sembol}{vergiTutari.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span className="text-slate-800">GENEL TOPLAM</span>
                  <span className="text-slate-800">{sembol}{fatura.toplamTutar.toFixed(2)}</span>
              </div>
               <div className="flex justify-between text-green-600">
                  <span >Ödenen Tutar</span>
                  <span>{sembol}{odenenTutar.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t-2 pt-2" style={{borderColor: ayarlar.faturaRenk}}>
                  <span style={{color: ayarlar.faturaRenk}}>KALAN TUTAR</span>
                  <span style={{color: ayarlar.faturaRenk}}>{sembol}{kalanTutar.toFixed(2)}</span>
              </div>
          </div>
        </section>

         {/* Footer */}
        <footer className="mt-16 pt-6 border-t text-center text-xs text-gray-500">
              <p>Ödemeler için teşekkür ederiz. Sorularınız için lütfen bizimle iletişime geçin.</p>
              <p className="mt-1">{ayarlar.sirketBilgileri.ad} | {ayarlar.sirketBilgileri.webSitesi}</p>
        </footer>
      </div>
    </div>
  );
};

export default FaturaSablonu;