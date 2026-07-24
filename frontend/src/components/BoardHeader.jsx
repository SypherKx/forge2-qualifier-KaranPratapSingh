import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Sun, Moon, Play, Terminal, Search, Filter, Trash2, Zap, Sparkles } from 'lucide-react';

/**
 * BoardHeader Component
 * Two-row workspace header: Row 1 = Brand + Board Actions, Row 2 = Search & Filters
 */
export default function BoardHeader({
  boards = [],
  selectedBoardId,
  onSelectBoard,
  onOpenBoardModal,
  onOpenListModal,
  onSeedDemo,
  onTriggerAgentStep,
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
    <header
      className="app-header"
      style={{
        height: 'auto',
        padding: '0',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '0'
      }}
    >
      {/* ─── ROW 1: Brand + Board Selector + Primary Actions ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.6rem 1.5rem',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color-soft)',
          minHeight: '48px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Back + Brand + Agent Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => navigate('/')}
            title="Back to Landing Page"
            style={{ padding: '6px' }}
          >
            <ArrowLeft size={15} />
          </button>
          <span className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
            AgileBoard
          </span>
          <span className="brand-tag" style={{ fontSize: '0.6rem' }}>Workspace</span>

          {/* Agent Sync Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '14px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              fontSize: '10px',
              fontWeight: '600',
              color: '#8B5CF6',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span
              style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#10B981', display: 'inline-block',
                boxShadow: '0 0 6px #10B981', animation: 'pulse 1.5s infinite'
              }}
            />
            <Sparkles size={10} />
            <span>Hermes & OpenClaw Active</span>
          </div>
        </div>

        {/* Center: Board Selector + Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <select
            className="select-dropdown"
            value={selectedBoardId || ''}
            onChange={(e) => onSelectBoard(parseInt(e.target.value))}
            style={{ fontSize: '12px', height: '32px', minWidth: '120px' }}
          >
            {boards.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={onOpenBoardModal} style={{ fontSize: '11px', padding: '5px 10px', whiteSpace: 'nowrap' }}>
            <Plus size={12} /> New Board
          </button>

          <button className="btn btn-secondary" onClick={onOpenListModal} style={{ fontSize: '11px', padding: '5px 10px', whiteSpace: 'nowrap' }}>
            <Plus size={12} /> Add Column
          </button>

          <button
            className="btn btn-primary"
            onClick={onSeedDemo}
            disabled={seeding}
            style={{ fontSize: '11px', padding: '5px 10px', whiteSpace: 'nowrap' }}
          >
            <Play size={12} /> {seeding ? 'Seeding...' : 'Seed Demo Board'}
          </button>

          {onTriggerAgentStep && (
            <button
              className="btn btn-secondary"
              onClick={onTriggerAgentStep}
              title="Run next agent step"
              style={{
                fontSize: '11px', padding: '5px 10px',
                borderColor: 'rgba(245, 78, 0, 0.4)',
                color: 'var(--accent-primary)',
                background: 'rgba(245, 78, 0, 0.06)',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              <Zap size={12} /> Run Agent Step
            </button>
          )}

          {selectedBoardId && (
            <button
              className="btn btn-danger btn-icon"
              onClick={() => onDeleteBoard(selectedBoardId)}
              title="Delete Current Board"
              style={{ padding: '5px 7px' }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Right: Activity + Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, marginLeft: 'auto' }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={onToggleActivityDrawer}
            title="Activity Log"
            style={{ padding: '6px' }}
          >
            <Terminal size={14} style={{ color: 'var(--accent-primary)' }} />
          </button>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            style={{ padding: '6px' }}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* ─── ROW 2: Search & Filters ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.45rem 1.5rem',
          gap: '0.5rem',
          flexWrap: 'wrap',
          minHeight: '38px'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={13} style={{ position: 'absolute', left: '9px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '28px', paddingRight: '8px', height: '30px', fontSize: '11px', width: '150px' }}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tag Filter */}
        <select
          className="form-select"
          style={{ height: '30px', fontSize: '11px', padding: '0 6px' }}
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
          style={{ height: '30px', fontSize: '11px', padding: '0 6px' }}
          value={selectedMemberFilter}
          onChange={(e) => setSelectedMemberFilter(e.target.value)}
        >
          <option value="">All Members</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Overdue Filter */}
        <button
          className={`step-tab-btn ${filterOverdueOnly ? 'active' : ''}`}
          style={{ height: '30px', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
          onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
        >
          <Filter size={11} /> Overdue
        </button>
      </div>
    </header>
  );
}
