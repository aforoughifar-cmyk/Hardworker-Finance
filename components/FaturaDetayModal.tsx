import React from 'react';
import { Fatura, Varlik, Ayarlar, Cek, OdemeKaydi } from '../types';
import FaturaSablonu from './FaturaSablonu';
import PageOverlay from './PageOverlay';
import { PdfIcon } from './icons/AppIcons';

interface FaturaDetayModalProps {
  fatura: Fatura;
  varlik: Varlik;
  ayarlar: Ayarlar;
  cekler: Cek[];
  onClose: () => void;
  onMakbuzIndir: (odeme: OdemeKaydi) => void;
}

const FaturaDetayModal: React.FC<FaturaDetayModalProps> = ({ fatura, varlik, ayarlar, cekler, onClose, onMakbuzIndir }) => {
    const ilgiliCek = cekler.find(cek => cek.cekNo === fatura.cekNumarasi || (cek.faturaIds && cek.faturaIds.includes(fatura.id)));
    const sembol = ayarlar.paraBirimleri.find(p => p.kod === fatura.paraBirimi)?.sembol || fatura.paraBirimi;

    return (
        <PageOverlay
            title={`Fatura Detayı - #${fatura.faturaNo}`}
            onClose={onClose}
            footer={
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800">
                    Kapat
                </button>
            }
        >
            <div className="bg-white p-4 rounded-lg shadow-inner space-y-4">
                {ilgiliCek && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-sm">
                        Bu fatura, <strong>#{ilgiliCek.cekNo}</strong> numaralı çek ile ilişkilendirilmiştir.
                    </div>
                )}
                {fatura.odemeler && fatura.odemeler.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Ödeme Geçmişi</h3>
                        <ul className="divide-y bg-slate-50 border rounded-md p-2">
                            {fatura.odemeler.map(odeme => (
                                <li key={odeme.id} className="py-2 flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-800">{new Date(odeme.tarih).toLocaleDateString('tr-TR')} - {odeme.odemeTipi}</p>
                                        {odeme.aciklama && <p className="text-xs text-slate-500">{odeme.aciklama}</p>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold text-emerald-600">{sembol}{odeme.tutar.toFixed(2)}</p>
                                        <button 
                                            onClick={() => onMakbuzIndir(odeme)}
                                            className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100"
                                            aria-label="Makbuzu İndir"
                                        >
                                            <PdfIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="transform scale-[.95] origin-top mx-auto">
                    <FaturaSablonu fatura={fatura} varlik={varlik} ayarlar={ayarlar} />
                </div>
            </div>
        </PageOverlay>
    );
};

export default FaturaDetayModal;