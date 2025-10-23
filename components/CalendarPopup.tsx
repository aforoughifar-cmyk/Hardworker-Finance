
import React, { useState, useMemo } from 'react';

interface CalendarPopupProps {
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({ onSelectDate, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = useMemo(() => ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'], []);
  
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    let startDayOfWeek = firstDayOfMonth.getDay() - 1; 
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday fix for Monday start

    return { year, month, daysInMonth, startDayOfWeek };
  }, [currentDate]);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const blanks = Array(monthData.startDayOfWeek).fill(null);
  const days = Array.from({ length: monthData.daysInMonth }, (_, i) => i + 1);

  const handleDateClick = (day: number) => {
    const selected = new Date(monthData.year, monthData.month, day);
    
    // FIX: Manually format the date to YYYY-MM-DD to avoid timezone issues with toISOString().
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const date = String(selected.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    
    onSelectDate(dateString);
  };
  
  const changeMonth = (delta: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div className="absolute top-full right-0 mt-2 z-20 bg-white p-4 rounded-xl shadow-lg border w-72">
        <div className="flex justify-between items-center mb-2">
            <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100">&lt;</button>
            <h3 className="text-sm font-semibold text-slate-700">
            {monthNames[monthData.month]} {monthData.year}
            </h3>
            <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
            {daysOfWeek.map(day => (
            <div key={day} className="font-semibold text-slate-500">{day}</div>
            ))}
            {blanks.map((_, index) => (
            <div key={`blank-${index}`} />
            ))}
            {days.map(day => (
                <div key={day} onClick={() => handleDateClick(day)} className="p-1 flex items-center justify-center">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer text-slate-700 hover:bg-sky-100 hover:text-sky-700 transition-colors">
                        {day}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default CalendarPopup;
