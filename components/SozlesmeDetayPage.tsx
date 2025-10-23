import React, { useState, useMemo } from 'react';
import { Sozlesme, Varlik, Proje, Emlak, Komisyon, EmlakDanismani, Ayarlar } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import KomisyonListesi from './KomisyonListesi';
import FileViewerModal from './FileViewerModal';
import { PaperClipIcon } from './icons/AppIcons';

interface SozlesmeDetayPageProps {
  sozlesme: Sozlesme;
  onBack: () => void;
  varliklar: Varlik[];
  projeler: Proje[];
  emlaklar: Emlak[];
  komisyonlar: Komisyon[];
  emlakDanismanlari: EmlakDanismani[];
  sozlesmeler: Sozlesme[]; // KomisyonListesi için gerekli
  ayarlar: Ayarlar;
}

const SozlesmeDetayPage: React.FC<SozlesmeDetayPageProps> = ({
  sozlesme, onBack, varliklar, projeler, emlaklar, komisyonlar, emlakDanismanlari, sozlesmeler, ayarlar
}) => {
  const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<{ veri: string; tip: string; } | null>(null);

  const taraf = useMemo(() => varliklar.find(v => v.id === sozlesme.varlikId), [varliklar, sozlesme.varlikId]);
  const proje = useMemo(() => projeler.find(p => p.id === sozlesme.projeId), [projeler, sozlesme.projeId]);
  const emlak = useMemo(() => emlaklar.find(e => e.id === sozlesme.emlakId), [emlaklar, sozlesme.emlakId]);
  const ilgiliKomisyonlar = useMemo(() => komisyonlar.filter(k => k.sozlesmeIds.includes(sozlesme.id)), [komisyonlar, sozlesme.id]);

  const InfoField: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-md text-slate-800">{value || '-'}</p>
    </div>
  );

  const getVarlikAdi = (varlik: Varlik) => varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi;
  const sembol = ayarlar.paraBirimleri.find(p => p.kod === sozlesme.paraBirimi)?.sembol || sozlesme.paraBirimi;

  return (
    <div className="w-full space-y-8">
      <header>
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 mb-4">
          <ArrowLeftIcon />
          <span>Geri Dön</span>
        </button>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{sozlesme.baslik}</h1>
        <p className="text-slate-500 mt-2 text-lg">Sözleşme Raporu</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 self-start">
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Sözleşme Bilgileri</h2>
            <InfoField label="Taraf" value={taraf ? getVarlikAdi(taraf) : ''} />
            <InfoField label="İlgili Proje" value={proje?.ad} />
            <InfoField label="İlgili Emlak" value={emlak ? `${emlak.blok} Blok, Daire ${emlak.daireNo}` : ''} />
            <InfoField label="Sözleşme Tarihi" value={new Date(sozlesme.sozlesmeTarihi).toLocaleDateString('tr-TR')} />
            {sozlesme.bitisTarihi && <InfoField label="Bitiş Tarihi" value={new Date(sozlesme.bitisTarihi).toLocaleDateString('tr-TR')} />}
            {sozlesme.gecerlilikTarihi && <InfoField label="Geçerlilik Tarihi" value={new Date(sozlesme.gecerlilikTarihi).toLocaleDateString('tr-TR')} />}
            <InfoField label="Toplam Tutar" value={`${sembol}${sozlesme.toplamTutar.toLocaleString('tr-TR')}`} />
            <InfoField label="Durum" value={sozlesme.durum} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {ilgiliKomisyonlar.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-slate-800 mb-4">İlgili Komisyonlar</h2>
              <KomisyonListesi
                komisyonlar={ilgiliKomisyonlar}
                danismanlar={emlakDanismanlari}
                sozlesmeler={sozlesmeler}
                ayarlar={ayarlar}
                onEdit={() => {}}
                onDelete={() => {}}
                onPdfIndir={() => {}}
              />
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Sözleşme İçeriği</h2>
            <div className="max-w-none p-4 border rounded-md bg-slate-50 text-slate-900" dangerouslySetInnerHTML={{ __html: sozlesme.icerik }} />
          </div>

          {sozlesme.ekDosya && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Ekli Dosya</h2>
              <button onClick={() => setGoruntulenecekDosya(sozlesme.ekDosya!)} className="flex items-center gap-2 text-indigo-600 hover:underline">
                <PaperClipIcon />
                <span>{sozlesme.ekDosya.ad}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {goruntulenecekDosya && (
        <FileViewerModal
          fileUrl={goruntulenecekDosya.veri}
          fileType={goruntulenecekDosya.tip}
          onClose={() => setGoruntulenecekDosya(null)}
        />
      )}
    </div>
  );
};

export default SozlesmeDetayPage;