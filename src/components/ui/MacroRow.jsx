/** Colored dot + label + value, for P/C/F breakdowns. Stacks for 3-up layout. */
export default function MacroRow({ color, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm text-muted">{label}</span>
      </div>
      <span className="text-[17px] font-bold text-ink">{value}</span>
    </div>
  );
}
