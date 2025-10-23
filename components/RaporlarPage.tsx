import React, { useState, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useMockData } from '../data';
import ReportPeriodSelector from './ReportPeriodSelector';
import GenelBakisRaporu from './reports/GenelBakisRaporu';
import FinansalRaporu from './reports/FinansalRaporu';
import ProjeRaporu from './reports/ProjeRaporu';
import EmlakRaporu from './reports/EmlakRaporu';
import PersonelRaporu from './reports/PersonelRaporu';

interface RaporlarPageProps {
    appData: ReturnType<typeof useMockData>;
}

type ReportTab = 'genel' | 'finansal' | 'proje' | 'emlak' | 'personel';

const RaporlarPage: React.FC<RaporlarPageProps> = ({ appData }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('genel');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        return { start, end };
    });
    const reportContentRef = useRef<HTMLDivElement>(null);
    
    const dateFilteredData = useMemo(() => filterDataByDateRange(appData, dateRange), [appData, dateRange]);

    const handleExportPDF = () => {
        const input = reportContentRef.current;
        if (input) {
            html2canvas(input, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'pt', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                let imgWidth = pdfWidth - 40;
                let imgHeight = imgWidth / ratio;
                if(imgHeight > pdfHeight - 40){
                    imgHeight = pdfHeight - 40;
                    imgWidth = imgHeight * ratio;
                }
                const x = (pdfWidth - imgWidth) / 2;
                pdf.addImage(imgData, 'PNG', x, 20, imgWidth, imgHeight);
                pdf.save(`rapor-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
            });
        }
    };
    
    const renderActiveTab = () => {
        const reportProps = {
            data: dateFilteredData,
            selectedCurrency,
            ayarlar: appData.ayarlar,
            dateRange
        };
        
        switch (activeTab) {
            case 'genel':
                return <GenelBakisRaporu {...reportProps} />;
            case 'finansal':
                return <FinansalRaporu {...reportProps} />;
            case 'proje':
                // Proje raporu para biriminden etkilenmiyor
                return <ProjeRaporu data={dateFilteredData} />;
            case 'emlak':
                return <EmlakRaporu {...reportProps} />;
            case 'personel':
                return <PersonelRaporu {...reportProps} />;
            default:
                return null;
        }
    }

    return (
        <div className="w-full">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Raporlar</h1>
                <p className="text-slate-500 mt-2 text-lg">İşletmenizin detaylı analizleri ve performansı.</p>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <ReportPeriodSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
                        <select
                            value={selectedCurrency}
                            onChange={e => setSelectedCurrency(e.target.value)}
                            className="p-2 border border-slate-300 rounded-lg bg-white"
                        >
                            <option value="all">Tüm Para Birimleri</option>
                            {appData.ayarlar.paraBirimleri.map(p => <option key={p.kod} value={p.kod}>{p.kod}</option>)}
                        </select>
                    </div>
                    <button onClick={handleExportPDF} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        PDF Olarak Dışa Aktar
                    </button>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                        {renderTab('genel', 'Genel Bakış')}
                        {renderTab('finansal', 'Finansal Rapor')}
                        {renderTab('proje', 'Proje Raporu')}
                        {renderTab('emlak', 'Emlak Raporu')}
                        {renderTab('personel', 'Personel Raporu')}
                    </nav>
                </div>
                
                <div ref={reportContentRef} className="mt-6">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
    
    function renderTab(tabName: ReportTab, title: string) {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                {title}
            </button>
        );
    }
};

// Helper function to filter all relevant data by the selected date range
const filterDataByDateRange = (data: ReturnType<typeof useMockData>, range: { start: Date, end: Date }) => {
    const { start, end } = range;
    end.setHours(23, 59, 59, 999); // Include the whole end day

    const isWithinRange = (dateStr: string) => {
        const date = new Date(dateStr);
        return date >= start && date <= end;
    };
    
     const isWithinPeriod = (periodStr: string) => {
        const [year, month] = periodStr.split('-').map(Number);
        const periodStart = new Date(year, month - 1, 1);
        const periodEnd = new Date(year, month, 0);
        return periodStart <= end && periodEnd >= start;
    };

    return {
        faturalar: data.faturalar.filter(f => isWithinRange(f.faturaTarihi)),
        projeler: data.projeler.filter(p => new Date(p.baslangicTarihi) <= end && new Date(p.bitisTarihi) >= start),
        cekler: data.cekler.filter(c => isWithinRange(c.tanzimTarihi)),
        kasaIslemler: data.kasaIslemler.filter(i => isWithinRange(i.tarih)),
        sozlesmeler: data.sozlesmeler.filter(s => isWithinRange(s.sozlesmeTarihi)),
        emlakOdemeler: data.emlakOdemeler.filter(o => isWithinRange(o.tarih)),
        komisyonlar: data.komisyonlar.filter(k => isWithinRange(k.tarih)),
        maaslar: data.maaslar.filter(m => isWithinPeriod(m.donem)),
        // Non-date specific data that might be needed for joins
        kasaHesaplar: data.kasaHesaplar,
        calisanlar: data.calisanlar,
        emlaklar: data.emlaklar,
    };
}


export default RaporlarPage;