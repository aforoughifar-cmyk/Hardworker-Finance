import React, { useState, useRef } from 'react';
import { CalisanDosyasi } from '../types';
import PageOverlay from './PageOverlay';
import { PaperClipIcon } from './icons/AppIcons';

interface DosyaEkleModalProps {
    onClose: () => void;
    onSave: (dosya: Omit<CalisanDosyasi, 'id'>) => void;
}

const DosyaEkleModal: React.FC<DosyaEkleModalProps> = ({ onClose, onSave }) => {
    const [ad, setAd] = useState('');
    const [dosya, setDosya] = useState<{ adi: string, veri: string, tipi: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setDosya({
                    adi: file.name,
                    veri: event.target?.result as string,
                    tipi: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ad.trim() && dosya) {
            onSave({
                ad: ad,
                dosyaAdi: dosya.adi,
                dosyaVeri: dosya.veri,
                dosyaTipi: dosya.tipi,
            });
        } else {
            alert('Lütfen tüm alanları doldurun.');
        }
    };

    const labelClasses = "block text-sm font-medium text-slate-700 mb-1";

    return (
        <PageOverlay
            title="Yeni Belge Ekle"
            onClose={onClose}
            size="lg"
            footer={<>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">İptal</button>
                <button type="submit" form="dosya-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Kaydet</button>
            </>}
        >
            <form id="dosya-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClasses}>Belge Başlığı</label>
                    <input
                        type="text"
                        value={ad}
                        onChange={(e) => setAd(e.target.value)}
                        placeholder="Örn: Kimlik Fotokopisi"
                        className="w-full p-2 border rounded-md mt-1"
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Dosya</label>
                    <div className="mt-1 flex items-center gap-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-sm font-semibold rounded-md">
                            <PaperClipIcon/> Dosya Seç
                        </button>
                        {dosya && <span className="text-sm text-slate-600">{dosya.adi}</span>}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" required/>
                    </div>
                </div>
            </form>
        </PageOverlay>
    );
};

export default DosyaEkleModal;