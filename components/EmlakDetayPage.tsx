import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Emlak, MedyaDosyasi, Sozlesme, Varlik, EmlakOdeme, GiderTuru, Ayarlar, Komisyon, EmlakDanismani } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/AppIcons';
import FileViewerModal from './FileViewerModal';
import DatePickerInput from './DatePickerInput';

interface EmlakDetayPageProps {
  emlak: Emlak;
  sozlesmeler: Sozlesme[];
  varliklar: Varlik[];
  emlakOdemeler: EmlakOdeme[];
  giderTurleri: GiderTuru[];
  ayarlar: Ayarlar;
  komisyonlar: Komisyon[];
  emlakDanismanlari: EmlakDanismani[];
  onBack: () => void;
  onCokluDosyaEkle: (emlakId: number, dosyalar: MedyaDosyasi[], dosyaTipi: 'resim' | 'video') => void;
  onDosyaSil: (emlakId: number, dosyaAdi: string, dosyaTipi: 'resim' | 'video') => void;
  onDosyaVeriGuncelle: (emlakId: number, dosyaAdi: string, dosyaTipi: 'resim' | 'video', veri: string) => void;
}

const EmlakDetayPage: React.FC<EmlakDetayPageProps> = ({ emlak, sozlesmeler, varliklar, emlakOdemeler, giderTurleri, ayarlar, komisyonlar, emlakDanismanlari, onBack, onCokluDosyaEkle, onDosyaSil, onDosyaVeriGuncelle }) => {
  const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<MedyaDosyasi | null>(null);
  const [tarihFiltresi, setTarihFiltresi] = useState<{ baslangic: string, bitis: string }>({ baslangic: '', bitis: '' });
  const resimInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const emlakRef = useRef(emlak);
  emlakRef.current = emlak;

  const ilgiliSozlesme = sozlesmeler.find(s => s.id === emlak.sozlesmeId);
  const sozlesmeTarafi = ilgiliSozlesme ? varliklar.find(v => v.id === ilgiliSozlesme.varlikId) : null;
  const tarafAdi = sozlesmeTarafi ? (sozlesmeTarafi.type === 'musteri' ? `${sozlesmeTarafi.isim} ${sozlesmeTarafi.soyisim}` : sozlesmeTarafi.sirketAdi) : '';
  const danismanMap = useMemo(() => new Map(emlakDanismanlari.map(d => [d.id, d.type === 'kisi' ? `${d.isim} ${d.soyisim}` : d.sirketAdi])), [emlakDanismanlari]);

  const ilgiliKomisyonlar = useMemo(() => {
    if (!emlak.sozlesmeId) return [];
    return komisyonlar.filter(k => k.sozlesmeIds.includes(emlak.sozlesmeId!));
  }, [komisyonlar, emlak.sozlesmeId]);


  const filtrelenmisOdemeler = useMemo(() => {
    return emlakOdemeler
      .filter(odeme => odeme.emlakId === emlak.id)
      .filter(odeme => {
        if (!tarihFiltresi.baslangic || !tarihFiltresi.bitis) return true;
        const odemeTarihi = new Date(odeme.tarih);
        const baslangic = new Date(tarihFiltresi.baslangic);
        const bitis = new Date(tarihFiltresi.bitis);
        bitis.setHours(23, 59, 59, 999); // Bitiş tarihini gün sonu olarak ayarla
        return odemeTarihi >= baslangic && odemeTarihi <= bitis;
      })
      .sort((a,b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
  }, [emlakOdemeler, emlak.id, tarihFiltresi]);


  useEffect(() => {
    return () => {
      const currentEmlak = emlakRef.current;
      const allMedia = [...currentEmlak.resimler, ...currentEmlak.videolar];
      allMedia.forEach(media => {
        if (media.objectUrl && media.objectUrl.startsWith('blob:')) {
          URL.revokeObjectURL(media.objectUrl);
        }
      });
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, dosyaTipi: 'resim' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // FIX: Explicitly type the array as File[] to prevent type inference issues.
    const filesArray: File[] = Array.from(files);

    const previewDosyalar: MedyaDosyasi[] = filesArray.map(file => ({
        veri: '', 
        tip: file.type,
        ad: file.name,
        objectUrl: URL.createObjectURL(file)
    }));

    onCokluDosyaEkle(emlak.id, previewDosyalar, dosyaTipi);

    filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Veri = reader.result as string;
            onDosyaVeriGuncelle(emlak.id, file.name, dosyaTipi, base64Veri);
        };
        reader.onerror = (error) => {
            console.error(`Dosya okunurken hata: ${file.name}`, error);
        };
        reader.readAsDataURL(file);
    });
    
    if (e.target) e.target.value = '';
  };
  
  const handleDosyaSil = (dosyaAdi: string, dosyaTipi: 'resim' | 'video') => {
    onDosyaSil(emlak.id, dosyaAdi, dosyaTipi);
  };

  const InfoField: React.FC<{label: string; value: string}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-md font-semibold text-slate-800">{value}</p>
    </div>
  );
  
  const MedyaGaleri: React.FC<{ dosyalar: MedyaDosyasi[], tip: 'resim' | 'video'}> = ({dosyalar, tip}) => (
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {dosyalar.map(dosya => {
            const src = dosya.objectUrl || dosya.veri;
            return (
                <div key={dosya.ad} className="relative group aspect-square">
                    {tip === 'resim' ? (
                        <img src={src} alt={dosya.ad} onClick={() => setGoruntulenecekDosya(dosya)} className="w-full h-full object-cover rounded-lg cursor-pointer shadow-sm"/>
                    ) : (
                        <video src={src} onClick={() => setGoruntulenecekDosya(dosya)} className="w-full h-full object-cover rounded-lg cursor-pointer bg-black" />
                    )}
                    <button onClick={() => handleDosyaSil(dosya.ad, tip)} className="absolute top-1 right-1 bg-red-600 bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                        <TrashIcon />
                    </button>
                </div>
            )
        })}
     </div>
  );
  
  const durumTextMap = {
      satilik: 'Satılık',
      kiralik: 'Kiralık',
      satildi: 'Satıldı',
      kiralandi: 'Kiralandı'
  }
  const durumColorMap = {
      satilik: 'bg-emerald-100 text-emerald-800',
      kiralik: 'bg-sky-100 text-sky-800',
      satildi: 'bg-indigo-100 text-indigo-800',
      kiralandi: 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="w-full space-y-8">
      <header>
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 mb-4">
            <ArrowLeftIcon />
            <span>Geri Dön</span>
        </button>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Emlak Detayı</h1>
        <p className="text-slate-500 mt-2 text-lg">{`Blok: ${emlak.blok}, Kat: ${emlak.kat}, No: ${emlak.daireNo}`}</p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 self-start">
            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Emlak Bilgileri</h2>
                <InfoField label="Blok" value={emlak.blok} />
                <InfoField label="Kat" value={emlak.kat} />
                <InfoField label="Daire No" value={emlak.daireNo} />
                <InfoField label="Metraj" value={`${emlak.metraj} m²`} />
                <div>
                    <p className="text-sm font-medium text-slate-500">Durum</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${durumColorMap[emlak.durum]}`}>
                        {durumTextMap[emlak.durum]}
                    </span>
                </div>
                {ilgiliSozlesme && tarafAdi && (
                  <InfoField label={ilgiliSozlesme.tip === 'satis' ? 'Satın Alan' : 'Kiralayan'} value={tarafAdi} />
                )}
                <div>
                     <p className="text-sm font-medium text-slate-500">Açıklama</p>
                     <p className="text-sm text-slate-700 mt-1">{emlak.aciklama || '-'}</p>
                </div>
            </div>
            {ilgiliSozlesme && (
                <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Sözleşme Bilgisi</h2>
                    <InfoField label="Sözleşme Başlığı" value={ilgiliSozlesme.baslik} />
                    <InfoField label="Taraf" value={tarafAdi} />
                    <InfoField label="Sözleşme Tarihi" value={new Date(ilgiliSozlesme.sozlesmeTarihi).toLocaleDateString('tr-TR')} />
                    <InfoField label="Sözleşme Durumu" value={ilgiliSozlesme.durum} />
                </div>
            )}
        </div>
        
        <div className="lg:col-span-2 space-y-8 relative">
             {ilgiliKomisyonlar.length > 0 && (
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Komisyon Geçmişi</h2>
                    <ul className="divide-y divide-slate-200">
                        {ilgiliKomisyonlar.map(k => (
                            <li key={k.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-900">{danismanMap.get(k.danismanId) || 'Bilinmeyen Danışman'}</p>
                                    <p className="text-sm text-slate-500">{new Date(k.tarih).toLocaleDateString('tr-TR')}</p>
                                </div>
                                <p className="font-bold text-slate-800">
                                    {(ayarlar.paraBirimleri.find(p=>p.kod === k.paraBirimi)?.sembol || k.paraBirimi)}
                                    {k.netKomisyonTutari.toFixed(2)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Ödeme Geçmişi</h2>
                 <div className="flex items-center gap-2 mb-4">
                    <DatePickerInput value={tarihFiltresi.baslangic} onChange={date => setTarihFiltresi(f => ({...f, baslangic: date}))} />
                    <span>-</span>
                    <DatePickerInput value={tarihFiltresi.bitis} onChange={date => setTarihFiltresi(f => ({...f, bitis: date}))} />
                </div>
                 {filtrelenmisOdemeler.length > 0 ? (
                    <ul className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                        {filtrelenmisOdemeler.map(o => (
                            <li key={o.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-900">{giderTurleri.find(g=>g.id === o.giderTuruId)?.ad}</p>
                                    <p className="text-sm text-slate-500">{new Date(o.tarih).toLocaleDateString('tr-TR')}</p>
                                </div>
                                <div className='text-right'>
                                    <p className="font-bold text-slate-800">{(ayarlar.paraBirimleri.find(p=>p.kod === o.paraBirimi)?.sembol || o.paraBirimi)}{o.tutar.toFixed(2)}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.durum === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.durum}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-slate-500 text-center py-4">Bu birim için ödeme kaydı bulunamadı.</p>
                 )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Resimler</h2>
                    <button onClick={() => resimInputRef.current?.click()} className="text-sm bg-sky-500 text-white py-1 px-3 rounded-md hover:bg-sky-600 transition-colors">Resim Yükle</button>
                    <input type="file" ref={resimInputRef} onChange={(e) => handleFileChange(e, 'resim')} accept="image/*" className="hidden" multiple/>
                </div>
                {emlak.resimler.length > 0 ? <MedyaGaleri dosyalar={emlak.resimler} tip="resim" /> : <p className="text-slate-500 text-center py-4">Henüz resim yüklenmemiş.</p>}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Videolar</h2>
                    <button onClick={() => videoInputRef.current?.click()} className="text-sm bg-sky-500 text-white py-1 px-3 rounded-md hover:bg-sky-600 transition-colors">Video Yükle</button>
                    <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/*" className="hidden" multiple/>
                </div>
                {emlak.videolar.length > 0 ? <MedyaGaleri dosyalar={emlak.videolar} tip="video" /> : <p className="text-slate-500 text-center py-4">Henüz video yüklenmemiş.</p>}
            </div>
        </div>
      </main>

       {goruntulenecekDosya && (
        <FileViewerModal 
            fileUrl={goruntulenecekDosya.objectUrl || goruntulenecekDosya.veri}
            fileType={goruntulenecekDosya.tip}
            onClose={() => setGoruntulenecekDosya(null)}
        />
      )}
    </div>
  );
};
export default EmlakDetayPage;