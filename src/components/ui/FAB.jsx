import { Plus } from 'lucide-react';

/** Round violet-gradient "+" button. */
export default function FAB({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid place-items-center w-12 h-12 rounded-full accent-gradient glow-accent shrink-0 active:scale-95 transition-transform"
    >
      <Plus className="w-6 h-6 text-white" strokeWidth={2.25} />
    </button>
  );
}
