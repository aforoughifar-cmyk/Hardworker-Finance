import React, { useState } from 'react';
import { TelegramAyarlari } from '../types';
import { sendMessage } from '../utils/telegramApi';
import { prepareTodayMessage, prepareSummaryMessage, prepareEODMessage, prepareMonthMessage } from '../utils/telegramReports';
import PageOverlay from './PageOverlay';

interface TelegramPageProps {
  ayarlar: TelegramAyarlari;
  onSave: (yeniAyarlar: TelegramAyarlari) => void;
  appData: any; // Pass all app data for report generation
}

const TelegramPage: React.FC<TelegramPageProps> = ({ ayarlar, onSave, appData }) => {
  const [localAyarlar, setLocalAyarlar] = useState(ayarlar);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalAyarlar(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    onSave(localAyarlar);
    alert('Telegram ayarları kaydedildi!');
  };

  const getReportContent = (type: 'today' | 'summary' | 'eod' | 'month'): string => {
    switch (type) {
      case 'today':
        return prepareTodayMessage(appData.etkinlikler);
      case 'summary':
        return prepareSummaryMessage(appData.faturalar, appData.teklifler);
      case 'eod':
        return prepareEODMessage(appData.etkinlikler);
      case 'month':
        return prepareMonthMessage(appData); // Pass all data
      default:
        return '<b>Hata:</b> Rapor tipi bulunamadı.';
    }
  };

  const handleSendNow = (type: 'today' | 'summary' | 'eod' | 'month') => {
    if (!localAyarlar.botToken || !localAyarlar.chatId) {
      alert('Lütfen önce Bot Token ve Chat ID girin.');
      return;
    }
    const message = getReportContent(type);
    sendMessage(localAyarlar.botToken, localAyarlar.chatId, message)
      .then(() => alert(`${type} raporu başarıyla gönderildi!`))
      .catch(err => alert(`Rapor gönderilirken hata oluştu: ${err.message}`));
  };

  const handlePreview = (type: 'today' | 'summary' | 'eod' | 'month') => {
    const message = getReportContent(type);
    setPreviewContent(message);
  };
  
  const ReportCard: React.FC<{
    title: string;
    description: string;
    type: 'today' | 'summary' | 'eod' | 'month';
    enabled: boolean;
    times: string;
  }> = ({ title, description, type, enabled, times }) => (
    <div className="bg-slate-50 p-4 rounded-lg border">
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-slate-800">
            <input type="checkbox" name={`${type}_enabled`} checked={enabled} onChange={handleInputChange} />
            Aktif
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-800">Zamanlar:</label>
          <input 
            type="text" 
            name={`${type}_times`} 
            value={times} 
            onChange={handleInputChange}
            placeholder="09:00,18:00"
            className="w-32 p-1 border rounded text-sm"
          />
        </div>
      </div>
       <div className="flex items-center gap-2 mt-4">
          <button onClick={() => handleSendNow(type)} className="text-sm bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">Şimdi Gönder</button>
          <button onClick={() => handlePreview(type)} className="text-sm bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600">Önizleme</button>
      </div>
    </div>
  );


  return (
    <div className="w-full page-container">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Telegram Entegrasyonu</h1>
        <p className="text-slate-500 mt-2 text-lg">Otomatik raporlama için Telegram botunuzu yapılandırın.</p>
      </header>
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Temel Ayarlar</h2>
            <div className="space-y-4">
                <label className="flex items-center gap-2 font-semibold text-slate-800">
                    <input type="checkbox" name="active" checked={localAyarlar.active} onChange={handleInputChange} className="h-5 w-5"/>
                    Telegram Raporlamayı Aktifleştir
                </label>
                <div>
                    <label className="block text-sm font-medium text-slate-600">Bot Token</label>
                    <input type="text" name="botToken" value={localAyarlar.botToken} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" placeholder="BotFather'dan alınan token"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600">Chat ID</label>
                    <input type="text" name="chatId" value={localAyarlar.chatId} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" placeholder="Kanal, grup veya kullanıcı ID'si"/>
                </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Zamanlanmış Raporlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReportCard 
                    title="Bugünün Etkinlikleri"
                    description="Takvimdeki bugüne ait etkinlikleri listeler."
                    type="today"
                    enabled={localAyarlar.today_enabled}
                    times={localAyarlar.today_times}
                />
                 <ReportCard 
                    title="Genel Günlük Özet"
                    description="Yeni faturalar, teklifler gibi genel istatistikleri sunar."
                    type="summary"
                    enabled={localAyarlar.full_enabled}
                    times={localAyarlar.full_times}
                />
                 <ReportCard 
                    title="Gün Sonu Raporu"
                    description="Yapılmayan işleri ve yarının planını özetler."
                    type="eod"
                    enabled={localAyarlar.eod_enabled}
                    times={localAyarlar.eod_times}
                />
            </div>
        </div>

        <div className="text-center">
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md">
                Ayarları Kaydet
            </button>
        </div>
      </main>

      {previewContent && (
          <PageOverlay title="Rapor Önizlemesi" onClose={() => setPreviewContent(null)}>
              <div className="bg-white p-4 rounded" dangerouslySetInnerHTML={{ __html: previewContent.replace(/\n/g, '<br/>') }} />
          </PageOverlay>
      )}
    </div>
  );
};

export default TelegramPage;