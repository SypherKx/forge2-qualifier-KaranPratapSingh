import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, MessageSquare, Terminal, Play, Pause, RefreshCw } from 'lucide-react';

const fileSnippets = {
  'Board.jsx': `// Board.jsx - Render Kanban Lanes
import React, { useState, useEffect } from 'react';

export default function Board() {
  const [columns, setColumns] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  return (
    <div className="board-canvas">
      {columns.map(col => (
        <Swimlane key={col.id} data={col} />
      ))}
    </div>
  );
}`,
  'KanbanController.php': `<?php
// KanbanController.php - Laravel API Controller
namespace App\\Http\\Controllers;
use App\\Models\\Board;
use Illuminate\\Http\\Request;

class KanbanController extends Controller {
    public function getBoards() {
        return response()->json(Board::with('lists.cards')->get());
    }

    public function storeCard(Request $req) {
        $card = Card::create($req->validated());
        return response()->json($card, 201);
    }
}`,
  'index.css': `/* index.css - Cursor IDE Theme Tokens */
:root {
  --font-sans: 'Inter', sans-serif;
  --accent-primary: #f54e00;
  --bg-surface: #ffffff;
  --text-primary: #0f172a;
  --glass-bg: rgba(255, 255, 255, 0.96);
}

.kanban-card {
  border-radius: 12px;
  backdrop-filter: blur(16px);
  transition: transform 0.15s ease;
}`,
  'README.md': `# AgileBoard v2.0 - Agentic Workspace
High-performance Kanban system built with:
- React 19 + Vite frontend
- Laravel 11 + SQLite backend
- Hermes & OpenClaw AI Agents`
};

export default function AgenticIdeMockup({ autoPlay = true }) {
  const [activeFile, setActiveFile] = useState('Board.jsx');
  const [charIndex, setCharIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const fullCode = fileSnippets[activeFile] || '';

  // Auto-typing character loop
  useEffect(() => {
    if (!isPlaying) return;

    if (charIndex < fullCode.length) {
      const speed = fullCode[charIndex] === '\n' ? 80 : 22;
      const timer = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // Loop or pause after finishing
      const timer = setTimeout(() => {
        // Cycle to next file automatically for agentic demo effect
        const files = Object.keys(fileSnippets);
        const nextIdx = (files.indexOf(activeFile) + 1) % files.length;
        setActiveFile(files[nextIdx]);
        setCharIndex(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [charIndex, isPlaying, activeFile, fullCode]);

  const handleSelectFile = (file) => {
    setActiveFile(file);
    setCharIndex(0);
    setIsPlaying(true);
  };

  const currentTypedText = fullCode.substring(0, charIndex);
  const codeLines = currentTypedText.split('\n');

  // Basic syntax colorizer helper
  const renderFormattedLine = (line) => {
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith(' *') || line.startsWith('#')) {
      return <span style={{ color: '#6a9955', fontStyle: 'italic' }}>{line}</span>;
    }

    // Highlighting key words
    const parts = line.split(/(\s+|<[^>]+>|'[^']+'|"[^"]+"|\{|\}|\(|\)|=>|;)/);
    return parts.map((part, idx) => {
      if (['import', 'export', 'default', 'function', 'const', 'return', 'class', 'public', 'namespace', 'use', 'from', 'namespace'].includes(part)) {
        return <span key={idx} style={{ color: '#c586c0', fontWeight: '600' }}>{part}</span>;
      }
      if (['React', 'useState', 'useEffect', 'Board', 'KanbanController', 'Controller', 'Request', 'Response'].includes(part)) {
        return <span key={idx} style={{ color: '#4ec9b0' }}>{part}</span>;
      }
      if (['true', 'false', 'null'].includes(part)) {
        return <span key={idx} style={{ color: '#569cd6' }}>{part}</span>;
      }
      if (part.startsWith("'") || part.startsWith('"')) {
        return <span key={idx} style={{ color: '#ce9178' }}>{part}</span>;
      }
      if (part.startsWith('<') && part.endsWith('>')) {
        return <span key={idx} style={{ color: '#569cd6' }}>{part}</span>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="ide-mockup-card" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color-strong)' }}>
      {/* IDE Header */}
      <div className="ide-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="ide-dot" style={{ backgroundColor: '#ff5f56' }}></div>
          <div className="ide-dot" style={{ backgroundColor: '#ffbd2e' }}></div>
          <div className="ide-dot" style={{ backgroundColor: '#27c93f' }}></div>
          <div className="ide-title" style={{ marginLeft: '12px', fontSize: '13px' }}>
            AgileBoard - Cursor IDE Workspace ({activeFile})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingRight: '8px' }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
            title={isPlaying ? 'Pause auto-typing' : 'Play auto-typing'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'TYPING...' : 'PAUSED'}</span>
          </button>
          <button 
            onClick={() => setCharIndex(0)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title="Restart typing animation"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="ide-body">
        {/* Project Explorer Sidebar */}
        <div className="ide-sidebar">
          <div className="ide-sidebar-title" style={{ textTransform: 'uppercase', letterSpacing: '0.88px', fontSize: '10px', color: 'var(--text-muted)' }}>
            Project Explorer
          </div>
          {Object.keys(fileSnippets).map(fileName => (
            <div 
              key={fileName} 
              className={`ide-file ${activeFile === fileName ? 'active' : ''}`}
              onClick={() => handleSelectFile(fileName)}
              style={{ cursor: 'pointer' }}
            >
              <Code size={14} /> {fileName}
            </div>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color-soft)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isPlaying ? '#10b981' : '#f59e0b', animation: isPlaying ? 'pulse 1.5s infinite' : 'none' }} />
            <span>{isPlaying ? 'Agentic Typing' : 'Idle'}</span>
          </div>
        </div>

        {/* Real-time Code Typing Editor */}
        <div className="ide-editor" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6', position: 'relative' }}>
          {codeLines.map((lineText, idx) => (
            <div key={idx} className="code-line" style={{ display: 'flex' }}>
              <span style={{ width: '28px', color: 'var(--text-muted)', userSelect: 'none', opacity: 0.5, fontSize: '11px', textAlign: 'right', paddingRight: '12px' }}>
                {idx + 1}
              </span>
              <span style={{ flex: 1 }}>
                {renderFormattedLine(lineText)}
                {idx === codeLines.length - 1 && (
                  <span 
                    className="blinking-cursor" 
                    style={{ 
                      display: 'inline-block', 
                      width: '8px', 
                      height: '15px', 
                      backgroundColor: 'var(--accent-primary)', 
                      marginLeft: '2px', 
                      verticalAlign: 'middle',
                      animation: 'blink 0.9s infinite'
                    }} 
                  />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* AI Agent Chat Panel */}
        <div className="ide-chat-panel">
          <div className="ide-chat-header" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.88px' }}>
            <MessageSquare size={12} style={{ marginRight: '6px' }} /> AI Agent Chat
          </div>
          <div className="ide-chat-messages">
            <div className="chat-message">
              <div className="chat-sender">
                Hermes <span className="timeline-pill timeline-pill-thinking">THINKING</span>
              </div>
              <div className="chat-bubble">
                Let's scaffold the Kanban database. I will declare migration steps for Boards, Lists, and Cards.
              </div>
            </div>
            <div className="chat-message">
              <div className="chat-sender">
                OpenClaw <span className="timeline-pill timeline-pill-edit">EDITING</span>
              </div>
              <div className="chat-bubble">
                Scaffolding complete. Writing React state logic & API endpoints in {activeFile}.
              </div>
            </div>
            <div className="chat-message">
              <div className="chat-sender">
                System <span className="timeline-pill timeline-pill-done">DONE</span>
              </div>
              <div className="chat-bubble">
                Vite frontend connected to Laravel API endpoint successfully.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
