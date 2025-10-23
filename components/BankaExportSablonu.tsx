import React from 'react';
import { HrmMaas, SirketBilgileri } from '../types';

interface BankaExportSablonuProps {
  maaslar: (HrmMaas & { calisan?: any })[]; // calisan is populated in MaasPage
  sirketBilgileri: SirketBilgileri;
  donem: string;
  exportTipi: 'net' | 'brut';
}

const BankaExportSablonu: React.FC<BankaExportSablonuProps> = ({ maaslar, sirketBilgileri, donem, exportTipi }) => {
  const today = new Date().toLocaleDateString('tr-TR');
  const [year, month] = donem.split('-');
  const donemAdi = new Date(Number(year), Number(month) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="w-[800px] bg-white p-12 font-serif text-gray-800 text-sm" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <p className="text-right mb-4">{today}</p>
      
      <h1 className="text-center text-xl font-bold mb-4">MÜŞTERİ HESAP LİSTESİ</h1>
      
      <div className="mb-6">
        <p>Sayın Garanti Bankası,</p>
        <p className="mt-2">
            Türkiye Garanti Bankası A.Ş. nezdinde açılmış olan vadesiz ve vadeli hesaplarınıza ilişkin
            bilgiler aşağıda listelenmektedir.
        </p>
      </div>

      <table className="w-full border-collapse border border-black">
        <thead>
          <tr className="bg-gray-100 text-black">
            <th className="border border-black p-2 font-bold text-center">İsim Soyisim</th>
            <th className="border border-black p-2 font-bold text-center">Döviz Cinsi</th>
            <th className="border border-black p-2 font-bold text-center">Şube Adı</th>
            <th className="border border-black p-2 font-bold text-center">Hesap Numarası</th>
            <th className="border border-black p-2 font-bold text-center">Iban</th>
            <th className="border border-black p-2 font-bold text-center">Ödenecek Meblağ</th>
          </tr>
        </thead>
        <tbody className="text-black">
          {maaslar.filter(m => m.calisan).map(m => (
            <tr key={m.id}>
              <td className="border border-black p-2">{m.calisan.isim} {m.calisan.soyisim}</td>
              <td className="border border-black p-2">{m.calisan.paraBirimi}</td>
              <td className="border border-black p-2">{m.calisan.bankaSubeAdi}</td>
              <td className="border border-black p-2">{m.calisan.hesapNumarasi}</td>
              <td className="border border-black p-2">{m.calisan.iban}</td>
              <td className="border border-black p-2 text-right">
                {(exportTipi === 'net' ? m.netMaas : m.brutMaas).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <p>
            {donemAdi.toUpperCase()} ayı maaşının ödemesi ile ilgili gereğinin yapılmasını rica ediyoruz.
        </p>
      </div>

      <div className="mt-8 text-right">
        <p>Saygılarımızla,</p>
        <p className="font-bold">{sirketBilgileri.ad}</p>
      </div>
    </div>
  );
};

export default BankaExportSablonu;