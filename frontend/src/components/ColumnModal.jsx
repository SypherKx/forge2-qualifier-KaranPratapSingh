import React from 'react';
import { X } from 'lucide-react';

/**
 * ColumnModal Component
 * Dialog for adding a new swimlane list column to a board.
 */
export default function ColumnModal({
  isOpen,
  listName,
  setListName,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Swimlane Column</div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="form-group">
            <label className="form-label">Column Name</label>
            <input
              type="text"
              className="form-input"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g. Code Review, QA Testing"
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
