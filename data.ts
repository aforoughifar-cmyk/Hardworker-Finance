// FIX: Created full content for data.ts
import { useState } from 'react';
import { 
    Fatura, Varlik, Proje, Cek, Ayarlar, TakvimEtkinligi, UserProfile, Taksit,
    KasaHesap, KasaIslem, Irsaliye, Teklif, Sozlesme, Emlak, GiderTuru, EmlakOdeme,
    EmlakDanismani, Komisyon, Calisan, Pozisyon, Avans, HrmMaas, HrmSigorta, TelegramAyarlari,
    Kullanici, Rol, Izin, AuditLog
} from './types';

const initialVarliklar: Varlik[] = [
    { id: 1, type: 'musteri', isim: 'Ahmet', soyisim: 'Yılmaz', kimlikNo: '12345678901', email: 'ahmet.yilmaz@example.com', telefon: '0555 123 45 67', adres: 'İstanbul' },
    { id: 2, type: 'firma', sirketAdi: 'ABC İnşaat', vergiNo: '111222333', sirketEmail: 'info@abcinsaat.com', sirketTelefon: '0212 987 65 43', webSitesi: 'www.abcinsaat.com', adres: 'Ankara' },
];

const initialProjeler: Proje[] = [
    { id: 1, ad: 'Mavi Konakları', aciklama: 'Lüks konut projesi', baslangicTarihi: '2023-01-15', bitisTarihi: '2024-12-31', ilerlemeYuzdesi: 65 },
    { id: 2, ad: 'Ofis Tower', aciklama: 'İş merkezi inşaatı', baslangicTarihi: '2022-06-01', bitisTarihi: '2024-08-01', ilerlemeYuzdesi: 90 },
];

const initialFaturalar: Fatura[] = [
    { id: 1, faturaNo: 'FAT-2024-0001', varlikId: 1, projeId: 1, faturaTarihi: '2024-07-10', odemeTarihi: '2024-08-09', tip: 'gelir', kalemler: [{ id: 1, aciklama: 'Danışmanlık Hizmeti', adet: 1, birim: 'ay', birimFiyat: 5000, toplam: 5000 }], araToplam: 5000, vergiOrani: 18, toplamTutar: 5900, paraBirimi: 'TRY', odemeDurumu: 'Ödendi', odemeTipi: 'Havale' },
    { id: 2, faturaNo: 'FAT-2024-0002', varlikId: 2, projeId: 1, faturaTarihi: '2024-07-15', odemeTarihi: '2024-07-25', tip: 'gider', kalemler: [{ id: 2, aciklama: 'Çimento', adet: 100, birim: 'torba', birimFiyat: 150, toplam: 15000 }], araToplam: 15000, vergiOrani: 18, toplamTutar: 17700, paraBirimi: 'TRY', odemeDurumu: 'Ödenmedi', odemeTipi: 'Nakit' },
];

const initialCekler: Cek[] = [
    { id: 1, makbuzNo: 'MAK-101', cekNo: 'CK-987654', varlikId: 2, projeId: 1, faturaIds: [2], lehtar: 'Çimento A.Ş.', tutar: 17700, paraBirimi: 'TRY', vadeTarihi: '2024-08-15', tanzimTarihi: '2024-07-15', durum: 'Beklemede' },
];

const initialAyarlar: Ayarlar = {
    sirketBilgileri: { ad: 'Hardworker İnşaat', adres: 'Örnek Mah. Test Sk. No:123', vergiDairesi: 'Büyük Mükellefler', vergiNumarasi: '1234567890', telefon: '0216 123 45 67', email: 'contact@hardworker.com', webSitesi: 'www.hardworker.com' },
    logo: null,
    faturaRenk: '#4f46e5',
    sonFaturaNumarasi: 2,
    faturaNumaraSablonu: 'FAT-{YYYY}-{NNNN}',
    paraBirimleri: [{ kod: 'TRY', sembol: '₺' }, { kod: 'USD', sembol: '$' }, { kod: 'EUR', sembol: '€' }],
    odemeTipleri: ['Nakit', 'Havale/EFT', 'Kredi Kartı', 'Çek'],
    odemeDurumlari: ['Ödendi', 'Ödenmedi', 'Kısmen Ödendi', 'İptal'],
    cekDurumlari: [{ durum: 'Beklemede', renk: '#f59e0b' }, { durum: 'Ödendi', renk: '#10b981' }, { durum: 'İptal Edildi', renk: '#6b7280' }],
    menuItems: [
        { id: 'dashboard', label: 'Gösterge Paneli', icon: 'HomeIcon', visible: true },
        { id: 'musteri-firma', label: 'Müşteriler & Firmalar', icon: 'UsersIcon', visible: true },
        { 
            id: 'finans', label: 'Finans Yönetimi', icon: 'ReceiptIcon', visible: true,
            children: [
                { id: 'faturalar', label: 'Faturalar', icon: 'ReceiptIcon', visible: true },
                { id: 'cekler', label: 'Çekler', icon: 'ChequeIcon', visible: true },
                { id: 'kasa', label: 'Kasa', icon: 'SafeIcon', visible: true },
                { id: 'taksitler', label: 'Taksitler', icon: 'PieChartIcon', visible: true },
            ]
        },
        { 
            id: 'operasyon', label: 'Operasyon', icon: 'BriefcaseIcon', visible: true,
            children: [
                { id: 'projeler', label: 'Projeler', icon: 'BriefcaseIcon', visible: true },
                { id: 'irsaliyeler', label: 'İrsaliyeler', icon: 'ClipboardListIcon', visible: true },
                { id: 'teklifler', label: 'Teklifler', icon: 'TagIcon', visible: true },
                { id: 'sozlesmeler', label: 'Sözleşmeler', icon: 'DocumentTextIcon', visible: true },
            ]
        },
        { 
            id: 'emlakyonetimi', label: 'Emlak Yönetimi', icon: 'HomeModernIcon', visible: true,
            children: [
                { id: 'emlak', label: 'Emlak Birimleri', icon: 'HomeModernIcon', visible: true },
                { id: 'album', label: 'Medya Merkezi', icon: 'PhotographIcon', visible: true },
                { id: 'emlak-odemeler', label: 'Faturalar & Ödemeler', icon: 'ReceiptIcon', visible: true },
                { id: 'gider-turleri', label: 'Gider Türleri', icon: 'TagIcon', visible: true },
                { id: 'emlak-danismanlari', label: 'Danışmanlar', icon: 'UsersGroupIcon', visible: true },
                { id: 'komisyonlar', label: 'Komisyonlar', icon: 'PieChartIcon', visible: true },
            ]
        },
         { 
            id: 'hrm', label: 'Personel (HRM)', icon: 'UsersGroupIcon', visible: true,
            children: [
                { id: 'hrm-dashboard', label: 'HRM Panel', icon: 'HomeIcon', visible: true },
                { id: 'calisanlar', label: 'Çalışanlar', icon: 'UsersIcon', visible: true },
                { id: 'pozisyonlar', label: 'Pozisyonlar', icon: 'BriefcaseIcon', visible: true },
                { id: 'avanslar', label: 'Avanslar', icon: 'ReceiptIcon', visible: true },
                { id: 'sigorta', label: 'Sigorta', icon: 'ClipboardListIcon', visible: true },
                { id: 'maas', label: 'Maaş/Banka', icon: 'SafeIcon', visible: true },
                { id: 'hrm-raporlar', label: 'HRM Raporları', icon: 'PieChartIcon', visible: true },
            ]
        },
        { id: 'raporlar', label: 'Raporlar', icon: 'PieChartIcon', visible: true },
        { id: 'audit-log', label: 'Aktivite Kayıtları', icon: 'ClipboardListIcon', visible: true },
        { id: 'telegram', label: 'Telegram', icon: 'PaperAirplaneIcon', visible: true },
        { id: 'gpa-calculator', label: 'GPA Hesaplayıcı', icon: 'CalculatorIcon', visible: false },
    ],
    kasaKategorileri: ['Maaş', 'Fatura Ödemesi', 'Ofis Gideri', 'Diğer'],
    irsaliyeDurumlari: ['Hazırlanıyor', 'Yolda', 'Teslim Edildi'],
    teklifDurumlari: ['Değerlendiriliyor', 'Kabul Edildi', 'Reddedildi', 'İptal'],
    taksitDurumlari: ['Ödendi', 'Ödenmedi'],
    backupConfig: {
      auto: 'off',
    },
};

const initialTelegramAyarlari: TelegramAyarlari = {
    botToken: '',
    chatId: '',
    active: false,
    today_enabled: false,
    today_times: '09:00',
    full_enabled: false,
    full_times: '12:00',
    eod_enabled: false,
    eod_times: '18:00',
};

const initialProfile: UserProfile = {
    email: 'admin@hardworker.com',
    phone: '0500 000 00 00',
    profilePicture: null,
};

const initialRoller: Rol[] = [
    {
        id: 1,
        ad: 'Admin',
        izinler: { 'dashboard': 'tam', 'musteri-firma': 'tam', 'faturalar': 'tam', 'projeler': 'tam', 'cekler': 'tam', 'kasa': 'tam', 'irsaliyeler': 'tam', 'teklifler': 'tam', 'sozlesmeler': 'tam', 'taksitler': 'tam', 'emlak': 'tam', 'emlak-odemeler': 'tam', 'gider-turleri': 'tam', 'emlak-danismanlari': 'tam', 'komisyonlar': 'tam', 'album': 'tam', 'hrm-dashboard': 'tam', 'calisanlar': 'tam', 'pozisyonlar': 'tam', 'avanslar': 'tam', 'sigorta': 'tam', 'maas': 'tam', 'hrm-raporlar': 'tam', 'raporlar': 'tam', 'telegram': 'tam', 'settings': 'tam', 'profile': 'tam', 'audit-log': 'tam' }
    }
];
const initialKullanicilar: Kullanici[] = [
    { id: 1, kullaniciAdi: 'admin', sifre: 'admin', rolId: 1 }
];

// Hook to manage mock data state
export const useMockData = () => {
  const [faturalar, setFaturalar] = useState(initialFaturalar);
  const [varliklar, setVarliklar] = useState(initialVarliklar);
  const [projeler, setProjeler] = useState(initialProjeler);
  const [cekler, setCekler] = useState(initialCekler);
  const [ayarlar, setAyarlar] = useState(initialAyarlar);
  const [profile, setProfile] = useState(initialProfile);
  const [etkinlikler, setEtkinlikler] = useState<TakvimEtkinligi[]>([]);
  const [taksitler, setTaksitler] = useState<Taksit[]>([]);
  const [kasaHesaplar, setKasaHesaplar] = useState<KasaHesap[]>([]);
  const [kasaIslemler, setKasaIslemler] = useState<KasaIslem[]>([]);
  const [irsaliyeler, setIrsaliyeler] = useState<Irsaliye[]>([]);
  const [teklifler, setTeklifler] = useState<Teklif[]>([]);
  const [sozlesmeler, setSozlesmeler] = useState<Sozlesme[]>([]);
  const [emlaklar, setEmlaklar] = useState<Emlak[]>([]);
  const [giderTurleri, setGiderTurleri] = useState<GiderTuru[]>([]);
  const [emlakOdemeler, setEmlakOdemeler] = useState<EmlakOdeme[]>([]);
  const [emlakDanismanlari, setEmlakDanismanlari] = useState<EmlakDanismani[]>([]);
  const [komisyonlar, setKomisyonlar] = useState<Komisyon[]>([]);
  const [calisanlar, setCalisanlar] = useState<Calisan[]>([]);
  const [pozisyonlar, setPozisyonlar] = useState<Pozisyon[]>([]);
  const [avanslar, setAvanslar] = useState<Avans[]>([]);
  const [maaslar, setMaaslar] = useState<HrmMaas[]>([]);
  const [sigortalar, setSigortalar] = useState<HrmSigorta[]>([]);
  const [izinler, setIzinler] = useState<Izin[]>([]);
  const [telegramAyarlari, setTelegramAyarlari] = useState<TelegramAyarlari>(initialTelegramAyarlari);
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>(initialKullanicilar);
  const [roller, setRoller] = useState<Rol[]>(initialRoller);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  return {
    faturalar, setFaturalar, varliklar, setVarliklar, projeler, setProjeler,
    cekler, setCekler, ayarlar, setAyarlar, etkinlikler, setEtkinlikler,
    profile, setProfile, taksitler, setTaksitler, kasaHesaplar, setKasaHesaplar,
    kasaIslemler, setKasaIslemler, irsaliyeler, setIrsaliyeler, teklifler, setTeklifler,
    sozlesmeler, setSozlesmeler, emlaklar, setEmlaklar, giderTurleri, setGiderTurleri,
    emlakOdemeler, setEmlakOdemeler, emlakDanismanlari, setEmlakDanismanlari, komisyonlar, setKomisyonlar,
    calisanlar, setCalisanlar, pozisyonlar, setPozisyonlar, avanslar, setAvanslar, maaslar, setMaaslar, sigortalar, setSigortalar,
    izinler, setIzinler,
    telegramAyarlari, setTelegramAyarlari, kullanicilar, setKullanicilar, roller, setRoller,
    auditLogs, setAuditLogs
  };
};
