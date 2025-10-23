import React, { useState, useMemo } from 'react';
import { Emlak, Proje, MedyaDosyasi } from '../types';
import FileViewerModal from './FileViewerModal';

interface AlbumPageProps {
  emlaklar: Emlak[];
  projeler: Proje[];
}

const AlbumPage: React.FC<AlbumPageProps> = ({ emlaklar, projeler }) => {
  const [seciliEmlakId, setSeciliEmlakId] = useState<number | ''>('');
  const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<MedyaDosyasi | null>(null);

  const projeMap = useMemo(() => new Map(projeler.map(p => [p.id, p.ad])), [projeler]);

  const seciliEmlak = useMemo(() => {
    if (!seciliEmlakId) return null;
    return emlaklar.find(e => e.id === seciliEmlakId) || null;
  }, [seciliEmlakId, emlaklar]);

  const MedyaGaleri: React.FC<{ dosyalar: MedyaDosyasi[], tip: 'resim' | 'video'}> = ({dosyalar, tip}) => (
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {dosyalar.map(dosya => (
            <div key={dosya.ad} className="relative group aspect-square">
                {tip === 'resim' ? (
                    <img src={dosya.veri} alt={dosya.ad} onClick={() => setGoruntulenecekDosya(dosya)} className="w-full h-full object-cover rounded-lg cursor-pointer shadow-sm transition-transform group-hover:scale-105"/>
                ) : (
                    <video src={dosya.veri} onClick={() => setGoruntulenecekDosya(dosya)} className="w-full h-full object-cover rounded-lg cursor-pointer bg-black" />
                )}
                 <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-semibold text-center px-2">{dosya.ad}</span>
                </div>
            </div>
        ))}
     </div>
  );

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Emlak Medya Merkezi</h1>
        <p className="text-slate-500 mt-2 text-lg">Birimlerin resim ve video galerilerini merkezi olarak görüntüleyin.</p>
      </header>

      <main className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <label htmlFor="emlak-secimi" className="block text-lg font-medium text-slate-700 mb-2">
            Görüntülenecek Birimi Seçin
          </label>
          <select
            id="emlak-secimi"
            value={seciliEmlakId}
            onChange={e => setSeciliEmlakId(Number(e.target.value))}
            className="w-full max-w-lg p-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>Lütfen bir birim seçin...</option>
            {emlaklar.map(emlak => (
              <option key={emlak.id} value={emlak.id}>
                {projeMap.get(emlak.projeId) || 'Bilinmeyen Proje'} - {emlak.blok} Blok, Kat {emlak.kat}, No {emlak.daireNo}
              </option>
            ))}
          </select>
        </div>

        {seciliEmlak ? (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-3">Resimler</h2>
              {seciliEmlak.resimler.length > 0 ? (
                <MedyaGaleri dosyalar={seciliEmlak.resimler} tip="resim" />
              ) : (
                <p className="text-slate-500 text-center py-8">Bu birim için resim bulunamadı.</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-3">Videolar</h2>
              {seciliEmlak.videolar.length > 0 ? (
                <MedyaGaleri dosyalar={seciliEmlak.videolar} tip="video" />
              ) : (
                <p className="text-slate-500 text-center py-8">Bu birim için video bulunamadı.</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-slate-500 text-lg">Lütfen galeriyi görüntülemek için yukarıdan bir birim seçin.</p>
          </div>
        )}
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

export default AlbumPage;