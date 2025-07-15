'use client';

import { NumberField } from './NumberField';

interface MetricCardProps {
  label: string;
  value: number;
  setValue: (val: number) => void;
  icon: string;
  unit: string;
  prefix?: string;
}

export function MetricCard({
  label,
  value,
  setValue,
  icon,
  unit,
  prefix = '',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-500 uppercase">{unit}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <NumberField label="" value={value} setValue={setValue} prefix={prefix} compact />
    </div>
  );
} 