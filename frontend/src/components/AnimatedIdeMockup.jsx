import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, MessageSquare, Play, Pause, RotateCcw, CheckCircle2, Cpu, Terminal, Sparkles, FileCode, Check } from 'lucide-react';

const STEPS_DATA = [
  {
    id: 'step-1',
    fileName: 'Board.jsx',
    agent: 'Hermes',
    agentRole: 'Brain / Planner',
    pillType: 'thinking',
    pillText: 'Thinking',
    chatMessage: 'Analyzing project requirements and planning Kanban board layout & state structure.',
    statusText: 'Hermes formulating blueprint...',
    codeLines: [
      { text: '// Board.jsx - Render Kanban Swimlanes', type: 'comment' },
      { text: "import React, { useState, useEffect } from 'react';", type: 'code' },
      { text: '', type: 'code' },
      { text: 'export default function Board() {', type: 'code' },
      { text: '  const [columns, setColumns] = useState([]);', type: 'code' },
      { text: '  // Scaffolding lanes...', type: 'comment' },
      { text: '}', type: 'code' }
    ]
  },
  {
    id: 'step-2',
    fileName: 'Board.jsx',
    agent: 'OpenClaw',
    agentRole: 'Autonomous Coder',
    pillType: 'edit',
    pillText: 'Editing',
    chatMessage: 'Writing React swimlane renderer, drag-and-drop state, and fetching card metrics.',
    statusText: 'OpenClaw writing Board.jsx...',
    codeLines: [
      { text: '// Board.jsx - Render Kanban Swimlanes', type: 'comment' },
      { text: "import React, { useState, useEffect } from 'react';", type: 'code' },
      { text: "import Swimlane from './Swimlane';", type: 'code' },
      { text: '', type: 'code' },
      { text: 'export default function Board() {', type: 'code' },
      { text: '  const [columns, setColumns] = useState([]);', type: 'code' },
      { text: '  useEffect(() => {', type: 'code' },
      { text: "    fetch('/api/boards').then(res => setColumns(res.data));", type: 'code' },
      { text: '  }, []);', type: 'code' },
      { text: '  return (', type: 'code' },
      { text: '    <div className="board-canvas">', type: 'code' },
      { text: '      {columns.map(col => (<Swimlane key={col.id} col={col} />))}', type: 'code' },
      { text: '    </div>', type: 'code' },
      { text: '  );', type: 'code' },
      { text: '}', type: 'code' }
    ]
  },
  {
    id: 'step-3',
    fileName: 'KanbanController.php',
    agent: 'Hermes',
    agentRole: 'Brain / Planner',
    pillType: 'grep',
    pillText: 'Grep',
    chatMessage: 'OpenClaw, now scaffolding backend API routes & SQLite persistence layer in PHP.',
    statusText: 'Hermes requesting PHP controller...',
    codeLines: [
      { text: '<?php // KanbanController.php', type: 'comment' },
      { text: 'namespace App\\Http\\Controllers;', type: 'code' },
      { text: 'use App\\Models\\Board;', type: 'code' },
      { text: 'use Illuminate\\Http\\Request;', type: 'code' },
      { text: '', type: 'code' },
      { text: 'class KanbanController extends Controller {', type: 'code' },
      { text: '    public function index() {', type: 'code' },
      { text: '        return response()->json(Board::with("cards")->get());', type: 'code' },
      { text: '    }', type: 'code' },
      { text: '}', type: 'code' }
    ]
  },
  {
    id: 'step-4',
    fileName: 'index.css',
    agent: 'OpenClaw',
    agentRole: 'Autonomous Coder',
    pillType: 'edit',
    pillText: 'Editing',
    chatMessage: 'Applying editorial design system, warm cream palette, and glassmorphic variables.',
    statusText: 'OpenClaw refining index.css...',
    codeLines: [
      { text: '/* index.css - Editorial Calm Token System */', type: 'comment' },
      { text: ':root {', type: 'code' },
      { text: '  --accent-primary: #f54e00;  /* Cursor Orange */', type: 'code' },
      { text: '  --bg-app: #f4f4f0;          /* Warm cream canvas */', type: 'code' },
      { text: '  --font-display: "Inter", sans-serif;', type: 'code' },
      { text: '  --glass-bg: rgba(255, 255, 255, 0.96);', type: 'code' },
      { text: '  --timeline-edit: #c0a8dd;     /* Lavender edit */', type: 'code' },
      { text: '}', type: 'code' }
    ]
  },
  {
    id: 'step-5',
    fileName: 'index.css',
    agent: 'System',
    agentRole: 'Build Runner',
    pillType: 'done',
    pillText: 'Done',
    chatMessage: 'Frontend & backend connected cleanly! Live hot reload active. 0 errors.',
    statusText: 'All systems green & verified!',
    codeLines: [
      { text: '/* index.css - Editorial Calm Token System */', type: 'comment' },
      { text: ':root {', type: 'code' },
      { text: '  --accent-primary: #f54e00;  /* Cursor Orange */', type: 'code' },
      { text: '  --bg-app: #f4f4f0;          /* Warm cream canvas */', type: 'code' },
      { text: '  --font-display: "Inter", sans-serif;', type: 'code' },
      { text: '  --glass-bg: rgba(255, 255, 255, 0.96);', type: 'code' },
      { text: '  --timeline-edit: #c0a8dd;     /* Lavender edit */', type: 'code' },
      { text: '}', type: 'code' },
      { text: '/* Build verified cleanly by Hermes & OpenClaw */', type: 'comment' }
    ]
  }
];

export default function AnimatedIdeMockup() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [typedCharCount, setTypedCharCount] = useState(0);
  const [chatHistory, setChatHistory] = useState([STEPS_DATA[0]]);
  
  const step = STEPS_DATA[currentStepIndex];
  
  // Calculate total characters in current step code lines
  const totalStepChars = step.codeLines.reduce((acc, l) => acc + l.text.length + 1, 0);

  // Auto-typing timer logic
  useEffect(() => {
    if (!isPlaying) return;

    const baseDelay = 25 / speedMultiplier; // Typing speed per char
    
    if (typedCharCount < totalStepChars) {
      const timer = setTimeout(() => {
        setTypedCharCount(prev => prev + 1);
      }, baseDelay);
      return () => clearTimeout(timer);
    } else {
      // Finished typing current step, pause slightly then transition to next step
      const stepDelay = setTimeout(() => {
        const nextIndex = (currentStepIndex + 1) % STEPS_DATA.length;
        setCurrentStepIndex(nextIndex);
        setTypedCharCount(0);

        if (nextIndex === 0) {
          // Reset chat history to step 1
          setChatHistory([STEPS_DATA[0]]);
        } else {
          setChatHistory(prev => {
            const nextStepObj = STEPS_DATA[nextIndex];
            if (prev.some(c => c.id === nextStepObj.id)) return prev;
            return [...prev, nextStepObj];
          });
        }
      }, 1800 / speedMultiplier);

      return () => clearTimeout(stepDelay);
    }
  }, [typedCharCount, totalStepChars, isPlaying, currentStepIndex, speedMultiplier]);

  // Jump to specific step via user click
  const handleSelectStep = (idx) => {
    setCurrentStepIndex(idx);
    setTypedCharCount(STEPS_DATA[idx].codeLines.reduce((acc, l) => acc + l.text.length + 1, 0));
    setChatHistory(STEPS_DATA.slice(0, idx + 1));
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setTypedCharCount(0);
    setChatHistory([STEPS_DATA[0]]);
    setIsPlaying(true);
  };

  // Helper to render code line with typing progress
  const renderTypedLines = () => {
    let charCounter = 0;
    let stopCursorAtLineIndex = -1;

    const lines = step.codeLines.map((lineObj, lIdx) => {
      const lineLen = lineObj.text.length + 1;
      const startChar = charCounter;
      const endChar = charCounter + lineLen;
      charCounter = endChar;

      if (typedCharCount >= startChar && typedCharCount <= endChar) {
        stopCursorAtLineIndex = lIdx;
      } else if (typedCharCount > endChar && lIdx === step.codeLines.length - 1) {
        stopCursorAtLineIndex = lIdx;
      }

      let visibleText = '';
      if (typedCharCount >= endChar) {
        visibleText = lineObj.text;
      } else if (typedCharCount > startChar) {
        visibleText = lineObj.text.slice(0, typedCharCount - startChar);
      } else {
        visibleText = '';
      }

      // Syntax highlighting helper
      const formatCodeSpan = (text, type) => {
        if (!text) return null;
        if (type === 'comment') return <span className="code-comment">{text}</span>;

        // Colorize simple keywords
        const keywords = ['import', 'from', 'export', 'default', 'function', 'const', 'return', 'class', 'extends', 'public', 'namespace', 'use', 'if'];
        const parts = text.split(/(\s+|[(){}<>.,;=])/);

        return parts.map((part, pIdx) => {
          if (keywords.includes(part.trim())) {
            return <span key={pIdx} className="code-keyword">{part}</span>;
          }
          if (part.startsWith("'") || part.startsWith('"') || part.includes('className')) {
            return <span key={pIdx} className="code-string">{part}</span>;
          }
          return <span key={pIdx}>{part}</span>;
        });
      };

      return (
        <div key={lIdx} className={`code-line ${stopCursorAtLineIndex === lIdx ? 'code-line-active' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '28px', color: 'var(--text-muted-soft)', fontSize: '11px', userSelect: 'none', textAlign: 'right', paddingRight: '12px' }}>
            {lIdx + 1}
          </span>
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)' }}>
            {formatCodeSpan(visibleText, lineObj.type)}
            {stopCursorAtLineIndex === lIdx && isPlaying && typedCharCount < totalStepChars && (
              <span className="typing-cursor">|</span>
            )}
          </span>
        </div>
      );
    });

    return lines;
  };

  return (
    <div className="ide-mockup-card animated-ide-mockup">
      {/* IDE Top Window Bar */}
      <div className="ide-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="ide-dot" style={{ background: '#ff5f56' }}></div>
          <div className="ide-dot" style={{ background: '#ffbd2e' }}></div>
          <div className="ide-dot" style={{ background: '#27c93f' }}></div>
          <div className="ide-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
            AgileBoard - Cursor IDE Workspace (AI Live Agent Simulation)
          </div>
        </div>

        {/* Animation Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="ide-control-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Animation" : "Play Animation"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
          <button 
            className="ide-control-btn"
            onClick={handleReset}
            title="Reset Simulation"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            className="ide-control-btn"
            onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
            title="Toggle Speed"
            style={{ fontWeight: 600, minWidth: '42px' }}
          >
            {speedMultiplier}x
          </button>
        </div>
      </div>

      {/* Main IDE Workspace Grid */}
      <div className="ide-body">
        {/* Left Sidebar: File Explorer */}
        <div className="ide-sidebar">
          <div className="ide-sidebar-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Project Explorer</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>4 files</span>
          </div>

          <div 
            className={`ide-file ${step.fileName === 'Board.jsx' ? 'active' : ''}`}
            onClick={() => handleSelectStep(0)}
          >
            <FileCode size={14} style={{ color: step.fileName === 'Board.jsx' ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
            <span>Board.jsx</span>
            {step.fileName === 'Board.jsx' && <span className="active-file-indicator" />}
          </div>

          <div 
            className={`ide-file ${step.fileName === 'KanbanController.php' ? 'active' : ''}`}
            onClick={() => handleSelectStep(2)}
          >
            <Code size={14} style={{ color: step.fileName === 'KanbanController.php' ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
            <span>KanbanController.php</span>
            {step.fileName === 'KanbanController.php' && <span className="active-file-indicator" />}
          </div>

          <div 
            className={`ide-file ${step.fileName === 'index.css' ? 'active' : ''}`}
            onClick={() => handleSelectStep(3)}
          >
            <Code size={14} style={{ color: step.fileName === 'index.css' ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
            <span>index.css</span>
            {step.fileName === 'index.css' && <span className="active-file-indicator" />}
          </div>

          <div className="ide-file">
            <Code size={14} style={{ color: 'var(--text-muted)' }} />
            <span>README.md</span>
          </div>

          {/* Active AI Agent Indicator Widget */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color-soft)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.88px', marginBottom: '8px' }}>
              Active Agent Status
            </div>
            <div className="agent-status-card">
              <div className="agent-status-avatar">
                {step.agent === 'Hermes' ? <Cpu size={14} /> : step.agent === 'OpenClaw' ? <Terminal size={14} /> : <CheckCircle2 size={14} />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {step.agent}
                  <span className="live-dot" />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {step.agentRole}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Auto-Typing Code Editor */}
        <div className="ide-editor">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              <FileCode size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>{step.fileName}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-indicator" />
              <span>{step.statusText}</span>
            </div>
          </div>

          <div className="code-editor-viewport" style={{ flex: 1 }}>
            {renderTypedLines()}
          </div>
        </div>

        {/* Right Sidebar: AI Agent Chat */}
        <div className="ide-chat-panel">
          <div className="ide-chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={12} />
              <span>AI Agent Chat</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{chatHistory.length} events</span>
          </div>

          <div className="ide-chat-messages">
            <AnimatePresence initial={false}>
              {chatHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="chat-message"
                >
                  <div className="chat-sender" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`agent-badge-icon agent-badge-${item.agent.toLowerCase()}`}>
                        {item.agent === 'Hermes' ? <Cpu size={12} style={{ color: 'var(--accent-primary)' }} /> : item.agent === 'OpenClaw' ? <Terminal size={12} style={{ color: 'var(--timeline-edit)' }} /> : <CheckCircle2 size={12} style={{ color: 'var(--accent-success)' }} />}
                      </span>
                      {item.agent}
                    </span>
                    <span className={`timeline-pill timeline-pill-${item.pillType}`}>
                      {item.pillText}
                    </span>
                  </div>
                  <div className="chat-bubble" style={{ fontSize: '12px', lineHeight: '1.45' }}>
                    {item.chatMessage}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat bottom live typing indicator */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color-soft)', background: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isPlaying ? (
                <>
                  <span className="live-dot-wave"></span>
                  <span><strong>{step.agent}</strong> is active...</span>
                </>
              ) : (
                <span>Animation paused</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IDE Bottom Controls & Step Navigation Bar */}
      <div className="ide-footer-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SIMULATION STAGES:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {STEPS_DATA.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleSelectStep(idx)}
                className={`step-tab-btn ${currentStepIndex === idx ? 'active' : ''}`}
              >
                {idx + 1}. {s.fileName}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={12} style={{ color: 'var(--accent-success)' }} />
          <span>Laravel + SQLite store linked</span>
        </div>
      </div>
    </div>
  );
}
