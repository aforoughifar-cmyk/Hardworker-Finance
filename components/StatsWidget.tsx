import React from 'react';
import UsersIcon from './icons/UsersIcon';
import BuildingIcon from './icons/BuildingIcon';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, textColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <div className={textColor}>{icon}</div>
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

interface StatsWidgetProps {
  musteriSayisi: number;
  firmaSayisi: number;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ musteriSayisi, firmaSayisi }) => {
  return (
    <>
        <StatCard
            icon={<UsersIcon />}
            label="Toplam Müşteri"
            value={musteriSayisi}
            color="bg-sky-100"
            textColor="text-sky-600"
        />
        <StatCard
            icon={<BuildingIcon />}
            label="Toplam Firma"
            value={firmaSayisi}
            color="bg-emerald-100"
            textColor="text-emerald-600"
        />
    </>
  );
};

export default StatsWidget;