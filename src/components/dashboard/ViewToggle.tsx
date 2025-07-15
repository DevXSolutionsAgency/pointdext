'use client';

type ViewMode = 'split' | 'leads' | 'calculator';

interface ViewToggleProps {
  label: string;
  current: ViewMode;
  setView: React.Dispatch<React.SetStateAction<ViewMode>>;
  mode: ViewMode;
}

export function ViewToggle({ label, current, setView, mode }: ViewToggleProps) {
  const isActive = current === mode;
  return (
    <button
      onClick={() => setView(mode)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow'
          : 'bg-white border border-gray-300 text-black hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
} 