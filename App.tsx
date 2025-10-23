// FIX: Created full content for App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import MusteriFirmaPage from './components/MusteriFirmaPage';
import FaturaPage from './components/FaturaPage';
import ProjePage from './components/ProjePage';
import CekPage from './components/CekPage';
import KasaPage from './components/KasaPage';
import IrsaliyePage from './components/IrsaliyePage';
import TeklifPage from './components/TeklifPage';
import SozlesmePage from './components/SozlesmePage';
import TaksitPage from './components/TaksitPage';
import EmlakPage from './components/EmlakPage';
import EmlakDetayPage from './components/EmlakDetayPage';
import AlbumPage from './components/AlbumPage';
import GiderTurleriPage from './components/GiderTurleriPage';
import EmlakOdemelerPage from './components/EmlakOdemelerPage';
import EmlakDanismaniPage from './components/EmlakDanismaniPage';
import EmlakDanismaniDetayPage from './components/EmlakDanismaniDetayPage';
import KomisyonPage from './components/KomisyonPage';

import HrmDashboardPage from './components/HrmDashboardPage';
import CalisanlarPage from './components/CalisanlarPage';
import CalisanDetayPage from './components/CalisanDetayPage';
import PozisyonlarPage from './components/PozisyonlarPage';
import AvanslarPage from './components/AvanslarPage';
import SigortaPage from './components/SigortaPage';
import MaasPage from './components/MaasPage';
import HrmRaporlarPage from './components/HrmRaporlarPage';

import VarlikDetayPage from './components/VarlikDetayPage';
import ProjeDetayPage from './components/ProjeDetayPage';
import SozlesmeDetayPage from './components/SozlesmeDetayPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import GpaCalculatorPage from './components/GpaCalculatorPage';
import RaporlarPage from './components/RaporlarPage';
import TelegramPage from './components/TelegramPage';
import AuditLogPage from './components/AuditLogPage';
import ConfirmationModal from './components/ConfirmationModal';
import { Page, Varlik, Fatura, Proje, Cek, KasaHesap, KasaIslem, Irsaliye, Teklif, Sozlesme, Taksit, Emlak, GiderTuru, EmlakOdeme, EmlakDanismani, Komisyon, Calisan, Pozisyon, Avans, HrmMaas, HrmSigorta, Musteri, Firma, Kullanici, Rol, TakvimEtkinligi, Izin, CalisanDosyasi, Ayarlar, OdemeKaydi, AuditLog } from './types';
import { useMockData } from './data'; // Using mock data hook
import { sendMessage } from './utils/telegramApi';
import { prepareTodayMessage, prepareSummaryMessage, prepareEODMessage } from './utils/telegramReports';


const App: React.FC = () => {
  const [aktifKullanici, setAktifKullanici] = useState<Kullanici | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [seciliVarlik, setSeciliVarlik] = useState<Varlik | null>(null);
  const [seciliProje, setSeciliProje] = useState<Proje | null>(null);
  const [seciliEmlak, setSeciliEmlak] = useState<Emlak | null>(null);
  const [seciliDanisman, setSeciliDanisman] = useState<EmlakDanismani | null>(null);
  const [seciliSozlesme, setSeciliSozlesme] = useState<Sozlesme | null>(null);
  const [seciliCalisan, setSeciliCalisan] = useState<Calisan | null>(null);
  const [partialPaymentModal, setPartialPaymentModal] = useState<Fatura | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  
  const mockData = useMockData();
  const {
    faturalar, setFaturalar, varliklar, setVarliklar, projeler, setProjeler,
    cekler, setCekler, ayarlar, setAyarlar, etkinlikler, setEtkinlikler,
    profile, setProfile, taksitler, setTaksitler, kasaHesaplar, setKasaHesaplar,
    kasaIslemler, setKasaIslemler, irsaliyeler, setIrsaliyeler, teklifler, setTeklifler,
    sozlesmeler, setSozlesmeler, emlaklar, setEmlaklar, giderTurleri, setGiderTurleri,
    emlakOdemeler, setEmlakOdemeler, emlakDanismanlari, setEmlakDanismanlari, komisyonlar, setKomisyonlar,
    calisanlar, setCalisanlar, pozisyonlar, setPozisyonlar, avanslar, setAvanslar,
    maaslar, setMaaslar, sigortalar, setSigortalar, izinler, setIzinler, telegramAyarlari, setTelegramAyarlari,
    kullanicilar, setKullanicilar, roller, setRoller, auditLogs, setAuditLogs
  } = mockData;

  useEffect(() => {
    const rememberedUserJson = localStorage.getItem('aktifKullanici');
    if (rememberedUserJson) {
        try {
            setAktifKullanici(JSON.parse(rememberedUserJson));
        } catch (e) {
            localStorage.removeItem('aktifKullanici');
        }
    }
  }, []);

  const handleLoginSuccess = (user: Kullanici) => {
    setAktifKullanici(user);
  };

  const handleLogoutRequest = () => setLogoutConfirmOpen(true);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('aktifKullanici');
    setAktifKullanici(null);
    setLogoutConfirmOpen(false);
  };
  
  const addAuditLog = useCallback((eylem: string, detay: string) => {
      if (!aktifKullanici) return;
      const newLog: AuditLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        kullaniciId: aktifKullanici.id,
        kullaniciAdi: aktifKullanici.kullaniciAdi,
        eylem,
        detay
      };
      setAuditLogs(prev => [newLog, ...prev]);
  }, [aktifKullanici, setAuditLogs]);


  // --- GENERIC DATA HANDLERS ---
  const createSaveHandler = <T extends { id: number }>(setter: React.Dispatch<React.SetStateAction<T[]>>, eylemPrefix: string, detayFn: (item: T) => string) => 
    (item: Omit<T, 'id'> | T) => {
      let savedItem: T;
      setter(produce(draft => {
        if ('id' in item && item.id !== 0) {
          const index = draft.findIndex(i => i.id === item.id);
          if (index !== -1) {
              (draft as T[])[index] = item;
              savedItem = item;
          }
        } else {
          const newId = Math.max(0, ...draft.map(i => i.id)) + 1;
          const newItem = { ...item, id: newId } as T;
          (draft as T[]).push(newItem);
          savedItem = newItem;
        }
      }));
      // @ts-ignore
      addAuditLog(`${eylemPrefix} ${'id' in item && item.id !== 0 ? 'Güncellendi' : 'Oluşturuldu'}`, detayFn(savedItem));
  };
  
  const createDeleteHandler = <T extends { id: number }>(setter: React.Dispatch<React.SetStateAction<T[]>>, eylemPrefix: string, detayFn: (item: T | undefined) => string) => 
    (id: number) => {
      const itemToDelete = (setter as any)( (prev: T[]) => {
          const item = prev.find(p => p.id === id);
          addAuditLog(`${eylemPrefix} Silindi`, detayFn(item));
          return prev.filter(p => p.id !== id);
      });
  };

  const getDefaultColorForTip = (tip: TakvimEtkinligi['tip']) => {
    switch(tip) {
        case 'fatura': return '#3b82f6'; // blue-500
        case 'proje': return '#8b5cf6'; // violet-500
        case 'cek-vade': return '#ef4444'; // red-500
        case 'cek-tanzim': return '#f59e0b'; // amber-500
        case 'taksit': return '#14b8a6'; // teal-500
        case 'calisma-izni': return '#f97316'; // orange-500
        default: return '#6b7280'; // gray-500
    }
  }
  
  const handleEtkinlikEkle = (aciklama: string, tarih: string, tip: TakvimEtkinligi['tip'], color?: string) => {
    const yeniEtkinlik: TakvimEtkinligi = {
        id: `etkinlik-${Date.now()}-${Math.random()}`,
        aciklama,
        tarih,
        tip,
        color: color || getDefaultColorForTip(tip)
    };
    setEtkinlikler(prev => [...prev, yeniEtkinlik]);
  };
  
  // --- SPECIFIC HANDLERS ---
  const handleVarlikSave = (varlik: Omit<Varlik, 'id'> | Varlik) => {
    const isDuplicate = varliklar.some(v => {
        if ('id' in varlik && v.id === varlik.id) return false;
        if (v.type === 'musteri' && varlik.type === 'musteri' && (v.email && (varlik as Musteri).email && v.email === (varlik as Musteri).email)) return true;
        if (v.type === 'firma' && varlik.type === 'firma' && (v.sirketAdi === (varlik as Firma).sirketAdi)) return true;
        return false;
    });

    if (isDuplicate) {
        alert("Bu isimde veya e-postada bir müşteri/firma zaten mevcut.");
        return;
    }
    
    const isNew = !('id' in varlik) || varlik.id === 0;
    createSaveHandler(setVarliklar, 'Varlık', item => item.type === 'musteri' ? `${item.isim} ${item.soyisim}` : item.sirketAdi)(varlik);

    if (isNew) {
        const varlikAdi = varlik.type === 'musteri' ? `${(varlik as Musteri).isim} ${(varlik as Musteri).soyisim}` : (varlik as Firma).sirketAdi;
        handleEtkinlikEkle(`Yeni ${varlik.type === 'musteri' ? 'müşteri' : 'firma'} eklendi: ${varlikAdi}`, new Date().toISOString().split('T')[0], 'manuel');
    }
  };

  const handleFaturaSave = (fatura: Omit<Fatura, 'id'> | Fatura, irsaliyeId?: number) => {
    const isNew = !('id' in fatura) || fatura.id === 0;
    createSaveHandler(setFaturalar, 'Fatura', item => item.faturaNo)(fatura);
    
    if (isNew) {
        const varlik = varliklar.find(v => v.id === fatura.varlikId);
        const varlikAdi = varlik ? (varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi) : "";
        handleEtkinlikEkle(`Fatura #${fatura.faturaNo} (${varlikAdi}) son ödeme tarihi.`, fatura.odemeTarihi, 'fatura');
        handleEtkinlikEkle(`Fatura #${fatura.faturaNo} oluşturuldu.`, fatura.faturaTarihi, 'manuel');
    }

    if (irsaliyeId) {
        setIrsaliyeler(produce(draft => {
            const irsaliye = draft.find(i => i.id === irsaliyeId);
            const savedFaturaId = 'id' in fatura ? fatura.id : Math.max(0, ...faturalar.map(f => f.id)) + 1;
            if (irsaliye) irsaliye.faturaId = savedFaturaId;
        }));
    }
  };
  
  const handleFaturaDurumGuncelle = (faturaId: number, yeniDurum: string) => {
      const fatura = faturalar.find(f => f.id === faturaId);
      if (!fatura) return;

      if (yeniDurum === 'Kısmen Ödendi') {
          setPartialPaymentModal(fatura);
      } else {
          setFaturalar(produce(draft => {
              const faturaToUpdate = draft.find(f => f.id === faturaId);
              if(faturaToUpdate) {
                  faturaToUpdate.odemeDurumu = yeniDurum;
                   if (yeniDurum === 'Ödendi') {
                        const odenenTutar = faturaToUpdate.odemeler?.reduce((sum, p) => sum + p.tutar, 0) || 0;
                        const kalanTutar = faturaToUpdate.toplamTutar - odenenTutar;
                        if (kalanTutar > 0) {
                            if (!faturaToUpdate.odemeler) faturaToUpdate.odemeler = [];
                            faturaToUpdate.odemeler.push({
                                id: `odeme-${Date.now()}`,
                                tarih: new Date().toISOString().split('T')[0],
                                tutar: kalanTutar,
                                odemeTipi: 'Bilinmiyor'
                            });
                        }
                    }
              }
          }));
           addAuditLog('Fatura Durumu Güncellendi', `Fatura #${fatura.faturaNo} durumu: ${yeniDurum}`);
      }
  };

  const handlePartialPaymentSave = (faturaId: number, odeme: Omit<OdemeKaydi, 'id'>) => {
        setFaturalar(produce(draft => {
            const fatura = draft.find(f => f.id === faturaId);
            if (fatura) {
                if (!fatura.odemeler) {
                    fatura.odemeler = [];
                }
                fatura.odemeler.push({ ...odeme, id: `odeme-${Date.now()}` });

                const toplamOdenen = fatura.odemeler.reduce((sum, p) => sum + p.tutar, 0);

                if (Math.abs(toplamOdenen - fatura.toplamTutar) < 0.01) {
                    fatura.odemeDurumu = 'Ödendi';
                } else {
                    fatura.odemeDurumu = 'Kısmen Ödendi';
                }
                addAuditLog('Kısmi Ödeme Eklendi', `Fatura #${fatura.faturaNo} için ${odeme.tutar} tutarında ödeme.`);
            }
        }));
        setPartialPaymentModal(null);
    };


  const handleCekSave = (cekToSave: Omit<Cek, 'id'> | Cek) => {
    const originalCekBeforeSave = 'id' in cekToSave ? cekler.find(c => c.id === cekToSave.id) : undefined;
    
    createSaveHandler(setCekler, 'Çek', item => `Çek No: ${item.cekNo}`)(cekToSave);
    const finalCek = { ...cekToSave, id: 'id' in cekToSave ? cekToSave.id : Math.max(0, ...cekler.map(c => c.id)) + 1 };

    setFaturalar(produce(draft => {
        // Step 1: Clean up old payment records and check numbers from invoices previously linked to this check.
        const oldInvoiceIds = originalCekBeforeSave?.faturaIds || [];
        const allPotentiallyAffectedIds = new Set([...oldInvoiceIds, ...(finalCek.faturaIds || [])]);
        
        allPotentiallyAffectedIds.forEach(invoiceId => {
            const fatura = draft.find(f => f.id === invoiceId);
            if (fatura) {
                // Remove previous payment from this check
                if (fatura.odemeler) {
                    fatura.odemeler = fatura.odemeler.filter(p => p.aciklama !== `Çek No: ${finalCek.cekNo}`);
                }
                // Unlink check number if no longer associated
                if(fatura.cekNumarasi === finalCek.cekNo && !finalCek.faturaIds.includes(fatura.id)) {
                    fatura.cekNumarasi = undefined;
                }
            }
        });

        // Step 2: Apply the (potentially updated) check amount to the currently linked invoices.
        if (finalCek.faturaIds && finalCek.faturaIds.length > 0) {
            let odenecekTutar = finalCek.tutar;
            const ilgiliFaturalar = draft.filter(f => finalCek.faturaIds.includes(f.id));
            ilgiliFaturalar.sort((a,b) => new Date(a.faturaTarihi).getTime() - new Date(b.faturaTarihi).getTime());

            for (const fatura of ilgiliFaturalar) {
                fatura.cekNumarasi = finalCek.cekNo;
                
                if (odenecekTutar > 0.001) {
                    const odenmis = fatura.odemeler?.reduce((sum, p) => sum + p.tutar, 0) || 0;
                    const kalanBorc = fatura.toplamTutar - odenmis;
                    
                    if (kalanBorc > 0) {
                        const buFaturayaOdeme = Math.min(odenecekTutar, kalanBorc);
                        if (!fatura.odemeler) fatura.odemeler = [];
                        fatura.odemeler.push({
                           id: `odeme-cek-${finalCek.id}-${fatura.id}-${Date.now()}`,
                           tarih: finalCek.tanzimTarihi,
                           tutar: buFaturayaOdeme,
                           odemeTipi: 'Çek',
                           aciklama: `Çek No: ${finalCek.cekNo}`
                        });
                        odenecekTutar -= buFaturayaOdeme;
                    }
                }
            }
        }
        
        // Step 3: Recalculate status for all affected invoices.
        allPotentiallyAffectedIds.forEach(id => {
            const fatura = draft.find(f => f.id === id);
            if (fatura) {
                const toplamOdenen = fatura.odemeler?.reduce((sum, p) => sum + p.tutar, 0) || 0;
                if (Math.abs(toplamOdenen - fatura.toplamTutar) < 0.01) {
                    fatura.odemeDurumu = 'Ödendi';
                } else if (toplamOdenen > 0) {
                    fatura.odemeDurumu = 'Kısmen Ödendi';
                } else {
                    fatura.odemeDurumu = 'Ödenmedi';
                }
            }
        });
    }));

    setEtkinlikler(produce(draft => {
        // Remove old events
        const vadeIndex = draft.findIndex(e => e.id === `cek-vade-${finalCek.id}`);
        if (vadeIndex !== -1) draft.splice(vadeIndex, 1);
        const tanzimIndex = draft.findIndex(e => e.id === `cek-tanzim-${finalCek.id}`);
        if (tanzimIndex !== -1) draft.splice(tanzimIndex, 1);
        // Add new/updated events
        draft.push({ id: `cek-vade-${finalCek.id}`, aciklama: `Çek Vadesi: #${finalCek.cekNo}`, tarih: finalCek.vadeTarihi, tip: 'cek-vade', color: getDefaultColorForTip('cek-vade') });
        draft.push({ id: `cek-tanzim-${finalCek.id}`, aciklama: `Çek Tanzimi: #${finalCek.cekNo}`, tarih: finalCek.tanzimTarihi, tip: 'cek-tanzim', color: getDefaultColorForTip('cek-tanzim')});
    }));
  };

  const handleCekDelete = createDeleteHandler(setCekler, 'Çek', item => `Çek No: ${item?.cekNo}`);

  const handleCekDurumGuncelle = (cekId: number, yeniDurum: string) => {
       setCekler(produce(draft => {
          const cek = draft.find(c => c.id === cekId);
          if(cek) {
              cek.durum = yeniDurum;
              addAuditLog('Çek Durumu Güncellendi', `Çek #${cek.cekNo} durumu: ${yeniDurum}`);
          }
      }));
  }

  const handleKasaHesapSave = (hesap: Omit<KasaHesap, 'id' | 'bakiye'> | KasaHesap) => {
    if('id' in hesap) {
      setKasaHesaplar(produce(draft => {
        const index = draft.findIndex(h => h.id === hesap.id);
        if(index !== -1) {
          draft[index].ad = hesap.ad;
          draft[index].paraBirimi = hesap.paraBirimi;
        }
      }));
      addAuditLog('Kasa Hesabı Güncellendi', `Hesap: ${hesap.ad}`);
    } else {
       const newId = Math.max(0, ...kasaHesaplar.map(h => h.id)) + 1;
       setKasaHesaplar(prev => [...prev, { ...hesap, id: newId, bakiye: 0 }]);
       addAuditLog('Kasa Hesabı Oluşturuldu', `Hesap: ${hesap.ad}`);
    }
  };
  
  const handleKasaHesapDelete = createDeleteHandler(setKasaHesaplar, 'Kasa Hesabı', item => `Hesap: ${item?.ad}`);

  const handleKasaIslemSave = createSaveHandler(setKasaIslemler, 'Kasa İşlemi', item => `${item.aciklama} - Tutar: ${item.tutar}`);
  const handleKasaIslemDelete = createDeleteHandler(setKasaIslemler, 'Kasa İşlemi', item => `İşlem ID: ${item?.id}`);


  const handleIrsaliyeSave = createSaveHandler(setIrsaliyeler, 'İrsaliye', item => `İrsaliye ID: ${item.id}`);

  const handleIrsaliyeDurumGuncelle = (id: number, yeniDurum: string) => {
    setIrsaliyeler(produce(draft => { const irsaliye = draft.find(i => i.id === id); if (irsaliye) { irsaliye.durum = yeniDurum; } }));
    addAuditLog('İrsaliye Durumu Güncellendi', `İrsaliye ID: ${id}, Yeni Durum: ${yeniDurum}`);
  };

  const handleTeklifSave = createSaveHandler(setTeklifler, 'Teklif', item => item.konu);
  
  const handleSozlesmeSave = createSaveHandler(setSozlesmeler, 'Sözleşme', item => item.baslik);

  const handleTaksitPlanKaydet = (yeniTaksitler: Omit<Taksit, 'id'>[]) => {
      let maxId = Math.max(0, ...taksitler.map(t => t.id));
      const taksitlerToSave: Taksit[] = yeniTaksitler.map(t => ({ ...t, id: ++maxId }));
      setTaksitler(prev => [...prev, ...taksitlerToSave]);
      taksitlerToSave.forEach(taksit => {
        const fatura = faturalar.find(f => f.id === taksit.faturaId);
        const varlik = varliklar.find(v => v.id === taksit.varlikId);
        const varlikAdi = varlik ? (varlik.type === 'musteri' ? `${varlik.isim} ${varlik.soyisim}` : varlik.sirketAdi) : "";
        let aciklama = fatura ? `Taksit Vadesi: #${fatura.faturaNo} - ${varlikAdi}` : `Taksit: ${taksit.aciklama} - ${varlikAdi}`;
        handleEtkinlikEkle(`${aciklama} - ${taksit.taksitNo}. Taksit`, taksit.vadeTarihi, 'taksit');
      });
      addAuditLog('Taksit Planı Oluşturuldu', `${yeniTaksitler.length} adet taksit eklendi.`);
  };
  
  const handleTaksitGuncelle = (taksitId: number, data: Partial<Taksit>) => {
    setTaksitler(produce(draft => {
        const taksit = draft.find(t => t.id === taksitId);
        if (taksit) { Object.assign(taksit, data); }
    }));
    if (data.vadeTarihi) {
        setEtkinlikler(produce(draft => { const etkinlik = draft.find(e => e.id === `taksit-${taksitId}`); if (etkinlik) { etkinlik.tarih = data.vadeTarihi!; } }));
    }
  };

  const handleTaksitDurumGuncelle = (taksitId: number, yeniDurum: string) => {
      setTaksitler(produce(draft => {
          const taksit = draft.find(t => t.id === taksitId);
          if (taksit) {
            taksit.durum = yeniDurum as 'Ödendi' | 'Ödenmedi';
            taksit.odemeTarihi = yeniDurum === 'Ödendi' ? new Date().toISOString().split('T')[0] : null;
          }
      }));
      addAuditLog('Taksit Durumu Güncellendi', `Taksit ID: ${taksitId}, Yeni Durum: ${yeniDurum}`);
  }
  const handleTaksitDelete = createDeleteHandler(setTaksitler, 'Taksit', item => `Taksit ID: ${item?.id}`);

  const handleEmlakSave = createSaveHandler(setEmlaklar, 'Emlak', item => `Blok: ${item.blok}, Daire: ${item.daireNo}`);
  const handleEmlakOdemeSave = createSaveHandler(setEmlakOdemeler, 'Emlak Ödemesi', item => `Ödeme ID: ${item.id}`);
  const handleEmlakOdemeDurumGuncelle = (id: number, durum: 'Ödendi' | 'Ödenmedi') => {
      setEmlakOdemeler(produce(draft => { const odeme = draft.find(o => o.id === id); if (odeme) { odeme.durum = durum; odeme.odemeTarihi = durum === 'Ödendi' ? new Date().toISOString().split('T')[0] : null; } }));
      addAuditLog('Emlak Ödeme Durumu Güncellendi', `Ödeme ID: ${id}, Yeni Durum: ${durum}`);
  }

  const handleCalisanSave = (calisan: Omit<Calisan, 'id'> | Calisan) => {
    const isNew = !('id' in calisan) || calisan.id === 0;
    createSaveHandler(setCalisanlar, 'Çalışan', item => `${item.isim} ${item.soyisim}`)(calisan);
    const finalCalisan = 'id' in calisan ? calisan : {...calisan, id: Math.max(0, ...calisanlar.map(c=>c.id)) + 1};

    if (isNew) {
        handleEtkinlikEkle(`Yeni çalışan işe başladı: ${calisan.isim} ${calisan.soyisim}`, calisan.iseGirisTarihi, 'manuel');
    }

    setEtkinlikler(produce(draft => {
        const eventId = `calisma-izni-${finalCalisan.id}`;
        const existingIndex = draft.findIndex(e => e.id === eventId);
        if (existingIndex !== -1) draft.splice(existingIndex, 1);
        
        if (finalCalisan.calismaIzniVarMi && finalCalisan.calismaIzniBitis) {
            draft.push({
                id: eventId,
                aciklama: `${finalCalisan.isim} ${finalCalisan.soyisim} çalışma izni bitiyor.`,
                tarih: finalCalisan.calismaIzniBitis,
                tip: 'calisma-izni',
                color: getDefaultColorForTip('calisma-izni')
            });
        }
    }));
  };

  const handleCalisanDelete = createDeleteHandler(setCalisanlar, 'Çalışan', item => `${item?.isim} ${item?.soyisim}`);
  
  const handleAvansSave = createSaveHandler(setAvanslar, 'Avans', item => `Çalışan ID: ${item.calisanId}, Tutar: ${item.tutar}`);

  const handleIzinSave = createSaveHandler(setIzinler, 'İzin', item => `Çalışan ID: ${item.calisanId}, Tip: ${item.tip}`);

  const handleCalisanDosyaSave = (calisanId: number, dosya: Omit<CalisanDosyasi, 'id'>) => {
    setCalisanlar(produce(draft => {
      const calisan = draft.find(c => c.id === calisanId);
      if (calisan) {
        if (!calisan.dosyalar) { calisan.dosyalar = []; }
        const newId = Math.max(0, ...calisan.dosyalar.map(d => d.id)) + 1;
        calisan.dosyalar.push({ ...dosya, id: newId });
        addAuditLog('Çalışan Dosyası Eklendi', `Çalışan: ${calisan.isim} ${calisan.soyisim}, Dosya: ${dosya.ad}`);
      }
    }));
  };

  const handleCalisanDosyaDelete = (calisanId: number, dosyaId: number) => {
    setCalisanlar(produce(draft => {
      const calisan = draft.find(c => c.id === calisanId);
      if (calisan && calisan.dosyalar) {
        const dosya = calisan.dosyalar.find(d => d.id === dosyaId);
        addAuditLog('Çalışan Dosyası Silindi', `Çalışan: ${calisan.isim} ${calisan.soyisim}, Dosya: ${dosya?.ad}`);
        calisan.dosyalar = calisan.dosyalar.filter(d => d.id !== dosyaId);
      }
    }));
  };

  const handleRestoreData = (backupData: any) => {
    try {
        const setters: { [key: string]: React.Dispatch<any> } = {
            faturalar: setFaturalar, varliklar: setVarliklar, projeler: setProjeler,
            cekler: setCekler, ayarlar: setAyarlar, etkinlikler: setEtkinlikler,
            profile: setProfile, taksitler: setTaksitler, kasaHesaplar: setKasaHesaplar,
            kasaIslemler: setKasaIslemler, irsaliyeler: setIrsaliyeler, teklifler: setTeklifler,
            sozlesmeler: setSozlesmeler, emlaklar: setEmlaklar, giderTurleri: setGiderTurleri,
            emlakOdemeler: setEmlakOdemeler, emlakDanismanlari: setEmlakDanismanlari, komisyonlar: setKomisyonlar,
            calisanlar: setCalisanlar, pozisyonlar: setPozisyonlar, avanslar: setAvanslar, maaslar: setMaaslar,
            sigortalar: setSigortalar, izinler: setIzinler, telegramAyarlari: setTelegramAyarlari,
            kullanicilar: setKullanicilar, roller: setRoller
        };

        for (const key in setters) {
            if (backupData.hasOwnProperty(key)) {
                setters[key](backupData[key]);
            }
        }
        alert("Veriler başarıyla geri yüklendi!");
        addAuditLog('Veri Geri Yüklendi', 'Sistem verileri yedekten geri yüklendi.');
    } catch (error) {
        console.error("Geri yükleme hatası:", error);
        alert("Veri geri yüklenirken bir hata oluştu. Lütfen dosya formatını kontrol edin.");
    }
  };


  // Telegram Cron Job Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!telegramAyarlari.active) return;
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const checkAndSend = ( enabled: boolean, times: string, reportFn: () => string ) => { if (enabled && times.split(',').map(t=>t.trim()).includes(currentTime)) { const message = reportFn(); sendMessage(telegramAyarlari.botToken, telegramAyarlari.chatId, message); } };
      checkAndSend( telegramAyarlari.today_enabled, telegramAyarlari.today_times, () => prepareTodayMessage(etkinlikler) );
      checkAndSend( telegramAyarlari.full_enabled, telegramAyarlari.full_times, () => prepareSummaryMessage(faturalar, teklifler) );
      checkAndSend( telegramAyarlari.eod_enabled, telegramAyarlari.eod_times, () => prepareEODMessage(etkinlikler) );
    }, 60000);
    return () => clearInterval(interval);
  }, [telegramAyarlari, etkinlikler, faturalar, teklifler]);

  const handleVarlikSec = (varlik: Varlik) => setSeciliVarlik(varlik);
  const handleProjeSec = (proje: Proje) => setSeciliProje(proje);
  const handleEmlakSec = (emlak: Emlak) => setSeciliEmlak(emlak);
  const handleDanismanSec = (danisman: EmlakDanismani) => setSeciliDanisman(danisman);
  const handleSozlesmeSec = (sozlesme: Sozlesme) => setSeciliSozlesme(sozlesme);
  const handleCalisanSec = (calisan: Calisan) => setSeciliCalisan(calisan);

  const resetSelection = () => {
    setSeciliVarlik(null);
    setSeciliProje(null);
    setSeciliEmlak(null);
    setSeciliDanisman(null);
    setSeciliSozlesme(null);
    setSeciliCalisan(null);
  };

  useEffect(() => {
    resetSelection();
  }, [currentPage]);
  
  // Sync selected employee state with the main list to reflect updates
  useEffect(() => {
    if (seciliCalisan) {
      const updatedCalisan = calisanlar.find(c => c.id === seciliCalisan.id);
      if (updatedCalisan) {
        setSeciliCalisan(updatedCalisan);
      } else {
        setSeciliCalisan(null); // The employee was deleted
      }
    }
  }, [calisanlar]);
  
  if (!aktifKullanici) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} kullanicilar={kullanicilar} />;
  }

  const userRole = roller.find(r => r.id === aktifKullanici.rolId);

  const renderPage = () => {
    const getPagePermissions = (page: Page) => (userRole?.izinler[page] || 'yok');

    if (seciliVarlik) {
      const permissions = getPagePermissions('musteri-firma');
      if (permissions === 'yok') return <h1>Erişim Yetkiniz Yok</h1>;
      return <VarlikDetayPage varlik={seciliVarlik} onBack={resetSelection} faturalar={faturalar} projeler={projeler} cekler={cekler} ayarlar={ayarlar} sozlesmeler={sozlesmeler} taksitler={taksitler} varliklar={varliklar} emlaklar={emlaklar} emlakOdemeler={emlakOdemeler} giderTurleri={giderTurleri} />;
    }
    if (seciliProje) {
      const permissions = getPagePermissions('projeler');
      if (permissions === 'yok') return <h1>Erişim Yetkiniz Yok</h1>;
      return <ProjeDetayPage proje={seciliProje} onBack={resetSelection} faturalar={faturalar} varliklar={varliklar} ayarlar={ayarlar} teklifler={teklifler} irsaliyeler={irsaliyeler} cekler={cekler} sozlesmeler={sozlesmeler} />;
    }
    if (seciliEmlak) {
       const permissions = getPagePermissions('emlak');
       if (permissions === 'yok') return <h1>Erişim Yetkiniz Yok</h1>;
      return <EmlakDetayPage emlak={seciliEmlak} onBack={resetSelection} sozlesmeler={sozlesmeler} varliklar={varliklar} emlakOdemeler={emlakOdemeler} giderTurleri={giderTurleri} ayarlar={ayarlar} komisyonlar={komisyonlar} emlakDanismanlari={emlakDanismanlari}
        onCokluDosyaEkle={(emlakId, dosyalar, dosyaTipi) => setEmlaklar(produce(draft => {
            const emlak = draft.find(e => e.id === emlakId);
            if (emlak) {
                const propName = dosyaTipi === 'resim' ? 'resimler' : 'videolar';
                if (!emlak[propName]) { (emlak as any)[propName] = []; }
                (emlak as any)[propName].push(...dosyalar);
            }
        }))}
        onDosyaSil={(emlakId, dosyaAdi, dosyaTipi) => setEmlaklar(produce(draft => { const emlak = draft.find(e => e.id === emlakId); if (emlak) { const propName = dosyaTipi === 'resim' ? 'resimler' : 'videolar'; (emlak as any)[propName] = (emlak as any)[propName].filter((d: any) => d.ad !== dosyaAdi); }}))}
        onDosyaVeriGuncelle={(emlakId, dosyaAdi, dosyaTipi, veri) => setEmlaklar(produce(draft => { const emlak = draft.find(e => e.id === emlakId); if(emlak) { const propName = dosyaTipi === 'resim' ? 'resimler' : 'videolar'; const dosya = (emlak as any)[propName].find((d: any) => d.ad === dosyaAdi); if (dosya) dosya.veri = veri; }}))}
      />;
    }
     if (seciliDanisman) {
       const permissions = getPagePermissions('emlak-danismanlari');
       if (permissions === 'yok') return <h1>Erişim Yetkiniz Yok</h1>;
      return <EmlakDanismaniDetayPage danisman={seciliDanisman} onBack={resetSelection} komisyonlar={komisyonlar} sozlesmeler={sozlesmeler} emlaklar={emlaklar} ayarlar={ayarlar} />
    }
     if (seciliSozlesme) {
       const permissions = getPagePermissions('sozlesmeler');
       if (permissions === 'yok') return <h1>Erişim Yetkiniz Yok</h1>;
      return <SozlesmeDetayPage 
        sozlesme={seciliSozlesme} onBack={resetSelection} varliklar={varliklar} projeler={projeler} emlaklar={emlaklar} komisyonlar={komisyonlar} emlakDanismanlari={emlakDanismanlari} sozlesmeler={sozlesmeler} ayarlar={ayarlar}
      />;
    }
    if (seciliCalisan) {
       const permissions = getPagePermissions('calisanlar');
       if (permissions === 'yok') return <h1>Erişim Yetkiniz Yok</h1>;
      return <CalisanDetayPage 
        calisan={seciliCalisan}
        onBack={resetSelection}
        pozisyonlar={pozisyonlar}
        maaslar={maaslar}
        avanslar={avanslar}
        sigortalar={sigortalar}
        izinler={izinler}
        onIzinSave={handleIzinSave}
        onIzinDelete={createDeleteHandler(setIzinler, 'İzin', item => `İzin ID: ${item?.id}`)}
        onDosyaSave={handleCalisanDosyaSave}
        onDosyaDelete={handleCalisanDosyaDelete}
      />;
    }

    const pagePermissions = getPagePermissions(currentPage);
    if (pagePermissions === 'yok') {
        return <div className="p-8 text-center"><h1 className="text-2xl font-bold">Erişim Yetkiniz Yok</h1><p>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p></div>;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage faturalar={faturalar} varliklar={varliklar} projeler={projeler} cekler={cekler} ayarlar={ayarlar} etkinlikler={etkinlikler} taksitler={taksitler} emlaklar={emlaklar} calisanlar={calisanlar}
// FIX: Changed the lambda passed to etkinlikEkle to match the expected prop type. The 'color' parameter was removed as it's not provided by the child component.
          etkinlikEkle={(aciklama, tarih) => handleEtkinlikEkle(aciklama, tarih, 'manuel')}
          etkinlikSil={(id) => setEtkinlikler(prev => prev.filter(e => e.id !== id))}
          />;
      case 'musteri-firma':
        return <MusteriFirmaPage varliklar={varliklar} onSave={handleVarlikSave} onDelete={createDeleteHandler(setVarliklar, 'Varlık', item => item?.type === 'musteri' ? `${item.isim} ${item.soyisim}` : item?.sirketAdi || '')} onVarlikSec={handleVarlikSec} />;
      case 'faturalar':
        return <FaturaPage faturalar={faturalar} varliklar={varliklar} projeler={projeler} cekler={cekler} ayarlar={ayarlar} onSave={handleFaturaSave} onSil={createDeleteHandler(setFaturalar, 'Fatura', item => item?.faturaNo || '')} onDurumGuncelle={handleFaturaDurumGuncelle} partialPaymentModal={partialPaymentModal} setPartialPaymentModal={setPartialPaymentModal} onPartialPaymentSave={handlePartialPaymentSave} />;
      case 'projeler':
        return <ProjePage projeler={projeler} onSave={createSaveHandler(setProjeler, 'Proje', item => item.ad)} onDelete={createDeleteHandler(setProjeler, 'Proje', item => item?.ad || '')} onProjeSec={handleProjeSec} />;
      case 'cekler':
        return <CekPage cekler={cekler} varliklar={varliklar} faturalar={faturalar} projeler={projeler} ayarlar={ayarlar} onSave={handleCekSave} onSil={handleCekDelete} onDurumGuncelle={handleCekDurumGuncelle} />;
       case 'kasa':
        return <KasaPage hesaplar={kasaHesaplar} islemler={kasaIslemler} ayarlar={ayarlar} onHesapSave={handleKasaHesapSave} onIslemSave={handleKasaIslemSave} onHesapDelete={handleKasaHesapDelete} onIslemDelete={handleKasaIslemDelete} />;
      case 'irsaliyeler':
        return <IrsaliyePage irsaliyeler={irsaliyeler} varliklar={varliklar} projeler={projeler} ayarlar={ayarlar} onSave={handleIrsaliyeSave} onDelete={createDeleteHandler(setIrsaliyeler, 'İrsaliye', item => `İrsaliye ID: ${item?.id}`)} onFaturaSave={handleFaturaSave} onDurumGuncelle={handleIrsaliyeDurumGuncelle} />;
      case 'teklifler':
        return <TeklifPage teklifler={teklifler} varliklar={varliklar} projeler={projeler} ayarlar={ayarlar} onSave={handleTeklifSave} onDelete={createDeleteHandler(setTeklifler, 'Teklif', item => item?.konu || '')} />;
      case 'sozlesmeler':
        return <SozlesmePage sozlesmeler={sozlesmeler} varliklar={varliklar} projeler={projeler} emlaklar={emlaklar} ayarlar={ayarlar} onSave={handleSozlesmeSave} onDelete={createDeleteHandler(setSozlesmeler, 'Sözleşme', item => item?.baslik || '')} onSozlesmeSec={handleSozlesmeSec} />;
      case 'taksitler':
        return <TaksitPage taksitler={taksitler} faturalar={faturalar} varliklar={varliklar} ayarlar={ayarlar} onTaksitPlanKaydet={handleTaksitPlanKaydet} onTaksitGuncelle={handleTaksitGuncelle} onTaksitDurumGuncelle={handleTaksitDurumGuncelle} onTaksitSil={handleTaksitDelete} />;
      case 'emlak':
        return <EmlakPage emlaklar={emlaklar} projeler={projeler} onSave={handleEmlakSave} onDelete={createDeleteHandler(setEmlaklar, 'Emlak', item => `Emlak ID: ${item?.id}`)} onEmlakSec={handleEmlakSec} />;
       case 'emlak-odemeler':
        return <EmlakOdemelerPage emlakOdemeler={emlakOdemeler} emlaklar={emlaklar} sozlesmeler={sozlesmeler} giderTurleri={giderTurleri} ayarlar={ayarlar} onSave={handleEmlakOdemeSave} onDelete={createDeleteHandler(setEmlakOdemeler, 'Emlak Ödemesi', item => `Ödeme ID: ${item?.id}`)} onDurumGuncelle={handleEmlakOdemeDurumGuncelle} varliklar={varliklar}/>;
       case 'gider-turleri':
        return <GiderTurleriPage giderTurleri={giderTurleri} onSave={createSaveHandler(setGiderTurleri, 'Gider Türü', item => item.ad)} onDelete={createDeleteHandler(setGiderTurleri, 'Gider Türü', item => item?.ad || '')} />;
      case 'emlak-danismanlari':
        return <EmlakDanismaniPage danismanlar={emlakDanismanlari} onSave={createSaveHandler(setEmlakDanismanlari, 'Danışman', item => item.type === 'kisi' ? `${item.isim} ${item.soyisim}`: item.sirketAdi)} onDelete={createDeleteHandler(setEmlakDanismanlari, 'Danışman', item => item?.type === 'kisi' ? `${item.isim} ${item.soyisim}` : item?.sirketAdi || '')} onDanismanSec={handleDanismanSec} />;
      case 'komisyonlar':
        return <KomisyonPage komisyonlar={komisyonlar} danismanlar={emlakDanismanlari} sozlesmeler={sozlesmeler} emlaklar={emlaklar} ayarlar={ayarlar} onSave={createSaveHandler(setKomisyonlar, 'Komisyon', item => `Komisyon ID: ${item.id}`)} onDelete={createDeleteHandler(setKomisyonlar, 'Komisyon', item => `Komisyon ID: ${item?.id}`)}/>;
      case 'album':
        return <AlbumPage emlaklar={emlaklar} projeler={projeler} />;
      case 'hrm-dashboard':
        return <HrmDashboardPage calisanlar={calisanlar} avanslar={avanslar} maaslar={maaslar} />;
      case 'calisanlar':
        return <CalisanlarPage calisanlar={calisanlar} pozisyonlar={pozisyonlar} ayarlar={ayarlar} onSave={handleCalisanSave} onDelete={handleCalisanDelete} onCalisanSec={handleCalisanSec}/>
      case 'pozisyonlar':
        return <PozisyonlarPage pozisyonlar={pozisyonlar} onSave={createSaveHandler(setPozisyonlar, 'Pozisyon', item => item.ad)} onDelete={createDeleteHandler(setPozisyonlar, 'Pozisyon', item => item?.ad || '')}/>
      case 'avanslar':
        return <AvanslarPage avanslar={avanslar} calisanlar={calisanlar} ayarlar={ayarlar} onSave={handleAvansSave} onDelete={createDeleteHandler(setAvanslar, 'Avans', item => `Avans ID: ${item?.id}`)} maaslar={maaslar}/>
      case 'sigorta':
        return <SigortaPage sigortalar={sigortalar} calisanlar={calisanlar} onUpdate={setSigortalar} onEtkinlikEkle={(aciklama, tarih) => handleEtkinlikEkle(aciklama, tarih, 'manuel')}/>
      case 'maas':
        return <MaasPage maaslar={maaslar} calisanlar={calisanlar} avanslar={avanslar} ayarlar={ayarlar} onUpdate={setMaaslar} onEtkinlikEkle={(aciklama, tarih) => handleEtkinlikEkle(aciklama, tarih, 'manuel')}/>
      case 'hrm-raporlar':
        return <HrmRaporlarPage maaslar={maaslar} sigortalar={sigortalar} calisanlar={calisanlar} />
      case 'raporlar':
        return <RaporlarPage appData={mockData} />;
      case 'telegram':
        return <TelegramPage ayarlar={telegramAyarlari} onSave={setTelegramAyarlari} appData={mockData} />;
      case 'gpa-calculator':
        return <GpaCalculatorPage />;
      case 'audit-log':
          return <AuditLogPage logs={auditLogs} kullanicilar={kullanicilar} />;
      case 'profile':
        return <ProfilePage profile={profile} onUpdateProfile={(data) => setProfile(p => ({...p, ...data}))} />;
      case 'settings':
        return <SettingsPage 
                    ayarlar={ayarlar} 
                    onSave={setAyarlar}
                    kullanicilar={kullanicilar}
                    roller={roller}
                    onKullaniciSave={createSaveHandler(setKullanicilar, 'Kullanıcı', item => item.kullaniciAdi)}
                    onKullaniciDelete={createDeleteHandler(setKullanicilar, 'Kullanıcı', item => item?.kullaniciAdi || '')}
                    onRolSave={createSaveHandler(setRoller, 'Rol', item => item.ad)}
                    onRolDelete={createDeleteHandler(setRoller, 'Rol', item => item?.ad || '')}
                    appDataForBackup={{...mockData, ayarlar, profile, telegramAyarlari, kasaHesaplar, kasaIslemler, irsaliyeler, teklifler, sozlesmeler, emlaklar, giderTurleri, emlakOdemeler, emlakDanismanlari, komisyonlar, calisanlar, pozisyonlar, avanslar, maaslar, sigortalar, izinler, varliklar, projeler, cekler, etkinlikler, taksitler, faturalar, kullanicilar, roller, auditLogs }}
                    onRestore={handleRestoreData}
                />;
      default:
        return <h1>Sayfa Bulunamadı</h1>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onLogout={handleLogoutRequest}
        profile={profile}
        ayarlar={ayarlar}
        aktifKullanici={aktifKullanici}
        roller={roller}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
            <div className="page-container w-full">
            {renderPage()}
            </div>
        </main>
      </div>
      {logoutConfirmOpen && (
        <ConfirmationModal
          title="Çıkış Yap"
          message="Sistemden çıkış yapmak istediğinizden emin misiniz?"
          onClose={() => setLogoutConfirmOpen(false)}
          onConfirm={handleLogoutConfirm}
          confirmText="Çıkış Yap"
          confirmButtonClass="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        />
      )}
    </div>
  );
};

export default App;