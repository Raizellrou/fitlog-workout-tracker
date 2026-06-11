import BottomSheet from './BottomSheet';

export default function ConfirmSheet({ title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  return (
    <BottomSheet
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-surface-2 border border-white/8 text-muted font-semibold py-3.5"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-[2] rounded-full bg-danger/15 border border-danger/30 text-danger font-semibold py-3.5 active:scale-[0.98] transition-transform"
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="rounded-2xl bg-danger/8 border border-danger/15 px-4 py-4">
        <p className="text-sm text-ink/80 leading-relaxed">{message}</p>
      </div>
    </BottomSheet>
  );
}
