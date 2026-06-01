const TABS = [
  { id: 'workout', label: 'Workout' },
  { id: 'food', label: 'Food' },
  { id: 'history', label: 'History' },
];

export default function TabNav({ tab, onChange }) {
  return (
    <div className="tab-row">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab${tab === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
