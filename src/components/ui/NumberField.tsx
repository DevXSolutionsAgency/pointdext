'use client';

import { useEffect, useState } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  setValue: (val: number) => void;
  icon?: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
}

export function NumberField({
  label,
  value,
  setValue,
  icon = '',
  prefix = '',
  suffix = '',
  compact = false,
}: NumberFieldProps) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    setLocalValue(value === 0 ? '' : String(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setLocalValue(raw);

    if (raw.trim() === '') {
      setValue(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      setValue(parsed);
    }
  }

  return (
    <div className={`space-y-1 ${compact ? '' : ''}`}>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>
        )}
        <input
          type="number"
          onWheel={(e) => e.currentTarget.blur()}
          className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
            prefix ? 'pl-8' : ''
          } ${suffix ? 'pr-12' : ''}`}
          value={localValue}
          onChange={handleChange}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
} 