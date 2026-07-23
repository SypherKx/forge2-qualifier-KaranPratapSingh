import React from 'react';
import { X } from 'lucide-react';

/**
 * BoardModal Component
 * Dialog for creating a new Kanban Board.
 */
export default function BoardModal({
  isOpen,
  boardName,
  setBoardName,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create New Board</div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="form-group">
            <label className="form-label">Board Name</label>
            <input
              type="text"
              className="form-input"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="e.g. Mobile App Sprint 2026"
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
