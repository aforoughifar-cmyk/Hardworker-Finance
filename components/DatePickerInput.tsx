import React from 'react';

interface DatePickerInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      style={{ colorScheme: 'light' }}
    />
  );
};

export default DatePickerInput;