'use client';

import { useEffect } from 'react';
import { RouteAlternative } from '@/types/dashboard';

interface RouteSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  alternatives: RouteAlternative[];
  onSelect: (index: number) => void;
}

export function RouteSelectionModal({
  isOpen,
  onClose,
  alternatives,
  onSelect,
}: RouteSelectionModalProps) {
  // disable background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backdropFilter: 'brightness(60%)' }}
    >
      <div
        className="
          bg-white
          rounded-lg
          w-full
          max-w-2xl
          mx-4
          flex flex-col
          max-h-[90vh]
          shadow-xl
        "
      >
        {/* header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Select Your Route</h2>
          <p className="text-gray-600 mt-1">Choose the best route for your move</p>
        </div>

        {/* scrollable body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {alternatives.map((route, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(route.index)}
                className="
                  w-full text-left p-4
                  border-2 border-gray-200
                  rounded-lg
                  hover:border-blue-500 hover:bg-blue-50
                  transition-all duration-200
                "
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {route.summary || `Route ${idx + 1}`}
                  </h3>
                  {idx === 0 && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Distance:</span>
                    <p className="font-medium text-black">{route.distanceText}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium text-black">{route.durationText}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tolls:</span>
                    <p className="font-medium text-black">
                      {route.tolls} toll{route.tolls !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* footer always visible */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="
              w-full py-2 px-4
              bg-gray-300 text-gray-700
              rounded-lg
              hover:bg-gray-400
              transition-colors
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 