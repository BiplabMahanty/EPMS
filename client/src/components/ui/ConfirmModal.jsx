import Modal from './Modal';

export default function ConfirmModal({ onCancel, onConfirm, message, loading }) {
  return (
    <Modal title="Are you sure?" onClose={onCancel}>
      <p style={{ color: 'var(--esp-text-secondary)', marginBottom: 20 }}>{message || 'This action cannot be undone.'}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Modal>
  );
}
