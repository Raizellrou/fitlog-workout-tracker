/**
 * Leading icon tile + title + subtitle + trailing slot.
 * Used by exercises, meals, history, settings.
 */
export default function ListRow({ icon, title, subtitle, trailing, onClick, className = '' }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-2xl bg-surface-2 border border-white/5 px-3.5 py-3 text-left ${onClick ? 'active:scale-[0.99] transition-transform' : ''} ${className}`}
    >
      {icon && (
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-accent-soft text-accent shrink-0">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-ink truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted truncate mt-0.5">{subtitle}</div>}
      </div>
      {trailing != null && <div className="shrink-0 flex items-center gap-2">{trailing}</div>}
    </Tag>
  );
}
