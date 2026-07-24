import React from 'react';
import { X, Send, Activity, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ActivityDrawer Component
 * Side drawer panel displaying activity logs, AI updates, and user notes.
 */
export default function ActivityDrawer({
  isOpen,
  onClose,
  activities = [],
  filter,
  setFilter,
  newNote,
  setNewNote,
  onAddNote
}) {
  if (!isOpen) return null;

  const filteredActivities = activities.filter(a => {
    if (filter === 'system') return a.type === 'system' || a.user === 'System Bot';
    if (filter === 'notes') return a.type === 'note' || a.user === 'You';
    return true;
  });

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="activity-drawer-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '380px',
            height: '100vh',
            background: 'var(--glass-bg)',
            borderLeft: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Activity & Log Trace</span>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
            {['all', 'system', 'notes'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`step-tab-btn ${filter === t ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Activity List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
            {filteredActivities.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '13px' }}>
                No activity logs recorded yet.
              </div>
            ) : (
              filteredActivities.map(act => {
                const isHermes = Boolean(act && act.user && typeof act.user === 'string' && act.user.includes('Hermes'));
                const isOpenClaw = Boolean(act && act.user && typeof act.user === 'string' && act.user.includes('OpenClaw'));
                return (
                  <div
                    key={act.id}
                    style={{
                      background: isHermes ? 'rgba(139, 92, 246, 0.06)' : isOpenClaw ? 'rgba(245, 78, 0, 0.06)' : 'var(--bg-surface)',
                      border: isHermes ? '1px solid rgba(139, 92, 246, 0.2)' : isOpenClaw ? '1px solid rgba(245, 78, 0, 0.2)' : '1px solid var(--border-color-soft)',
                      padding: '0.75rem',
                      borderRadius: 'var(--rounded-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isHermes ? '#8B5CF6' : isOpenClaw ? '#F54E00' : 'var(--text-primary)' }}>
                        {isHermes ? <span>🧠</span> : isOpenClaw ? <span>🛠️</span> : act.type === 'system' ? <Terminal size={12} style={{ color: 'var(--accent-primary)' }} /> : null}
                        {act.user}
                      </span>
                      <span style={{ color: 'var(--text-muted-soft)', fontWeight: 400 }}>{act.time}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {act.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Note Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); onAddNote(); }}
            style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color-soft)', display: 'flex', gap: '6px' }}
          >
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, fontSize: '12px' }}
              placeholder="Add sprint note or log entry..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 12px' }}>
              <Send size={14} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
