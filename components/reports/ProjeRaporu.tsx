import React, { useMemo } from 'react';

interface ProjeRaporuProps {
  data: any;
}

const ProjeRaporu: React.FC<ProjeRaporuProps> = ({ data }) => {
  const { projeler } = data;

  const ortalamaIlerleme = useMemo(() => {
    if (projeler.length === 0) return 0;
    const toplam = projeler.reduce((acc: number, p: any) => acc + p.ilerlemeYuzdesi, 0);
    return Math.round(toplam / projeler.length);
  }, [projeler]);
  
  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Proje Özeti</h2>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Toplam Proje</p>
                <p className="text-2xl font-bold text-gray-800">{projeler.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Ortalama İlerleme</p>
                <p className="text-2xl font-bold text-gray-800">{ortalamaIlerleme}%</p>
            </div>
        </div>
        <ul className="divide-y">
            {projeler.map((proje: any) => (
                <li key={proje.id} className="py-3">
                    <p className="font-semibold">{proje.ad}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${proje.ilerlemeYuzdesi}%` }}></div>
                    </div>
                </li>
            ))}
        </ul>
    </div>
  );
};

export default ProjeRaporu;