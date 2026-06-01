export default function EmptyState({ icon, title, sub }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
    </div>
  );
}
