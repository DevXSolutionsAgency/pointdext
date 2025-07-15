'use client';

interface TextFieldProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  icon?: string;
}

export function TextField({ label, value, setValue, icon = '' }: TextFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <input
        type="text"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
} 