import React from 'react';

interface PeriodSelectorProps {
  period: { year: number; month: number };
  onPeriodChange: (newPeriod: { year: number; month: number }) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ period, onPeriodChange }) => {
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const handleMonthChange = (delta: number) => {
    let newMonth = period.month + delta;
    let newYear = period.year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    onPeriodChange({ year: newYear, month: newMonth });
  };

  const handleYearChange = (delta: number) => {
    onPeriodChange({ ...period, year: period.year + delta });
  };

  return (
    <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-lg">
      <div className="flex items-center gap-1">
        <button onClick={() => handleYearChange(-1)} className="px-2 py-1 rounded hover:bg-slate-200 text-lg font-bold text-slate-700">&laquo;</button>
        <button onClick={() => handleMonthChange(-1)} className="px-2 py-1 rounded hover:bg-slate-200 text-lg font-bold text-slate-700">&lsaquo;</button>
      </div>
      <div className="text-center font-semibold text-slate-700 w-36">
        {monthNames[period.month - 1]} {period.year}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => handleMonthChange(1)} className="px-2 py-1 rounded hover:bg-slate-200 text-lg font-bold text-slate-700">&rsaquo;</button>
        <button onClick={() => handleYearChange(1)} className="px-2 py-1 rounded hover:bg-slate-200 text-lg font-bold text-slate-700">&raquo;</button>
      </div>
    </div>
  );
};

export default PeriodSelector;