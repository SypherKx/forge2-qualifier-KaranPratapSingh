import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Sun, Moon, Play, Activity, Search, Filter, Trash2 } from 'lucide-react';

/**
 * BoardHeader Component
 * Workspace header bar containing board selection, search/filters, action buttons, and theme toggling.
 */
export default function BoardHeader({
  boards = [],
  selectedBoardId,
  onSelectBoard,
  onOpenBoardModal,
  onOpenListModal,
  onSeedDemo,
  seeding,
  onToggleActivityDrawer,
  searchQuery,
  setSearchQuery,
  selectedTagFilter,
  setSelectedTagFilter,
  selectedMemberFilter,
  setSelectedMemberFilter,
  filterOverdueOnly,
  setFilterOverdueOnly,
  tags = [],
  members = [],
  darkMode,
  setDarkMode,
  onDeleteBoard
}) {
  const navigate = useNavigate();

  return (
    <header className="app-header" style={{ height: 'auto', padding: '0.75rem 2rem', flexWrap: 'wrap', gap: '1rem' }}>
      {/* Brand & Navigation Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => navigate('/')}
          title="Back to Landing Page"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="brand">
          <span className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>AgileBoard</span>
          <span className="brand-tag">Workspace</span>
        </div>
      </div>

      {/* Board Selector & Main Actions */}
      <div className="board-picker" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select
          className="select-dropdown"
          value={selectedBoardId || ''}
          onChange={(e) => onSelectBoard(parseInt(e.target.value))}
        >
          {boards.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <button className="btn btn-secondary" onClick={onOpenBoardModal} title="New Board">
          <Plus size={14} /> New Board
        </button>

        <button className="btn btn-secondary" onClick={onOpenListModal} title="Add Swimlane Column">
          <Plus size={14} /> Add Column
        </button>

        <button
          className="btn btn-primary"
          onClick={onSeedDemo}
          disabled={seeding}
          title="Seed Demo Kanban Board"
        >
          <Play size={14} /> {seeding ? 'Seeding...' : 'Seed Demo Board'}
        </button>

        {selectedBoardId && (
          <button
            className="btn btn-danger btn-icon"
            onClick={() => onDeleteBoard(selectedBoardId)}
            title="Delete Current Board"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '30px', paddingRight: '10px', height: '34px', fontSize: '12px', width: '160px' }}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tag Filter */}
        <select
          className="form-select"
          style={{ height: '34px', fontSize: '12px', padding: '0 8px' }}
          value={selectedTagFilter}
          onChange={(e) => setSelectedTagFilter(e.target.value)}
        >
          <option value="">All Tags</option>
          {tags.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Member Filter */}
        <select
          className="form-select"
          style={{ height: '34px', fontSize: '12px', padding: '0 8px' }}
          value={selectedMemberFilter}
          onChange={(e) => setSelectedMemberFilter(e.target.value)}
        >
          <option value="">All Members</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Overdue Filter Toggle */}
        <button
          className={`step-tab-btn ${filterOverdueOnly ? 'active' : ''}`}
          style={{ height: '34px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
        >
          <Filter size={12} /> Overdue
        </button>
      </div>

      {/* Header Actions Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
        <button
          className="btn btn-secondary btn-icon"
          onClick={onToggleActivityDrawer}
          title="Activity Log Drawer"
          style={{ padding: '8px' }}
        >
          <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
        </button>

        <button
          className="btn btn-secondary btn-icon"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle theme"
          style={{ padding: '8px' }}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
