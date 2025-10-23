// types.ts

export type Page =
  | 'dashboard'
  | 'musteri-firma'
  | 'faturalar'
  | 'cekler'
  | 'kasa'
  | 'taksitler'
  | 'projeler'
  | 'irsaliyeler'
  | 'teklifler'
  | 'sozlesmeler'
  | 'emlak'
  | 'album'
  | 'emlak-odemeler'
  | 'gider-turleri'
  | 'emlak-danismanlari'
  | 'komisyonlar'
  | 'hrm-dashboard'
  | 'calisanlar'
  | 'pozisyonlar'
  | 'avanslar'
  | 'sigorta'
  | 'maas'
  | 'hrm-raporlar'
  | 'raporlar'
  | 'telegram'
  | 'gpa-calculator'
  | 'profile'
  | 'settings'
  | 'audit-log';

export interface AuditLog {
  id: number;
  timestamp: string; // ISO date string
  kullaniciId: number;
  kullaniciAdi: string;
  eylem: string; // e.g., 'Fatura Oluşturuldu'
  detay: string; // e.g., 'Fatura No: FAT-2024-0003'
}

export interface Musteri {
  id: number;
  type: 'musteri';
  isim: string;
  soyisim: string;
  kimlikNo?: string;
  email?: string;
  telefon: string;
  adres: string;
}

export interface Firma {
  id: number;
  type: 'firma';
  sirketAdi: string;
  vergiNo?: string;
  sirketEmail?: string;
  sirketTelefon: string;
  webSitesi?: string;
  adres: string;
}

export type Varlik = Musteri | Firma;

export interface FaturaKalemi {
  id: number | string;
  aciklama: string;
  adet: number;
  birim: string;
  birimFiyat: number;
  toplam: number;
}

export interface MedyaDosyasi {
  veri: string; // base64
  tip: string; // mime type
  ad: string;
  objectUrl?: string; // for local preview
}

export interface OdemeKaydi {
  id: string;
  tarih: string;
  tutar: number;
  odemeTipi: string;
  aciklama?: string;
}

export interface Fatura {
  id: number;
  faturaNo: string;
  varlikId: number;
  projeId: number | null;
  faturaTarihi: string; // YYYY-MM-DD
  odemeTarihi: string; // YYYY-MM-DD
  tip: 'gelir' | 'gider';
  kalemler: FaturaKalemi[];
  araToplam: number;
  vergiOrani: number | string;
  toplamTutar: number;
  paraBirimi: string;
  odemeDurumu: string;
  odemeTipi: string;
  aciklama?: string;
  cekNumarasi?: string;
  ekDosya?: { veri: string; tip: string; ad: string; };
  odemeler?: OdemeKaydi[];
}

export interface Proje {
  id: number;
  ad: string;
  aciklama: string;
  baslangicTarihi: string; // YYYY-MM-DD
  bitisTarihi: string; // YYYY-MM-DD
  ilerlemeYuzdesi: number;
}

export interface Cek {
  id: number;
  makbuzNo: string;
  cekNo: string;
  varlikId: number;
  projeId: number | null;
  faturaIds: number[];
  lehtar: string;
  tutar: number;
  paraBirimi: string;
  vadeTarihi: string; // YYYY-MM-DD
  tanzimTarihi: string; // YYYY-MM-DD
  durum: string;
  aciklama?: string;
}

export interface KasaHesap {
  id: number;
  ad: string;
  paraBirimi: string;
  bakiye: number;
}

export interface KasaIslem {
  id: number;
  hesapId: number;
  tip: 'gelir' | 'gider';
  tutar: number;
  aciklama: string;
  tarih: string; // YYYY-MM-DD
  kategori: string;
  ekDosya?: { veri: string; tip: string; ad: string; };
}

export interface IrsaliyeKalemi {
  id: number | string;
  urunAdi: string;
  miktar: number;
  birim: string;
}

export interface Irsaliye {
  id: number;
  varlikId: number;
  projeId: number | null;
  tarih: string; // YYYY-MM-DD
  durum: string;
  kalemler: IrsaliyeKalemi[];
  aciklama?: string;
  ekDosya?: { veri: string; tip: string; ad: string; };
  faturaId?: number;
}

export interface Teklif {
  id: number;
  varlikId: number;
  projeId: number | null;
  konu: string;
  tutar: number;
  paraBirimi: string;
  tarih: string; // YYYY-MM-DD
  durum: string;
  aciklama?: string;
  ekDosya?: { veri: string; tip: string; ad: string; };
}

export interface Sozlesme {
  id: number;
  baslik: string;
  varlikId: number;
  projeId: number | null;
  emlakId: number | null;
  tip: 'satis' | 'kira' | 'diger';
  sozlesmeTarihi: string; // YYYY-MM-DD
  bitisTarihi?: string; // YYYY-MM-DD
  gecerlilikTarihi?: string; // YYYY-MM-DD
  toplamTutar: number;
  paraBirimi: string;
  odemeTipi: string;
  icerik: string;
  durum: string;
  ekDosya?: { veri: string; tip: string; ad: string; };
}

export interface Taksit {
  id: number;
  faturaId: number | null;
  varlikId: number;
  aciklama?: string;
  taksitNo: number;
  vadeTarihi: string; // YYYY-MM-DD
  tutar: number;
  paraBirimi: string;
  durum: 'Ödendi' | 'Ödenmedi';
  odemeTarihi?: string | null; // YYYY-MM-DD
}

export interface Emlak {
  id: number;
  projeId: number;
  blok: string;
  kat: string;
  daireNo: string;
  metraj: number;
  aciklama?: string;
  durum: 'satilik' | 'kiralik' | 'satildi' | 'kiralandi';
  resimler: MedyaDosyasi[];
  videolar: MedyaDosyasi[];
  sozlesmeId?: number | null;
}

export interface GiderTuru {
  id: number;
  ad: string;
  aciklama: string;
}

export interface EmlakOdeme {
  id: number;
  emlakId: number;
  sozlesmeId: number;
  tutar: number;
  paraBirimi: string;
  tarih: string; // YYYY-MM-DD
  giderTuruId: number;
  durum: 'Ödendi' | 'Ödenmedi';
  aciklama?: string;
  tekrarliMi: boolean;
  tekrarAraligi: 'aylik' | 'yillik' | null;
  kaynakOdemeId?: number;
  odemeTarihi?: string | null;
}

export interface DanismanKisi {
  id: number;
  type: 'kisi';
  isim: string;
  soyisim: string;
  email?: string;
  kimlikNo?: string;
  resim?: string; // base64
  telefon: string;
  adres: string;
  iban: string;
}

export interface DanismanSirket {
  id: number;
  type: 'sirket';
  sirketAdi: string;
  vergiNo?: string;
  logo?: string; // base64
  telefon: string;
  adres: string;
  iban: string;
}

export type EmlakDanismani = DanismanKisi | DanismanSirket;

export interface Komisyon {
  id: number;
  danismanId: number;
  sozlesmeIds: number[];
  tarih: string; // YYYY-MM-DD
  sozlesmeTutari: number;
  paraBirimi: string;
  komisyonYuzdesi: number;
  indirimYuzdesi: number;
  netKomisyonTutari: number;
  aciklama?: string;
}

export interface CalisanDosyasi {
    id: number;
    ad: string; // e.g., 'Kimlik Fotokopisi'
    dosyaAdi: string; // e.g., 'kimlik.pdf'
    dosyaVeri: string; // base64 data
    dosyaTipi: string; // mime type
}

export interface Calisan {
  id: number;
  isim: string;
  soyisim: string;
  dogumTarihi?: string;
  pozisyonId: number;
  iseGirisTarihi: string; // YYYY-MM-DD
  email?: string;
  telefon: string;
  adres: string;
  aktif: boolean;
  kimlikNo: string;
  sigortaNo: string;
  banka: string;
  bankaSubeAdi: string;
  hesapNumarasi: string;
  iban: string;
  tabanMaas: number;
  paraBirimi: string;
  calismaIzniVarMi: boolean;
  calismaIzniBaslangic?: string; // YYYY-MM-DD
  calismaIzniBitis?: string; // YYYY-MM-DD
  dosyalar?: CalisanDosyasi[];
}

export interface Pozisyon {
  id: number;
  ad: string;
}

export interface Avans {
  id: number;
  calisanId: number;
  tutar: number;
  paraBirimi: string;
  tarih: string; // YYYY-MM-DD
  aciklama?: string;
}

export interface HrmMaas {
  id: number;
  calisanId: number;
  donem: string; // YYYY-MM
  brutMaas: number;
  avanslar: number;
  kesilenAvans: number;
  kesintiTipi: 'tam' | 'kismi' | 'yok';
  netMaas: number;
  odendi: boolean;
  odemeTarihi?: string | null; // YYYY-MM-DD
  aktif: boolean;
}

export interface HrmSigorta {
  id: number;
  calisanId: number;
  donem: string; // YYYY-MM
  odendi: boolean;
  odemeTarihi?: string | null; // YYYY-MM-DD
}

export interface Kullanici {
  id: number;
  kullaniciAdi: string;
  sifre: string;
  rolId: number;
}

export interface Rol {
  id: number;
  ad: string;
  izinler: { [key in Page]?: 'yok' | 'okuma' | 'tam' };
}

export interface TakvimEtkinligi {
  id: string;
  aciklama: string;
  tarih: string; // YYYY-MM-DD
  tip: 'fatura' | 'proje' | 'cek-vade' | 'cek-tanzim' | 'taksit' | 'manuel' | 'calisma-izni';
  color?: string;
}

export interface Izin {
  id: number;
  calisanId: number;
  tip: string;
  baslangicTarihi: string; // YYYY-MM-DD
  bitisTarihi: string; // YYYY-MM-DD
  aciklama?: string;
}

export interface UserProfile {
  email?: string;
  phone: string;
  profilePicture: string | null;
}

export interface ParaBirimi {
  kod: string;
  sembol: string;
}

export interface CekDurumu {
  durum: string;
  renk: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  children?: MenuItem[];
}

export interface SirketBilgileri {
    ad: string;
    adres: string;
    vergiDairesi: string;
    vergiNumarasi: string;
    telefon: string;
    email?: string;
    webSitesi: string;
}

export interface Ayarlar {
  sirketBilgileri: SirketBilgileri;
  logo: string | null;
  faturaRenk: string;
  sonFaturaNumarasi: number;
  faturaNumaraSablonu: string;
  paraBirimleri: ParaBirimi[];
  odemeTipleri: string[];
  odemeDurumlari: string[];
  cekDurumlari: CekDurumu[];
  menuItems: MenuItem[];
  kasaKategorileri: string[];
  irsaliyeDurumlari: string[];
  teklifDurumlari: string[];
  taksitDurumlari: string[];
  backupConfig: {
      auto: 'off' | 'daily' | 'weekly';
      lastBackup?: string; // ISO string
  };
}

export interface TelegramAyarlari {
    botToken: string;
    chatId: string;
    active: boolean;
    today_enabled: boolean;
    today_times: string;
    full_enabled: boolean;
    full_times: string;
    eod_enabled: boolean;
    eod_times: string;
}