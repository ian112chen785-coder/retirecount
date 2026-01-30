import React from 'react';
import { Lock, Unlock } from 'lucide-react';

// Modern Minimalist Card with Locking support
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  isLocked = false,
  onToggleLock,
}) => (
  <div
    className={`bg-void-900 border border-void-800 rounded-3xl p-6 transition-all duration-300 ${
      isLocked ? 'opacity-90 grayscale-[0.3]' : 'hover:border-void-700'
    } ${className}`}
  >
    {(title || onToggleLock) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-light tracking-wide text-white flex items-center gap-2">{title}</h3>}
        {onToggleLock && (
          <button
            onClick={onToggleLock}
            className={`p-2 rounded-full transition-colors ${
              isLocked ? 'text-accent-400 bg-void-800' : 'text-void-700 hover:text-white'
            }`}
            title={isLocked ? "解鎖" : "鎖定防止誤觸"}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        )}
      </div>
    )}
    <div className={`transition-opacity duration-200 ${isLocked ? 'pointer-events-none opacity-60' : ''}`}>
      {children}
    </div>
  </div>
);

// Modern Rounded Button (Glass/Minimalist)
export const Button3D: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'neutral' }
> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyles =
    'relative px-6 py-2.5 font-medium rounded-full transition-all duration-200 active:scale-95 focus:outline-none flex items-center justify-center gap-2 text-sm tracking-wide';
  
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]',
    danger: 'bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40',
    neutral: 'bg-void-800 text-gray-300 border border-void-700 hover:bg-void-700 hover:text-white',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Input group with Locked state styling
interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  helperText?: string;
  disabled?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  helperText,
  disabled = false,
}) => {
  return (
    <div className="mb-6 last:mb-0 group">
      <div className="flex justify-between items-end mb-2">
        <label className={`text-xs font-medium tracking-wider transition-colors ${disabled ? 'text-void-700' : 'text-gray-400 group-hover:text-gray-300'}`}>
          {label}
        </label>
        <span className={`font-mono text-sm transition-colors ${disabled ? 'text-void-700' : 'text-white'}`}>
           {value.toLocaleString()} <span className="text-xs text-gray-500">{unit}</span>
        </span>
      </div>
      
      {/* Input Wrapper */}
      <div className="relative mb-3">
        <input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(Math.min(Math.max(val, 0), max * 2));
          }}
          className={`w-full bg-void-950 border rounded-xl py-3 px-4 text-sm focus:outline-none transition-all
            ${disabled 
              ? 'border-void-900 text-void-700 cursor-not-allowed' 
              : 'border-void-800 text-gray-200 focus:border-white/20 hover:border-void-700'
            }`}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1 bg-void-800 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
          ${disabled 
            ? '[&::-webkit-slider-thumb]:bg-void-700 cursor-not-allowed' 
            : '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform'
          }
        `}
      />
      {helperText && !disabled && <p className="text-[10px] text-gray-600 mt-2">{helperText}</p>}
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-void-900 border border-void-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col relative">
        <div className="flex justify-between items-center p-6 border-b border-void-800 sticky top-0 bg-void-900/95 backdrop-blur z-10">
          <h2 className="text-xl font-light text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-void-800 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6">
            {children}
        </div>
      </div>
    </div>
  );
};