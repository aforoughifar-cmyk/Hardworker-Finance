import React, { useState, useMemo } from 'react';
import { Sozlesme, Varlik, Proje, Emlak, Ayarlar } from '../types';
import SozlesmeListesi from './SozlesmeListesi';
import SozlesmeEkleModal from './SozlesmeEkleModal';
import FileViewerModal from './FileViewerModal';
import { PlusIcon, SearchIcon } from './icons/AppIcons';
import ReportHeader from './ReportHeader';
import CurrencySummaryWidget from './CurrencySummaryWidget';
import DatePickerInput from './DatePickerInput';
import ConfirmationModal from './ConfirmationModal';

interface SozlesmePageProps {
  sozlesmeler: Sozlesme[];
  varliklar: Varlik[];
  projeler: Proje[];
  emlaklar: Emlak[];
  ayarlar: Ayarlar;
  onSave: (sozlesme: Omit<Sozlesme, 'id'> | Sozlesme) => void;
  onDelete: (id: number) => void;
  onSozlesmeSec: (sozlesme: Sozlesme) => void;
}

const SozlesmePage: React.FC<SozlesmePageProps> = ({ sozlesmeler, varliklar, projeler, emlaklar, ayarlar, onSave, onDelete, onSozlesmeSec }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenSozlesme, setDuzenlenenSozlesme] = useState<Sozlesme | null>(null);
  const [goruntulenecekDosya, setGoruntulenecekDosya] = useState<{ veri: string; tip: string; } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'satis' | 'kira' | 'diger'>('all');
  const [filterProje, setFilterProje] = useState<number | ''>('');
  const [filterTarih, setFilterTarih] = useState<{ baslangic: string, bitis: string }>({ baslangic: '', bitis: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const handleYeniEkle = () => {
    setDuzenlenenSozlesme(null);
    setModalAcik(true);
  };
  
  const handleDuzenle = (sozlesme: Sozlesme) => {
    setDuzenlenenSozlesme(sozlesme);
    setModalAcik(true);
  };
  
  const handleSave = (sozlesme: Omit<Sozlesme, 'id'> | Sozlesme) => {
    onSave(sozlesme);
    setModalAcik(false);
  };

  const handleDeleteRequest = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id) {
      onDelete(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };
  
  const filtrelenmisSozlesmeler = useMemo(() => {
    const varlikMap = new Map<number, string>(varliklar.map(v => [v.id, v.type === 'musteri' ? `${v.isim} ${v.soyisim}` : v.sirketAdi]));
    return sozlesmeler.filter(s => {
      const tarafAdi = varlikMap.get(s.varlikId)?.toLowerCase() || '';
      const searchMatch = s.baslik.toLowerCase().includes(searchTerm.toLowerCase()) || tarafAdi.includes(searchTerm.toLowerCase());

      const typeMatch = filterType === 'all' || s.tip === filterType;

      const projeMatch = filterProje === '' || s.projeId === filterProje;

      const dateMatch = (!filterTarih.baslangic || s.sozlesmeTarihi >= filterTarih.baslangic) &&
                        (!filterTarih.bitis || s.sozlesmeTarihi <= filterTarih.bitis);

      return searchMatch && typeMatch && projeMatch && dateMatch;
    });
  }, [sozlesmeler, varliklar, searchTerm, filterType, filterProje, filterTarih]);


  const reportStats = useMemo(() => {
    const durumlar = ['Taslak', 'Aktif', 'Tamamlandı', 'İptal Edildi'];
    const colorMap: { [key: string]: string } = {
        'Taslak': 'border-yellow-500',
        'Aktif': 'border-green-500',
        'Tamamlandı': 'border-blue-500',
        'İptal Edildi': 'border-gray-400'
    };
    const stats = durumlar.map(durum => ({
      label: durum,
      value: sozlesmeler.filter(s => s.durum === durum).length,
      colorClass: colorMap[durum] || 'border-slate-500'
    }));
    stats.unshift({ label: 'Toplam Sözleşme', value: sozlesmeler.length, colorClass: 'border-purple-500' });
    return stats;
  }, [sozlesmeler]);

  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Sözleşmeler</h1>
        <p className="text-slate-500 mt-2 text-lg">Tüm sözleşmelerinizi yönetin ve arşivleyin.</p>
      </header>

      <ReportHeader stats={reportStats} />

      <CurrencySummaryWidget
        items={filtrelenmisSozlesmeler}
        ayarlar={ayarlar}
        title="Para Birimine Göre Sözleşme Değerleri"
        tutarField="toplamTutar"
        paraBirimiField="paraBirimi"
      />

      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full sm:w-72">
            <input type="text" placeholder="Ara (Başlık, Taraf...)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg"/>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          </div>
          <button onClick={handleYeniEkle} className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Sözleşme</span>
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
            <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Tipe Göre Filtrele</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="p-2 border rounded-lg bg-white">
                    <option value="all">Tüm Tipler</option>
                    <option value="satis">Satış</option>
                    <option value="kira">Kira</option>
                    <option value="diger">Diğer</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Projeye Göre Filtrele</label>
                <select value={filterProje} onChange={e => setFilterProje(e.target.value ? Number(e.target.value) : '')} className="p-2 border rounded-lg bg-white w-48">
                    <option value="">Tüm Projeler</option>
                    {projeler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
                </select>
            </div>
            <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Tarih Aralığı</label>
                <div className="flex items-center gap-2">
                    <DatePickerInput value={filterTarih.baslangic} onChange={date => setFilterTarih(f => ({...f, baslangic: date}))} />
                    <span>-</span>
                    <DatePickerInput value={filterTarih.bitis} onChange={date => setFilterTarih(f => ({...f, bitis: date}))} />
                </div>
            </div>
        </div>

        <SozlesmeListesi
            sozlesmeler={filtrelenmisSozlesmeler}
            varliklar={varliklar}
            onEdit={handleDuzenle}
            onDelete={handleDeleteRequest}
            onDosyaGoruntule={setGoruntulenecekDosya}
            onRowClick={onSozlesmeSec}
        />
      </main>

      {modalAcik && (
        <SozlesmeEkleModal
            onClose={() => setModalAcik(false)}
            onSave={handleSave}
            mevcutSozlesme={duzenlenenSozlesme}
            varliklar={varliklar}
            projeler={projeler}
            emlaklar={emlaklar}
            ayarlar={ayarlar}
        />
      )}

      {goruntulenecekDosya && (
        <FileViewerModal 
            fileUrl={goruntulenecekDosya.veri}
            fileType={goruntulenecekDosya.tip}
            onClose={() => setGoruntulenecekDosya(null)}
        />
      )}
      {deleteConfirm.isOpen && (
        <ConfirmationModal
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={handleDeleteConfirm}
          title="Sözleşmeyi Sil"
          message="Bu sözleşmeyi silmek istediğinizden emin misiniz?"
        />
      )}
    </div>
  );
};

export default SozlesmePage;