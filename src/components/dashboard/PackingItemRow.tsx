'use client';

import { useEffect, useState } from 'react';
import { PackingItem } from '@/types/dashboard';
import { NumberField } from '@/components/ui';

interface PackingItemRowProps {
  item: PackingItem;
  idx: number;
  updatePackingItem: (idx: number, field: 'price' | 'quantity', val: number) => void;
}

export function PackingItemRow({ item, idx, updatePackingItem }: PackingItemRowProps) {
  const [localQuantity, setLocalQuantity] = useState(String(item.quantity));

  useEffect(() => {
    if (item.quantity !== 0) {
      setLocalQuantity(String(item.quantity));
    }
  }, [item.quantity]);

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="font-medium text-gray-800 text-sm mb-2">{item.name}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">Price</label>
          <input
            type="number"
            step="0.01"
            onWheel={(e) => e.currentTarget.blur()}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-black focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            value={item.price}
            onChange={(e) => updatePackingItem(idx, 'price', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Quantity</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-black focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            value={localQuantity}
            onWheel={(e) => e.currentTarget.blur()}
            onChange={(e) => {
              const raw = e.target.value;
              setLocalQuantity(raw);

              if (raw.trim() === '') {
                updatePackingItem(idx, 'quantity', 0);
              } else {
                const parsed = parseInt(raw);
                if (!isNaN(parsed)) {
                  updatePackingItem(idx, 'quantity', parsed);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 