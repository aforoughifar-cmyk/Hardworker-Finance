import React, { useState } from 'react';
import { Izin } from '../types';
import PageOverlay from './PageOverlay';
import DatePickerInput from './DatePickerInput';

interface IzinEkleModalProps {
    onClose: () => void;
    onSave: (izin: Omit<Izin, 'id'> | Izin) => void;
    mevcutIzin: Izin | null;
    calisanId: number;
}

const IzinEkleModal: React.FC<IzinEkleModalProps> = ({ onClose, onSave, mevcutIzin, calisanId }) => {
    const [izin, setIzin] = useState<Omit<Izin, 'id' | 'calisanId'>>({
        tip: mevcutIzin?.tip || 'Yıllık İzin',
        baslangicTarihi: mevcutIzin?.baslangicTarihi || new Date().toISOString().split('T')[0],
        bitisTarihi: mevcutIzin?.bitisTarihi || new Date().toISOString().split('T')[0],
        aciklama: mevcutIzin?.aciklama || '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setIzin(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'tip' && value !== 'Diğer') {
                newState.aciklama = '';
            }
            return newState;
        });
    };

    const handleDateChange = (field: 'baslangicTarihi' | 'bitisTarihi', date: string) => {
        setError('');
        setIzin(i => ({...i, [field]: date}));
    };
    
    const validate = () => {
        if (new Date(izin.bitisTarihi) < new Date(izin.baslangicTarihi)) {
            setError('Bitiş tarihi, başlangıç tarihinden önce olamaz.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const dataToSave = { ...izin, calisanId };
        onSave(mevcutIzin ? { ...dataToSave, id: mevcutIzin.id } : dataToSave);
    };
    
    const labelClasses = "block text-sm font-medium text-slate-700 mb-1";

    return (
        <PageOverlay
            title={mevcutIzin ? 'İzin Kaydını Düzenle' : 'Yeni İzin Kaydı Ekle'}
            onClose={onClose}
            footer={<>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">İptal</button>
                <button type="submit" form="izin-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
            </>}
        >
            <form id="izin-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClasses}>İzin Tipi</label>
                    <select name="tip" value={izin.tip} onChange={handleChange} className="w-full p-2 border rounded-md mt-1">
                        <option>Yıllık İzin</option>
                        <option>Raporlu</option>
                        <option>Ücretsiz İzin</option>
                        <option>Diğer</option>
                    </select>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Başlangıç Tarihi</label>
                        <DatePickerInput value={izin.baslangicTarihi} onChange={date => handleDateChange('baslangicTarihi', date)} />
                    </div>
                     <div>
                        <label className={labelClasses}>Bitiş Tarihi</label>
                        <DatePickerInput value={izin.bitisTarihi} onChange={date => handleDateChange('bitisTarihi', date)} />
                    </div>
                </div>
                {error && <p className="text-xs text-red-600 -mt-2 text-center">{error}</p>}
                {izin.tip === 'Diğer' && (
                    <div>
                        <label className={labelClasses}>Açıklama (Neden belirtiniz)</label>
                        <textarea
                            name="aciklama"
                            value={izin.aciklama}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border rounded-md mt-1"
                            required
                        />
                    </div>
                 )}
            </form>
        </PageOverlay>
    );
};

export default IzinEkleModal;