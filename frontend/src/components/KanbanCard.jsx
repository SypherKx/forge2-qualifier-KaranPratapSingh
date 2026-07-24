import React from 'react';
import { Calendar, User, Trash2 } from 'lucide-react';

/**
 * KanbanCard Component
 * Renders an individual draggable card inside a swimlane list.
 * 
 * Props:
 * - card: Card data object (id, title, description, due_date, members, tags)
 * - tags: Array of all available tag definitions
 * - members: Array of all team member definitions
 * - onDragStart: Handler for HTML5 drag start
 * - onCardClick: Handler when clicking card to edit
 * - onDeleteCard: Handler to delete card
 */
export default function KanbanCard({ 
  card, 
  tags = [], 
  members = [], 
  onDragStart, 
  onCardClick, 
  onDeleteCard 
}) {
  // Check if due date is in the past (overdue)
  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  // Find assigned member objects
  const cardMemberIds = card.members ? card.members.map(m => typeof m === 'object' ? m.id : m) : [];
  const assignedMembers = members.filter(m => cardMemberIds.includes(m.id));

  // Find assigned tag objects
  const cardTagIds = card.tags ? card.tags.map(t => typeof t === 'object' ? t.id : t) : [];
  const assignedTags = tags.filter(t => cardTagIds.includes(t.id));

  // Check for Agent assignments safely
  const isHermesAssigned = (Array.isArray(assignedMembers) && assignedMembers.some(m => m && m.name && typeof m.name === 'string' && m.name.includes('Hermes'))) || (card && card.title && typeof card.title === 'string' && card.title.includes('Hermes'));
  const isOpenClawAssigned = (Array.isArray(assignedMembers) && assignedMembers.some(m => m && m.name && typeof m.name === 'string' && m.name.includes('OpenClaw'))) || (card && card.title && typeof card.title === 'string' && card.title.includes('OpenClaw'));

  return (
    <div
      className={`kanban-card ${isOverdue ? 'overdue' : ''}`}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, card.id)}
      onClick={() => onCardClick && onCardClick(card)}
    >
      {/* Agent Badges & Tag Badges */}
      <div className="card-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
        {isHermesAssigned && (
          <span
            className="tag-badge agent-pill-hermes"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#8B5CF6',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              fontWeight: 600
            }}
          >
            🧠 Hermes (Brain)
          </span>
        )}
        {isOpenClawAssigned && (
          <span
            className="tag-badge agent-pill-openclaw"
            style={{
              backgroundColor: 'rgba(245, 78, 0, 0.15)',
              color: '#F54E00',
              borderColor: 'rgba(245, 78, 0, 0.4)',
              fontWeight: 600
            }}
          >
            🛠️ OpenClaw (Hands)
          </span>
        )}
        {assignedTags.map(tag => (
          <span
            key={tag.id}
            className="tag-badge"
            style={{
              backgroundColor: tag.color + '20',
              color: tag.color,
              borderColor: tag.color + '40'
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Title */}
      <div className="card-title">{card.title}</div>

      {/* Description Preview */}
      {card.description && (
        <div className="card-desc-preview">{card.description}</div>
      )}

      {/* Card Metadata Footer */}
      <div className="card-meta">
        <div className="card-meta-left" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Due Date Indicator */}
          {card.due_date && (
            <div className={`card-due-date ${isOverdue ? 'alert' : ''}`}>
              <Calendar size={12} />
              <span>{new Date(card.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Assigned Member Avatars */}
        <div className="card-members" style={{ display: 'flex', gap: '-4px' }}>
          {assignedMembers.map(m => (
            <div
              key={m.id}
              className="member-avatar"
              style={{ backgroundColor: m.avatar_color || '#4F46E5' }}
              title={m.name}
            >
              {m.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
