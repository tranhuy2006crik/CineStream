import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.label === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-black/20 border rounded-lg px-4 py-2.5 text-sm text-on-surface outline-none transition-all cursor-pointer ${
          isOpen ? 'border-primary-container shadow-[0_0_10px_rgba(229,9,20,0.2)]' : 'border-white/10 hover:border-white/30'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown size={16} className={`text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl py-1.5 animate-fade-in origin-top">
          {options.map((opt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onChange(opt.value || opt.label);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                (value === (opt.value || opt.label)) ? 'text-primary-container font-bold bg-primary-container/10' : 'text-on-surface hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
