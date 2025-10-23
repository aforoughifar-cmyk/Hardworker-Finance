import React, { useState, useMemo } from 'react';
import { Calisan, Pozisyon, HrmMaas, Avans, HrmSigorta, Izin, CalisanDosyasi } from '../types';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon, DocumentTextIcon, PhotographIcon, PdfIcon } from './icons/AppIcons';
import IzinEkleModal from './IzinEkleModal';
import DosyaEkleModal from './DosyaEkleModal';
import FileViewerModal from './FileViewerModal';
import ConfirmationModal from './ConfirmationModal';

interface CalisanDetayPageProps {
    calisan: Calisan;
    onBack: () => void;
    pozisyonlar: Pozisyon[];
    maaslar: HrmMaas[];
    avanslar: Avans[];
    sigortalar: HrmSigorta[];
    izinler: Izin[];
    onIzinSave: (izin: Omit<Izin, 'id'> | Izin) => void;
    onIzinDelete: (id: number) => void;
    onDosyaSave: (calisanId: number, dosya: Omit<CalisanDosyasi, 'id'>) => void;
    onDosyaDelete: (calisanId: number, dosyaId: number) => void;
}

const InfoField: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm text-slate-800">{value || '-'}</p>
    </div>
);

const CalisanDetayPage: React.FC<CalisanDetayPageProps> = ({
    calisan, onBack, pozisyonlar, maaslar, avanslar, sigortalar, izinler, onIzinSave, onIzinDelete, onDosyaSave, onDosyaDelete
}) => {
    const [activeTab, setActiveTab] = useState<'izinler' | 'dosyalar' | 'maas' | 'avans' | 'sigorta'>('izinler');
    const [izinModalAcik, setIzinModalAcik] = useState(false);
    const [duzenlenenIzin, setDuzenlenenIzin] = useState<Izin | null>(null);
    const [dosyaModalAcik, setDosyaModalAcik] = useState(false);
    const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<CalisanDosyasi | null>(null);
    const [dosyaDeleteConfirm, setDosyaDeleteConfirm] = useState<{ isOpen: boolean, dosyaId: number | null }>({ isOpen: false, dosyaId: null });


    const pozisyonAdi = useMemo(() => pozisyonlar.find(p => p.id === calisan.pozisyonId)?.ad || 'Bilinmiyor', [pozisyonlar, calisan.pozisyonId]);
    
    const calisanVerileri = useMemo(() => {
        const ilgiliMaaslar = maaslar.filter(m => m.calisanId === calisan.id);
        const ilgiliAvanslar = avanslar.filter(a => a.calisanId === calisan.id);
        const ilgiliSigortalar = sigortalar.filter(s => s.calisanId === calisan.id);
        const ilgiliIzinler = izinler.filter(i => i.calisanId === calisan.id);
        
        const toplamOdenenMaas = ilgiliMaaslar.filter(m => m.odendi).reduce((sum, m) => sum + m.netMaas, 0);
        const toplamAlinanAvans = ilgiliAvanslar.reduce((sum, a) => sum + a.tutar, 0);
        const toplamOdenenAvans = ilgiliMaaslar.reduce((sum, m) => sum + m.kesilenAvans, 0);
        const kalanAvansBorcu = toplamAlinanAvans - toplamOdenenAvans;
        
        const kullanilanIzinGunleri = ilgiliIzinler.reduce((total, izin) => {
            const start = new Date(izin.baslangicTarihi);
            const end = new Date(izin.bitisTarihi);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return total + diffDays;
        }, 0);

        return {
            ilgiliMaaslar,
            ilgiliAvanslar,
            ilgiliSigortalar,
            ilgiliIzinler,
            toplamOdenenMaas,
            kalanAvansBorcu,
            kullanilanIzinGunleri,
            toplamOdenenSigorta: ilgiliSigortalar.filter(s => s.odendi).length
        };
    }, [calisan.id, maaslar, avanslar, sigortalar, izinler]);

    const handleIzinKaydet = (izin: Omit<Izin, 'id'> | Izin) => {
        onIzinSave(izin);
        setIzinModalAcik(false);
    };

    const handleDosyaKaydet = (dosya: Omit<CalisanDosyasi, 'id'>) => {
        onDosyaSave(calisan.id, dosya);
        setDosyaModalAcik(false);
    }
    
    const handleDosyaDeleteConfirm = () => {
        if (dosyaDeleteConfirm.dosyaId !== null) {
            onDosyaDelete(calisan.id, dosyaDeleteConfirm.dosyaId);
        }
        setDosyaDeleteConfirm({ isOpen: false, dosyaId: null });
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <PhotographIcon />;
        if (mimeType === 'application/pdf') return <PdfIcon />;
        return <DocumentTextIcon />;
    };

    const TabButton: React.FC<{ tab: typeof activeTab, label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab ? 'bg-white border-b-0 border text-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800'}`}>
            {label}
        </button>
    );

    return (
        <div className="w-full page-container">
            <header className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 mb-4">
                    <ArrowLeftIcon />
                    <span>Çalışan Listesine Geri Dön</span>
                </button>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">{calisan.isim} {calisan.soyisim}</h1>
                <p className="text-slate-500 mt-2 text-lg">{pozisyonAdi}</p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6 self-start">
                    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Özet Bilgiler</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="Toplam Ödenen Maaş" value={`${calisanVerileri.toplamOdenenMaas.toFixed(2)} ${calisan.paraBirimi}`} />
                            <InfoField label="Kalan Avans Borcu" value={`${calisanVerileri.kalanAvansBorcu.toFixed(2)} ${calisan.paraBirimi}`} />
                            <InfoField label="Ödenen Sigorta" value={`${calisanVerileri.toplamOdenenSigorta} ay`} />
                            <InfoField label="Kullanılan İzin" value={`${calisanVerileri.kullanilanIzinGunleri} gün`} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">İletişim & İş Bilgileri</h2>
                        <InfoField label="E-posta" value={calisan.email} />
                        <InfoField label="Telefon" value={calisan.telefon} />
                        <InfoField label="İşe Giriş Tarihi" value={new Date(calisan.iseGirisTarihi).toLocaleDateString('tr-TR')} />
                        {calisan.calismaIzniVarMi && (
                            <>
                                <InfoField label="Çalışma İzni Başlangıç" value={calisan.calismaIzniBaslangic ? new Date(calisan.calismaIzniBaslangic).toLocaleDateString('tr-TR') : '-'} />
                                <InfoField label="Çalışma İzni Bitiş" value={calisan.calismaIzniBitis ? new Date(calisan.calismaIzniBitis).toLocaleDateString('tr-TR') : '-'} />
                            </>
                        )}
                        <InfoField label="Adres" value={calisan.adres} />
                        <InfoField label="Banka" value={`${calisan.banka} - ${calisan.bankaSubeAdi}`} />
                        <InfoField label="IBAN" value={calisan.iban} />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="flex border-b text-slate-800">
                        <TabButton tab="izinler" label="İzinler" />
                        <TabButton tab="dosyalar" label="Dosyalar" />
                        <TabButton tab="maas" label="Maaş Geçmişi" />
                        <TabButton tab="avans" label="Avans Geçmişi" />
                        <TabButton tab="sigorta" label="Sigorta Geçmişi" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        {activeTab === 'izinler' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-slate-800">İzin Kayıtları</h3>
                                    <button onClick={() => { setDuzenlenenIzin(null); setIzinModalAcik(true); }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm py-2 px-3 rounded-lg"><PlusIcon /> Yeni İzin Ekle</button>
                                </div>
                                <ul className="divide-y">
                                    {calisanVerileri.ilgiliIzinler.map(izin => (
                                        <li key={izin.id} className="py-2 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-slate-800">{izin.tip}: <span className="font-normal">{new Date(izin.baslangicTarihi).toLocaleDateString('tr-TR')} - {new Date(izin.bitisTarihi).toLocaleDateString('tr-TR')}</span></p>
                                                <p className="text-sm text-slate-500">{izin.aciklama}</p>
                                            </div>
                                            <div className="space-x-2">
                                                <button onClick={() => {setDuzenlenenIzin(izin); setIzinModalAcik(true);}}><EditIcon/></button>
                                                <button onClick={() => onIzinDelete(izin.id)}><TrashIcon/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                 {calisanVerileri.ilgiliIzinler.length === 0 && <p className="text-center py-8 text-slate-500">İzin kaydı bulunamadı.</p>}
                            </div>
                        )}
                        {activeTab === 'dosyalar' && (
                             <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-slate-800">Yüklenen Belgeler</h3>
                                    <button onClick={() => setDosyaModalAcik(true)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm py-2 px-3 rounded-lg"><PlusIcon /> Yeni Dosya Ekle</button>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(calisan.dosyalar || []).map(dosya => (
                                        <div key={dosya.id} className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-500">{getFileIcon(dosya.dosyaTipi)}</span>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{dosya.ad}</p>
                                                    <p className="text-xs text-slate-500">{dosya.dosyaAdi}</p>
                                                </div>
                                            </div>
                                            <div className="space-x-2">
                                                <button onClick={() => setGoruntulenecekDosya(dosya)} className="text-sm text-blue-600 hover:underline">Görüntüle</button>
                                                <button onClick={() => setDosyaDeleteConfirm({ isOpen: true, dosyaId: dosya.id })} className="text-red-600 hover:text-red-700"><TrashIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {(!calisan.dosyalar || calisan.dosyalar.length === 0) && <p className="text-center py-8 text-slate-500">Yüklenmiş belge bulunamadı.</p>}
                            </div>
                        )}
                         {activeTab === 'maas' && (
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-slate-800">Maaş Geçmişi</h3>
                                <ul className="divide-y">
                                    {calisanVerileri.ilgiliMaaslar.map(m => <li key={m.id} className="py-2 flex justify-between text-slate-800"><span>Dönem: {m.donem}</span> <span className="font-semibold">{m.netMaas.toFixed(2)}</span></li>)}
                                </ul>
                            </div>
                         )}
                         {activeTab === 'avans' && (
                             <div>
                                <h3 className="font-bold text-lg mb-4 text-slate-800">Avans Geçmişi</h3>
                                <ul className="divide-y">
                                    {calisanVerileri.ilgiliAvanslar.map(a => <li key={a.id} className="py-2 flex justify-between text-slate-800"><span>{new Date(a.tarih).toLocaleDateString('tr-TR')}</span> <span className="font-semibold">{a.tutar.toFixed(2)}</span></li>)}
                                </ul>
                            </div>
                         )}
                         {activeTab === 'sigorta' && (
                              <div>
                                <h3 className="font-bold text-lg mb-4 text-slate-800">Sigorta Geçmişi</h3>
                                <ul className="divide-y">
                                    {calisanVerileri.ilgiliSigortalar.map(s => <li key={s.id} className={`py-2 flex justify-between ${s.odendi ? 'text-green-600' : 'text-red-600'}`}><span>Dönem: {s.donem}</span> <span>{s.odendi ? 'Ödendi' : 'Ödenmedi'}</span></li>)}
                                </ul>
                            </div>
                         )}
                    </div>
                </div>
            </main>

            {izinModalAcik && (
                <IzinEkleModal 
                    onClose={() => setIzinModalAcik(false)}
                    onSave={handleIzinKaydet}
                    mevcutIzin={duzenlenenIzin}
                    calisanId={calisan.id}
                />
            )}
            {dosyaModalAcik && (
                <DosyaEkleModal
                    onClose={() => setDosyaModalAcik(false)}
                    onSave={handleDosyaKaydet}
                />
            )}
             {goruntulenecekDosya && (
                <FileViewerModal 
                    fileUrl={goruntulenecekDosya.dosyaVeri}
                    fileType={goruntulenecekDosya.dosyaTipi}
                    onClose={() => setGoruntulenecekDosya(null)}
                />
            )}
            {dosyaDeleteConfirm.isOpen && (
                <ConfirmationModal 
                    onClose={() => setDosyaDeleteConfirm({ isOpen: false, dosyaId: null })}
                    onConfirm={handleDosyaDeleteConfirm}
                    title="Belgeyi Sil"
                    message="Bu belgeyi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                />
            )}
        </div>
    );
};

export default CalisanDetayPage;