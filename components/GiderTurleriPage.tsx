import React, { useState } from 'react';
import { GiderTuru } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons/AppIcons';
import GiderTuruEkleModal from './GiderTuruEkleModal';

interface GiderTurleriPageProps {
  giderTurleri: GiderTuru[];
  onSave: (giderTuru: Omit<GiderTuru, 'id'> | GiderTuru) => void;
  onDelete: (id: number) => void;
}

const GiderTurleriPage: React.FC<GiderTurleriPageProps> = ({ giderTurleri, onSave, onDelete }) => {
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<GiderTuru | null>(null);

  const handleSave = (giderTuru: Omit<GiderTuru, 'id'> | GiderTuru) => {
    onSave(giderTuru);
    setModalAcik(false);
  };
  
  const handleEdit = (giderTuru: GiderTuru) => {
    setDuzenlenen(giderTuru);
    setModalAcik(true);
  };
  
  const handleNew = () => {
    setDuzenlenen(null);
    setModalAcik(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu gider türünü silmek istediğinizden emin misiniz?")) {
      onDelete(id);
    }
  };


  return (
    <div className="w-full">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Emlak Gider Türleri</h1>
        <p className="text-slate-500 mt-2 text-lg">Emlaklarla ilgili genel gider türlerini yönetin.</p>
      </header>
      <main className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-end mb-6">
          <button onClick={handleNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon />
            <span>Yeni Gider Türü Ekle</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Açıklama</th>
                <th className="relative px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {giderTurleri.map(gt => (
                <tr key={gt.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{gt.ad}</td>
                  <td className="px-6 py-4 text-slate-600">{gt.aciklama}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(gt)} className="p-1.5 rounded-full text-sky-600 hover:bg-sky-100"><EditIcon /></button>
                    <button onClick={() => handleDelete(gt.id)} className="p-1.5 rounded-full text-red-600 hover:bg-red-100"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {giderTurleri.length === 0 && <p className="text-center py-12 text-slate-500">Henüz gider türü eklenmemiş.</p>}
        </div>
      </main>
      {modalAcik && (
        <GiderTuruEkleModal
          onClose={() => setModalAcik(false)}
          onSave={handleSave}
          mevcutGiderTuru={duzenlenen}
        />
      )}
    </div>
  );
};

export default GiderTurleriPage;
