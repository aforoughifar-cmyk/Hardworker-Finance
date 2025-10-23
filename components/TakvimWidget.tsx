import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { TakvimEtkinligi } from '../types';
import EventModal from './EventModal';

interface TakvimWidgetProps {
  etkinlikler: TakvimEtkinligi[];
  onEtkinlikEkle: (aciklama: string, tarih: string) => void;
}

const TakvimWidget: React.FC<TakvimWidgetProps> = ({ etkinlikler, onEtkinlikEkle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seciliTarih, setSeciliTarih] = useState<Date | null>(null);

  const daysOfWeek = useMemo(() => ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'], []);
  
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    let startDayOfWeek = firstDayOfMonth.getDay() - 1; 
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    return { year, month, daysInMonth, startDayOfWeek };
  }, [currentDate]);

  const etkinliklerByDate = useMemo(() => {
    const map = new Map<string, TakvimEtkinligi[]>();
    etkinlikler.forEach(e => {
        // Adjust for timezone when creating the key
        const date = new Date(e.tarih);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const correctedDate = new Date(date.getTime() + userTimezoneOffset);
        const dateKey = correctedDate.toISOString().split('T')[0];

        if (!map.has(dateKey)) {
            map.set(dateKey, []);
        }
        map.get(dateKey)?.push(e);
    });
    return map;
  }, [etkinlikler]);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const blanks = Array(monthData.startDayOfWeek).fill(null);
  const days = Array.from({ length: monthData.daysInMonth }, (_, i) => i + 1);

  const handleDateClick = (day: number) => {
    setSeciliTarih(new Date(monthData.year, monthData.month, day));
  };
  
  const handleSaveEvent = (aciklama: string) => {
    if (seciliTarih) {
        onEtkinlikEkle(aciklama, seciliTarih.toISOString().split('T')[0]);
        setSeciliTarih(null);
    }
  }
  
  const changeMonth = (delta: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }
  
  const getTipRengi = (tip: TakvimEtkinligi['tip']) => {
    switch(tip) {
        case 'fatura': return 'bg-sky-500';
        case 'proje': return 'bg-purple-500';
        case 'cek-vade': return 'bg-red-500';
        case 'cek-tanzim': return 'bg-amber-500';
        case 'taksit': return 'bg-teal-500';
        default: return 'bg-gray-500';
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 text-lg font-bold text-slate-800">&lt;</button>
            <h3 className="text-xl font-bold text-slate-700">
                {monthNames[monthData.month]} {monthData.year}
            </h3>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 text-lg font-bold text-slate-800">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map(day => (
                <div key={day} className="font-semibold text-xs text-slate-500 py-2">{day}</div>
            ))}
            {blanks.map((_, index) => <div key={`blank-${index}`} />)}
            {days.map(day => {
                const dateKey = new Date(monthData.year, monthData.month, day).toISOString().split('T')[0];
                const gununEtkinlikleri = etkinliklerByDate.get(dateKey) || [];
                const isToday = new Date().toDateString() === new Date(monthData.year, monthData.month, day).toDateString();
                return (
                    <div key={day} onClick={() => handleDateClick(day)} className="border border-slate-100 h-24 p-1 text-left relative cursor-pointer hover:bg-slate-50 flex flex-col">
                        <span className={`text-xs font-semibold ${isToday ? 'bg-sky-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-slate-700'}`}>
                            {day}
                        </span>
                        <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-0.5">
                            {gununEtkinlikleri.slice(0, 2).map(e => (
                                <div key={e.id} className={`p-0.5 rounded-sm text-white truncate ${getTipRengi(e.tip)}`} title={e.aciklama}>
                                    {e.aciklama}
                                </div>
                            ))}
                            {gununEtkinlikleri.length > 2 && <div className="text-sky-700 font-bold">...</div>}
                        </div>
                    </div>
                )
            })}
        </div>
        {seciliTarih && <EventModal tarih={seciliTarih} onClose={() => setSeciliTarih(null)} onSave={handleSaveEvent} />}
    </div>
  );
};

export default TakvimWidget;