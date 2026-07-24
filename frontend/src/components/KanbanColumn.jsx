import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import KanbanCard from './KanbanCard';

/**
 * KanbanColumn Component
 * Renders an individual swimlane column list (`To Do`, `In Progress`, `Done`, etc.).
 * 
 * Props:
 * - list: Swimlane column object (id, name, cards)
 * - tags: Array of all available tags
 * - members: Array of all available team members
 * - onDragOver: Event handler for drag over swimlane
 * - onDrop: Event handler when a card is dropped into swimlane
 * - onDragStart: Event handler when card drag begins
 * - onCardClick: Handler when clicking card
 * - onDeleteList: Handler to delete swimlane column
 * - onAddCardClick: Handler to open create card modal for this column
 */
export default function KanbanColumn({
  list,
  tags = [],
  members = [],
  onDragOver,
  onDrop,
  onDragStart,
  onCardClick,
  onDeleteList,
  onAddCardClick
}) {
  const cards = list.cards || [];
  const getColumnIcon = (name = '') => {
    if (name.includes('To Do') || name.includes('Queue')) return '📋';
    if (name.includes('Progress') || name.includes('Executing')) return '⚡';
    if (name.includes('Review') || name.includes('Audit')) return '🔍';
    if (name.includes('Done') || name.includes('Shipped')) return '✅';
    return '📌';
  };

  return (
    <div
      className="board-list"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, list.id)}
    >
      {/* Swimlane Column Header */}
      <div className="list-header">
        <div className="list-title-area" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{getColumnIcon(list.name)}</span>
          <span className="list-title">{list.name}</span>
          <span className="card-count-badge">{cards.length}</span>
        </div>
        <button
          className="btn btn-secondary btn-icon"
          style={{ padding: '4px', border: 'none' }}
          onClick={() => onDeleteList && onDeleteList(list.id)}
          title="Delete Column"
        >
          <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Swimlane Cards Container */}
      <div className="list-cards-container">
        {cards.length === 0 ? (
          <div className="placeholder-card">
            No tasks in this lane
          </div>
        ) : (
          cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              tags={tags}
              members={members}
              onDragStart={onDragStart}
              onCardClick={onCardClick}
            />
          ))
        )}
      </div>

      {/* Swimlane Column Footer */}
      <div className="list-footer">
        <button
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onAddCardClick(list.id)}
        >
          <Plus size={14} /> Add Card
        </button>
      </div>
    </div>
  );
}
