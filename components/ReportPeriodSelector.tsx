import React, { useState } from 'react';
import DatePickerInput from './DatePickerInput';

interface ReportPeriodSelectorProps {
    dateRange: { start: Date, end: Date };
    onDateRangeChange: (range: { start: Date, end: Date }) => void;
}

const ReportPeriodSelector: React.FC<ReportPeriodSelectorProps> = ({ dateRange, onDateRangeChange }) => {
    const setPeriod = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        onDateRangeChange({ start, end });
    };

    const setThisMonth = () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        onDateRangeChange({ start, end });
    };

    const setThisYear = () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        onDateRangeChange({ start, end });
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setPeriod(7)} className="px-3 py-1 text-sm bg-gray-200 text-slate-700 hover:bg-slate-300 rounded-md">Bu Hafta</button>
            <button onClick={setThisMonth} className="px-3 py-1 text-sm bg-gray-200 text-slate-700 hover:bg-slate-300 rounded-md">Bu Ay</button>
            <button onClick={setThisYear} className="px-3 py-1 text-sm bg-gray-200 text-slate-700 hover:bg-slate-300 rounded-md">Bu Yıl</button>
            <div className="flex items-center gap-2">
                <DatePickerInput 
                    value={dateRange.start.toISOString().split('T')[0]} 
                    onChange={date => onDateRangeChange({ ...dateRange, start: new Date(date) })} 
                />
                <span>-</span>
                 <DatePickerInput 
                    value={dateRange.end.toISOString().split('T')[0]} 
                    onChange={date => onDateRangeChange({ ...dateRange, end: new Date(date) })} 
                />
            </div>
        </div>
    );
};

export default ReportPeriodSelector;