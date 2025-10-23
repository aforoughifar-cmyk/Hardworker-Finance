import { TakvimEtkinligi, Fatura, Teklif, KasaIslem, HrmMaas, Komisyon, EmlakOdeme } from '../types';

const formatDate = (date: Date) => date.toLocaleDateString('tr-TR');
const todayStr = () => new Date().toISOString().split('T')[0];

export const prepareTodayMessage = (etkinlikler: TakvimEtkinligi[]): string => {
    const bugununEtkinlikleri = etkinlikler.filter(e => e.tarih === todayStr());
    
    let message = "<b>🗓️ Bugünün Etkinlikleri</b>\n\n";
    
    if (bugununEtkinlikleri.length === 0) {
        message += "<i>Bugün için planlanmış bir etkinlik yok.</i>";
    } else {
        bugununEtkinlikleri.forEach(e => {
            message += `▪️ ${e.aciklama}\n`;
        });
    }
    return message;
};

export const prepareSummaryMessage = (faturalar: Fatura[], teklifler: Teklif[]): string => {
    const bugunEklenenFaturalar = faturalar.filter(f => f.faturaTarihi === todayStr()).length;
    const bugunKabulEdilenTeklifler = teklifler.filter(t => t.durum === 'Kabul Edildi').length; // Assuming status change date is not tracked, check current status

    let message = "<b>📊 Genel Günlük Özet</b>\n\n";
    message += `▪️ <b>Yeni Fatura:</b> ${bugunEklenenFaturalar} adet\n`;
    message += `▪️ <b>Kabul Edilen Teklif:</b> ${bugunKabulEdilenTeklifler} adet\n`;
    
    return message;
};

export const prepareEODMessage = (etkinlikler: TakvimEtkinligi[]): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const yarininEtkinlikleri = etkinlikler.filter(e => e.tarih === tomorrowStr);
    
    let message = "<b>🌙 Gün Sonu Raporu</b>\n\n";
    message += "<b>Bugün:</b>\n<i>(Yapılmayan işler listesi özelliği eklenecek)</i>\n\n";
    message += "<b>Yarının Planı:</b>\n";
    
    if (yarininEtkinlikleri.length === 0) {
        message += "<i>Yarın için planlanmış bir etkinlik yok.</i>";
    } else {
        yarininEtkinlikleri.forEach(e => {
            message += `▪️ ${e.aciklama}\n`;
        });
    }
    return message;
};

export const prepareMonthMessage = (appData: {
    faturalar: Fatura[],
    kasaIslemler: KasaIslem[],
    maaslar: HrmMaas[],
    komisyonlar: Komisyon[],
    emlakOdemeler: EmlakOdeme[],
}): string => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    const gelirler = appData.faturalar.filter(f => f.tip === 'gelir' && f.faturaTarihi.startsWith(thisMonth) && f.odemeDurumu === 'Ödendi').reduce((sum, f) => sum + f.toplamTutar, 0)
                   + appData.kasaIslemler.filter(i => i.tip === 'gelir' && i.tarih.startsWith(thisMonth)).reduce((sum, i) => sum + i.tutar, 0);

    const giderler = appData.faturalar.filter(f => f.tip === 'gider' && f.faturaTarihi.startsWith(thisMonth) && f.odemeDurumu === 'Ödendi').reduce((sum, f) => sum + f.toplamTutar, 0)
                   + appData.kasaIslemler.filter(i => i.tip === 'gider' && i.tarih.startsWith(thisMonth)).reduce((sum, i) => sum + i.tutar, 0)
                   + appData.maaslar.filter(m => m.donem === thisMonth && m.odendi).reduce((sum, m) => sum + m.netMaas, 0)
                   + appData.komisyonlar.filter(k => k.tarih.startsWith(thisMonth)).reduce((sum, k) => sum + k.netKomisyonTutari, 0)
                   + appData.emlakOdemeler.filter(o => o.tarih.startsWith(thisMonth) && o.durum === 'Ödendi').reduce((sum, o) => sum + o.tutar, 0);

    let message = `<b>💰 Aylık Özet (${thisMonth})</b>\n\n`;
    message += `🟢 <b>Toplam Gelir:</b> ${gelirler.toFixed(2)}\n`;
    message += `🔴 <b>Toplam Gider:</b> ${giderler.toFixed(2)}\n`;
    message += `🔵 <b>Net Durum:</b> ${(gelirler - giderler).toFixed(2)}\n`;

    return message;
};
