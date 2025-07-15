'use client';

interface CostItemProps {
  label: string;
  value: number;
  icon: string;
}

export function CostItem({ label, value, icon }: CostItemProps) {
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <p className="text-xl font-semibold">${value.toFixed(2)}</p>
    </div>
  );
} 