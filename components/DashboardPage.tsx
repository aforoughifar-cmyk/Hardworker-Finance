

import React from 'react';
// FIX: Corrected import path
import { Fatura, Varlik, Ayarlar, Proje, Cek, TakvimEtkinligi, Taksit, Emlak, Calisan } from '../types';
import StatsWidget from './StatsWidget';
import DashboardChart from './DashboardChart';
import FaturaDurumWidget from './FaturaDurumWidget';
import ProjeOzetWidget from './ProjeOzetWidget';
import CekOzetWidget from './CekOzetWidget';
import TakvimWidget from './TakvimWidget';
import EtkinlikListesi from './EtkinlikListesi';
import GunuGelenCeklerWidget from './GunuGelenCeklerWidget';
import TaksitOzetWidget from './TaksitOzetWidget';
import EmlakOzetWidget from './EmlakOzetWidget';
import CalismaIzniBitenlerWidget from './CalismaIzniBitenlerWidget';


interface DashboardPageProps {
  faturalar: Fatura[];
  varliklar: Varlik[];
  projeler: Proje[];
  cekler: Cek[];
  ayarlar: Ayarlar;
  etkinlikler: TakvimEtkinligi[];
  taksitler: Taksit[];
  emlaklar: Emlak[];
  calisanlar: Calisan[];
  etkinlikEkle: (aciklama: string, tarih: string) => void;
  // Fix: Changed the event ID type from number to string to match the TakvimEtkinligi type.
  etkinlikSil: (id: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ faturalar, varliklar, projeler, cekler, ayarlar, etkinlikler, taksitler, emlaklar, calisanlar, etkinlikEkle, etkinlikSil }) => {
  const musteriSayisi = varliklar.filter(v => v.type === 'musteri').length;
  const firmaSayisi = varliklar.filter(v => v.type === 'firma').length;

  return (
    <div className="w-full space-y-8">
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Gösterge Paneli</h1>
        <p className="text-slate-500 mt-2 text-lg">İşletmenizin genel durumuna hoş geldiniz.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsWidget musteriSayisi={musteriSayisi} firmaSayisi={firmaSayisi} />
            <ProjeOzetWidget projeler={projeler} faturalar={faturalar} ayarlar={ayarlar} />
            <CekOzetWidget cekler={cekler} ayarlar={ayarlar}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaksitOzetWidget taksitler={taksitler} />
            <EmlakOzetWidget emlaklar={emlaklar} />
          </div>
          <FaturaDurumWidget faturalar={faturalar} ayarlar={ayarlar} />
          <DashboardChart faturalar={faturalar} ayarlar={ayarlar} />
          <TakvimWidget etkinlikler={etkinlikler} onEtkinlikEkle={etkinlikEkle} />
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1 space-y-8">
            <GunuGelenCeklerWidget cekler={cekler} ayarlar={ayarlar} varliklar={varliklar} />
            <CalismaIzniBitenlerWidget calisanlar={calisanlar} />
            <EtkinlikListesi etkinlikler={etkinlikler} etkinlikSil={etkinlikSil} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;