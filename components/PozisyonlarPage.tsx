import React, { useState } from 'react';
import { Pozisyon } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons/AppIcons';
import PageOverlay from './PageOverlay';

interface PozisyonlarPageProps {
  pozisyonlar: Pozisyon[];
  onSave: (pozisyon: Omit<Pozisyon, 'id'> | Pozisyon) => void;
  onDelete: (id: number) => void;
}

const PozisyonEkleModal: React.FC<{
    onClose: () => void;
    onSave: (pozisyon: Omit<Pozisyon, 'id'> | Pozisyon) => void;
    mevcutPozisyon: Pozisyon | null;
}> = ({ onClose, onSave, mevcutPozisyon }) => {
    const [ad, setAd] = useState(mevcutPozisyon?.ad || '');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAd(e.target.value);
        if (error) setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!ad.trim()){
            setError('Pozisyon adı boş olamaz.');
            return;
        }
        onSave(mevcutPozisyon ? { id: mevcutPozisyon.id, ad } : { ad });
    };

    return (
        <PageOverlay
            title={mevcutPozisyon ? 'Pozisyon Düzenle' : 'Yeni Pozisyon Ekle'}
            onClose={onClose}
            size="md" // Use a smaller modal for this simple form
            footer={<>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">İptal</button>
                <button type="submit" form="pozisyon-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
            </>}
        >
             <form id="pozisyon-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="ad" className="block text-sm font-medium text-slate-700">Pozisyon Adı</label>
                    <input type="text" id="ad" value={ad} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-slate-300'}`} required />
                     {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                </div>
            </form>
        </PageOverlay>
    );
};


const PozisyonlarPage: React.FC<PozisyonlarPageProps> = ({ pozisyonlar, onSave, onDelete }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Pozisyon | null>(null);

  const handleSave = (pozisyon: Omit<Pozisyon, 'id'> | Pozisyon) => {
    onSave(pozisyon);
    setModalAcik(false);
  };
  
  const handleEdit = (pozisyon: Pozisyon) => {
    setDuzenlenen(pozisyon);
    setModalAcik(true);
  };
  
  const handleNew = () => {
    setDuzenlenen(null);
    setModalAcik(true);
  };

  return (
    <div className="w-full page-container">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Pozisyonlar</h1>
        <p className="text-slate-500 mt-2 text-lg">Şirket içindeki iş pozisyonlarını yönetin.</p>
      </header>
      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-end mb-6">
          <button onClick={handleNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Pozisyon Ekle</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pozisyon Adı</th>
                <th className="relative px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pozisyonlar.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{p.ad}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                    <button onClick={() => onDelete(p.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {pozisyonlar.length === 0 && <p className="text-center py-12 text-slate-500">Henüz pozisyon eklenmemiş.</p>}
        </div>
      </main>
      {modalAcik && (
        <PozisyonEkleModal
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutPozisyon={duzenlenen}
        />
      )}
    </div>
  );
};

export default PozisyonlarPage;