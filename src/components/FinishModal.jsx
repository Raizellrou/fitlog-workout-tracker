export default function FinishModal({ open, summary, onCancel, onConfirm }) {
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Save session?</div>
        <p className="modal-text">
          This will save today&apos;s workout to history and reset the tracker
          for tomorrow.
        </p>
        <p className="modal-summary">{summary}</p>
        <div className="modal-actions">
          <button
            className="cta-btn secondary"
            style={{ flex: 1 }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="cta-btn" style={{ flex: 1 }} onClick={onConfirm}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
