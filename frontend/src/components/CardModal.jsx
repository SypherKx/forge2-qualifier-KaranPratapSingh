import React from 'react';
import { X, Trash2 } from 'lucide-react';

/**
 * CardModal Component
 * Modal dialog for creating or editing a Kanban card.
 * 
 * Props:
 * - isOpen: Boolean modal visibility
 * - editingCard: Card object being edited (null if creating)
 * - cardForm: Form state object ({ title, description, due_date, list_id, members, tags })
 * - setCardForm: Form setter function
 * - lists: Array of swimlane lists
 * - tags: Array of all available tags
 * - members: Array of all team members
 * - onClose: Handler to close modal
 * - onSubmit: Handler to save card
 * - onDelete: Handler to delete card (when editing)
 */
export default function CardModal({
  isOpen,
  editingCard,
  cardForm,
  setCardForm,
  lists = [],
  tags = [],
  members = [],
  onClose,
  onSubmit,
  onDelete
}) {
  if (!isOpen) return null;

  const toggleTag = (tagId) => {
    const currentTags = cardForm.tags || [];
    if (currentTags.includes(tagId)) {
      setCardForm({ ...cardForm, tags: currentTags.filter(id => id !== tagId) });
    } else {
      setCardForm({ ...cardForm, tags: [...currentTags, tagId] });
    }
  };

  const toggleMember = (memberId) => {
    const currentMembers = cardForm.members || [];
    if (currentMembers.includes(memberId)) {
      setCardForm({ ...cardForm, members: currentMembers.filter(id => id !== memberId) });
    } else {
      setCardForm({ ...cardForm, members: [...currentMembers, memberId] });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">{editingCard ? 'Edit Task Card' : 'Create Task Card'}</div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          {/* Card Title */}
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              value={cardForm.title || ''}
              onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
              placeholder="e.g. Implement OAuth authentication"
              required
            />
          </div>

          {/* Swimlane Column Select */}
          <div className="form-group">
            <label className="form-label">Swimlane List</label>
            <select
              className="form-select"
              value={cardForm.list_id || ''}
              onChange={(e) => setCardForm({ ...cardForm, list_id: parseInt(e.target.value) })}
            >
              {lists.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Card Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={cardForm.description || ''}
              onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
              placeholder="Detailed task description or acceptance criteria..."
            />
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={cardForm.due_date ? cardForm.due_date.split('T')[0] : ''}
              onChange={(e) => setCardForm({ ...cardForm, due_date: e.target.value })}
            />
          </div>

          {/* Categorization Tags Selector */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tag-selector-grid">
              {tags.map(t => {
                const isSelected = (cardForm.tags || []).includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`tag-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleTag(t.id)}
                  >
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: t.color
                      }}
                    />
                    <span>{t.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Member Assignee Selector */}
          <div className="form-group">
            <label className="form-label">Assign Members</label>
            <div className="tag-selector-grid">
              {members.map(m => {
                const isSelected = (cardForm.members || []).includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`tag-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMember(m.id)}
                  >
                    <div
                      className="member-avatar"
                      style={{ backgroundColor: m.avatar_color || '#4F46E5', width: '18px', height: '18px', fontSize: '10px' }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
            {editingCard ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(editingCard.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingCard ? 'Save Changes' : 'Create Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
