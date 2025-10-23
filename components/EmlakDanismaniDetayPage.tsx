
import React, { useMemo } from 'react';
import { EmlakDanismani, Komisyon, Sozlesme, Emlak, Ayarlar } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import KomisyonListesi from './KomisyonListesi'; // Reuse the list component

interface EmlakDanismaniDetayPageProps {
  danisman: EmlakDanismani;
  komisyonlar: Komisyon[];
  sozlesmeler: Sozlesme[];
  emlaklar: Emlak[];
  ayarlar: Ayarlar;
  onBack: () => void;
}

const EmlakDanismaniDetayPage: React.FC<EmlakDanismaniDetayPageProps> = ({ danisman, komisyonlar, sozlesmeler, emlaklar, onBack, ayarlar }) => {

  const ilgiliKomisyonlar = useMemo(() => {
    return komisyonlar.filter(k => k.danismanId === danisman.id);
  }, [komisyonlar, danisman.id]);
  
  const toplamKazanilanKomisyon = useMemo(() => {
      // Note: This simple sum assumes all commissions are in the same currency.
      // A more complex implementation would group by currency.
      return ilgiliKomisyonlar.reduce((acc, k) => acc + k.netKomisyonTutari, 0);
  }, [ilgiliKomisyonlar]);

  const InfoField: React.FC<{label: string; value: string}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-md text-slate-800">{value || '-'}</p>
    </div>
  );

  return (
    <div className="w-full space-y-8">
      <header>
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 mb-4">
            <ArrowLeftIcon />
            <span>Geri Dön</span>
        </button>
        <div className="flex items-center gap-4">
             <div className="flex-shrink-0 h-20 w-20 rounded-full bg-slate-100 overflow-hidden">
                <img className="h-20 w-20 object-cover" src={danisman.type === 'kisi' ? danisman.resim : danisman.logo} alt="Profil" />
            </div>
            <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
                    {danisman.type === 'kisi' ? `${danisman.isim} ${danisman.soyisim}` : danisman.sirketAdi}
                </h1>
                <p className="text-slate-500 mt-2 text-lg capitalize">{danisman.type === 'kisi' ? 'Kişisel Danışman' : 'Danışman Şirket'}</p>
            </div>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 self-start">
            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Danışman Bilgileri</h2>
                <InfoField label="Telefon" value={danisman.telefon} />
                <InfoField label="Adres" value={danisman.adres} />
                <InfoField label="IBAN" value={danisman.iban} />
                {danisman.type === 'kisi' ? (
                    <>
                        <InfoField label="E-posta" value={danisman.email} />
                        <InfoField label="Kimlik No" value={danisman.kimlikNo} />
                    </>
                ) : (
                    <>
                        <InfoField label="Vergi No" value={danisman.vergiNo} />
                    </>
                )}
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md space-y-2">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Finansal Özet</h2>
                <InfoField label="Toplam Komisyon Sayısı" value={ilgiliKomisyonlar.length.toString()} />
                <InfoField label="Toplam Kazanılan Komisyon" value={`${toplamKazanilanKomisyon.toFixed(2)}`} />
            </div>
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Alınan Komisyonlar</h2>
                <KomisyonListesi 
                    komisyonlar={ilgiliKomisyonlar}
                    danismanlar={[danisman]}
                    sozlesmeler={sozlesmeler}
                    ayarlar={ayarlar}
                    onEdit={() => alert("Düzenleme buradan yapılamaz.")}
                    onDelete={() => alert("Silme buradan yapılamaz.")}
                    onPdfIndir={() => alert("PDF indirme buradan yapılamaz.")}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default EmlakDanismaniDetayPage;
