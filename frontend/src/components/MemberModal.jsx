import React from 'react';
import { X } from 'lucide-react';

/**
 * MemberModal Component
 * Dialog for adding a new team member to the workspace.
 */
export default function MemberModal({
  isOpen,
  memberForm,
  setMemberForm,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  const AVATAR_COLORS = ['#f54e00', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Team Member</div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Karan Pratap"
              value={memberForm.name || ''}
              onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. karan@example.com"
              value={memberForm.email || ''}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Color</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {AVATAR_COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setMemberForm({ ...memberForm, avatar_color: color })}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: memberForm.avatar_color === color ? '2px solid var(--text-primary)' : '2px solid transparent'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
