import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { HrmMaas, Calisan, Avans, Ayarlar, TakvimEtkinligi } from '../types';
import PeriodSelector from './PeriodSelector';
import BankaExportSablonu from './BankaExportSablonu';

interface MaasPageProps {
  maaslar: HrmMaas[];
  calisanlar: Calisan[];
  avanslar: Avans[];
  ayarlar: Ayarlar;
  onUpdate: (yeniMaaslar: HrmMaas[]) => void;
  onEtkinlikEkle: (aciklama: string, tarih: string, tip: TakvimEtkinligi['tip']) => void;
}

const MaasPage: React.FC<MaasPageProps> = ({ maaslar, calisanlar, avanslar, ayarlar, onUpdate, onEtkinlikEkle }) => {
  const [period, setPeriod] = useState<{ year: number, month: number }>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });
  const [exportType, setExportType] = useState<'net' | 'brut'>('net');

  const donemStr = useMemo(() => `${period.year}-${String(period.month).padStart(2, '0')}`, [period]);

  useEffect(() => {
    const aktifCalisanlar = calisanlar.filter(c => c.aktif);
    const mevcutKayitlarMap = new Map<number, HrmMaas>(
        maaslar.filter(m => m.donem === donemStr).map(m => [m.calisanId, m])
    );
    
    const guncellenecekKayitlar: HrmMaas[] = [];
    let maxId = Math.max(0, ...maaslar.map(m => m.id));

    aktifCalisanlar.forEach(calisan => {
        const toplamVerilenAvans = avanslar
            .filter(a => a.calisanId === calisan.id)
            .reduce((sum, a) => sum + a.tutar, 0);

        const oncekiDonemKesintileri = maaslar
            .filter(m => m.calisanId === calisan.id && m.donem < donemStr)
            .reduce((sum, m) => sum + m.kesilenAvans, 0);

        const buAykiBakiye = toplamVerilenAvans - oncekiDonemKesintileri;

        const mevcutKayit = mevcutKayitlarMap.get(calisan.id);

        if (!mevcutKayit) {
            if (buAykiBakiye > 0 || calisan.tabanMaas > 0) {
                 const kesilecekTutar = buAykiBakiye;
                guncellenecekKayitlar.push({
                    id: ++maxId,
                    calisanId: calisan.id,
                    donem: donemStr,
                    brutMaas: calisan.tabanMaas,
                    avanslar: buAykiBakiye,
                    kesilenAvans: kesilecekTutar,
                    kesintiTipi: 'tam',
                    netMaas: calisan.tabanMaas - kesilecekTutar,
                    odendi: false,
                    odemeTarihi: null,
                    aktif: true,
                });
            }
        } else {
            if (mevcutKayit.avanslar !== buAykiBakiye && !mevcutKayit.odendi) {
                 const guncelKayit = produce(mevcutKayit, draft => {
                    draft.avanslar = buAykiBakiye;
                    if (draft.kesintiTipi === 'tam') {
                        draft.kesilenAvans = buAykiBakiye;
                    } else if (draft.kesintiTipi === 'yok') {
                        draft.kesilenAvans = 0;
                    } else {
                        draft.kesilenAvans = Math.min(draft.kesilenAvans, buAykiBakiye);
                    }
                    draft.netMaas = draft.brutMaas - draft.kesilenAvans;
                });
                guncellenecekKayitlar.push(guncelKayit);
            }
        }
    });

    if (guncellenecekKayitlar.length > 0) {
      onUpdate(produce(maaslar, draft => {
        guncellenecekKayitlar.forEach(guncelKayit => {
            const index = draft.findIndex(m => m.id === guncelKayit.id);
            if (index !== -1) {
                draft[index] = guncelKayit;
            } else {
                draft.push(guncelKayit);
            }
        });
      }));
    }
  }, [donemStr, calisanlar, avanslar, maaslar, onUpdate]);

  const handleMaasChange = (maasId: number, field: keyof HrmMaas | 'kesintiTipi', value: any) => {
    onUpdate(produce(maaslar, draft => {
        const maas = draft.find(m => m.id === maasId);
        if (!maas) return;

        if (field === 'kesintiTipi') {
            maas.kesintiTipi = value;
            if (value === 'tam') maas.kesilenAvans = maas.avanslar;
            else if (value === 'yok') maas.kesilenAvans = 0;
        } else if (field === 'kesilenAvans') {
            maas.kesilenAvans = Math.max(0, Math.min(maas.avanslar, Number(value)));
        } else if (field === 'brutMaas') {
            maas.brutMaas = Number(value);
        } else if (field === 'aktif') {
            maas.aktif = value;
        }

        maas.netMaas = maas.brutMaas - maas.kesilenAvans;
    }));
  };

  const handleToggleOdendi = (maasId: number) => {
    onUpdate(produce(maaslar, draft => {
        const maas = draft.find(m => m.id === maasId);
        if (maas) {
            const wasPaid = maas.odendi;
            maas.odendi = !maas.odendi;
            maas.odemeTarihi = maas.odendi ? new Date().toISOString().split('T')[0] : null;

            if (!wasPaid && maas.odendi) { // Eğer yeni ödendi olarak işaretlendiyse
                const calisan = calisanlar.find(c => c.id === maas.calisanId);
                if (calisan && maas.odemeTarihi) {
                    const aciklama = `${calisan.isim} ${calisan.soyisim} - ${maas.donem} maaşı ödendi.`;
                    onEtkinlikEkle(aciklama, maas.odemeTarihi, 'manuel');
                }
            }
        }
    }));
  };

  const donemMaaslari = useMemo(() => {
    const calisanMap = new Map(calisanlar.map(c => [c.id, c]));
    return maaslar
      .filter(m => m.donem === donemStr)
      .map(m => ({ ...m, calisan: calisanMap.get(m.calisanId) }))
      .filter(m => m.calisan && m.calisan.aktif);
  }, [donemStr, maaslar, calisanlar]);

  const handleMarkAllPaid = () => {
    const guncelTarih = new Date().toISOString().split('T')[0];
    onUpdate(produce(maaslar, draft => {
        donemMaaslari.forEach(donemKaydi => {
            const maas = draft.find(m => m.id === donemKaydi.id);
            if(maas && !maas.odendi && maas.aktif) {
                maas.odendi = true;
                maas.odemeTarihi = guncelTarih;
                
                const calisan = calisanlar.find(c => c.id === maas.calisanId);
                if (calisan) {
                    const aciklama = `${calisan.isim} ${calisan.soyisim} - ${maas.donem} maaşı ödendi.`;
                    onEtkinlikEkle(aciklama, guncelTarih, 'manuel');
                }
            }
        });
    }));
  };

  const handlePdfExport = () => {
    const exportElement = document.getElementById('banka-export-sablonu');
    if (exportElement) {
        html2canvas(exportElement, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let imgWidth = pdfWidth - 40;
            let imgHeight = imgWidth / ratio;
            if(imgHeight > pdfHeight - 40){ imgHeight = pdfHeight - 40; imgWidth = imgHeight * ratio; }
            const x = (pdfWidth - imgWidth) / 2;
            pdf.addImage(imgData, 'PNG', x, 20, imgWidth, imgHeight);
            pdf.save(`banka-odeme-listesi-${donemStr}.pdf`);
        });
    }
  };

  return (
    <div className="w-full page-container">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Banka / Maaş Ödemeleri</h1>
        <p className="text-slate-500 mt-2 text-lg">Seçilen dönem için maaşları hesaplayın, ödeyin ve banka listesi oluşturun.</p>
      </header>
      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <PeriodSelector period={period} onPeriodChange={setPeriod} />
            <div className="flex items-center gap-2">
                <button onClick={handleMarkAllPaid} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Aktif Olanları Ödendi İşaretle</button>
                <button onClick={handlePdfExport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Banka Listesi (PDF)</button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Çalışan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Brüt Maaş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Avanslar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Net Maaş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Aktif</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {donemMaaslari.map(m => (
                    <tr key={m.id} className={`transition-colors hover:bg-slate-50 ${!m.aktif ? 'opacity-50 bg-slate-100' : ''} ${m.odendi ? 'bg-green-50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-slate-900">{m.calisan ? `${m.calisan.isim} ${m.calisan.soyisim}` : 'Bilinmiyor'}</td>
                        <td className="px-6 py-4 text-slate-600">
                            <input type="number" value={m.brutMaas} onChange={e => handleMaasChange(m.id, 'brutMaas', e.target.value)} className="w-28 p-1 border rounded disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={m.odendi} /> {m.calisan?.paraBirimi}
                        </td>
                        <td className="px-6 py-4 text-red-600">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs">Bakiye: {m.avanslar.toFixed(2)}</span>
                                <select value={m.kesintiTipi} onChange={e => handleMaasChange(m.id, 'kesintiTipi', e.target.value)} className="p-1 border rounded text-xs disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={m.odendi}>
                                    <option value="tam">Tamamını Kes</option>
                                    <option value="kismi">Kısmi Kesinti</option>
                                    <option value="yok">Bu Ay Kesme (Devret)</option>
                                </select>
                                {m.kesintiTipi === 'kismi' && (
                                    <input type="number" value={m.kesilenAvans} onChange={e => handleMaasChange(m.id, 'kesilenAvans', e.target.value)} className="w-28 p-1 border rounded text-xs disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={m.odendi} />
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">{m.netMaas.toFixed(2)} {m.calisan?.paraBirimi}</td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={m.odendi} onChange={() => handleToggleOdendi(m.id)} className="sr-only peer"/>
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                                <div>
                                    <span className={`text-sm font-medium ${m.odendi ? 'text-green-700' : 'text-yellow-700'}`}>
                                        {m.odendi ? 'Ödendi' : 'Ödenmedi'}
                                    </span>
                                    {m.odendi && m.odemeTarihi && (
                                        <p className="text-xs text-slate-500">{new Date(m.odemeTarihi).toLocaleDateString('tr-TR')}</p>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <label className={`relative inline-flex items-center ${m.odendi ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input type="checkbox" checked={m.aktif} onChange={e => handleMaasChange(m.id, 'aktif', e.target.checked)} className="sr-only peer" disabled={m.odendi}/>
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-disabled:cursor-not-allowed peer-disabled:bg-gray-100 peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </td>
                    </tr>
                ))}
            </tbody>
           </table>
           {donemMaaslari.length === 0 && <p className="text-center py-12 text-slate-500">Bu dönem için maaş kaydı bulunamadı.</p>}
        </div>
      </main>
      
      {/* Hidden element for PDF export */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div id="banka-export-sablonu">
          <BankaExportSablonu 
            maaslar={donemMaaslari.filter(m => m.aktif)} 
            sirketBilgileri={ayarlar.sirketBilgileri} 
            donem={donemStr}
            exportTipi={exportType}
          />
        </div>
      </div>
    </div>
  );
};

export default MaasPage;