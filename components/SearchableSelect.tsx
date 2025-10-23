import React, { useState, useRef, useEffect, useMemo } from 'react';

interface Option {
  value: number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  selectedValues: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
  isMulti?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, selectedValues, onChange, placeholder, isMulti = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const selectedOptions = useMemo(() => options.filter(opt => selectedValues.includes(opt.value)), [options, selectedValues]);

  const filteredOptions = useMemo(() =>
    options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleSelect = (option: Option) => {
    if (isMulti) {
      const newSelected = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      onChange(newSelected);
    } else {
      onChange([option.value]);
      setIsOpen(false);
    }
    setSearchTerm('');
  };
  
  const handleRemove = (value: number) => {
      onChange(selectedValues.filter(v => v !== value));
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="w-full p-2 border rounded-md mt-1 bg-white flex flex-wrap gap-1 items-center" onClick={() => setIsOpen(true)}>
          {isMulti && selectedOptions.map(opt => (
              <div key={opt.value} className="bg-indigo-100 text-indigo-700 text-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  {opt.label}
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(opt.value);}} className="font-bold">&times;</button>
              </div>
          ))}
          {!isMulti && selectedOptions.length > 0 ? (
              <span className="text-slate-900">{selectedOptions[0].label}</span>
          ) : (
             <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder={selectedOptions.length === 0 ? placeholder : ''}
                className="flex-grow outline-none bg-transparent text-slate-900"
             />
          )}
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`p-2 cursor-pointer hover:bg-indigo-50 text-slate-800 ${selectedValues.includes(option.value) ? 'bg-indigo-100' : ''}`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-slate-500">Sonuç bulunamadı.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;