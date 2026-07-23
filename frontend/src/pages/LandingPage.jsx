import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Zap, Users, Shield, ArrowRight, Code, MessageSquare, Terminal, Sun, Moon } from 'lucide-react';
import AnimatedIdeMockup from '../components/AnimatedIdeMockup';

export default function LandingPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('dark-mode', darkMode);
  }, [darkMode]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="landing-container">
      {/* Top Navigation */}
      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-logo">AgileBoard</span>
          <span className="brand-tag">v2.0</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => navigate('/board')}>Workspace</span>
          <a href="#features" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
          <a href="#timeline" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Origin</a>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {darkMode ? <Sun size={16} style={{ color: 'var(--text-primary)' }} /> : <Moon size={16} style={{ color: 'var(--text-primary)' }} />}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/board')}>
            Go to Workspace
          </button>
        </div>
      </nav>

      <main className="landing-main">
        {/* Hero Section */}
        <motion.div 
          className="hero-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-badge" variants={itemVariants}>
            ✨ Agentic Build Qualifier Edition
          </motion.div>
          <motion.h1 className="hero-title" variants={itemVariants}>
            Orchestrate your work with <br/>
            <span className="text-gradient">editorial calm.</span>
          </motion.h1>
          <motion.p className="hero-subtitle" variants={itemVariants}>
            A quiet, high-performance Kanban board designed for developers who value clarity and order over IDE-darkness. Engineered by autonomous agents, backed by Laravel and SQLite.
          </motion.p>
          <motion.div className="hero-cta" variants={itemVariants}>
            <button className="btn btn-primary btn-large" onClick={() => navigate('/board')}>
              Open Workspace <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-large" onClick={() => {
              const el = document.getElementById('timeline');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              View AI Blueprint
            </button>
          </motion.div>
        </motion.div>

        {/* IDE Mockup Section - Live Animated Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ width: '100%', maxWidth: '1000px', margin: '40px auto 0 auto' }}
        >
          <AnimatedIdeMockup />
        </motion.div>

        {/* Features Section */}
        <section id="features" style={{ paddingTop: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '400', letterSpacing: '-0.72px', color: 'var(--text-primary)' }}>Designed for developer discipline</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Premium functionality with a clean, distraction-free interface.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><LayoutDashboard size={20} /></div>
              <h3>Fluid Swimlanes</h3>
              <p>Drag and drop tasks effortlessly across beautifully designed, responsive columns with zero layout shift or delay.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Users size={20} /></div>
              <h3>Team Sync</h3>
              <p>Assign members, track responsibilities, and use clean text avatars to show who is responsible for what instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Zap size={20} /></div>
              <h3>AI Scaffolded</h3>
              <p>Built from the ground up utilizing autonomous AI agents (Hermes & OpenClaw) wired through Slack workspace sockets.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Shield size={20} /></div>
              <h3>Enterprise Foundations</h3>
              <p>Backed by a robust REST API written in Laravel, configured to scale from local SQLite database files to enterprise PostgreSQL.</p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section id="timeline" className="timeline-section" style={{ paddingTop: '40px' }}>
          <div className="timeline-header">
            <h2 style={{ fontSize: '36px', fontWeight: '400', letterSpacing: '-0.72px', color: 'var(--text-primary)' }}>AI-Timeline Blueprint</h2>
            <p style={{ color: 'var(--text-secondary)' }}>How the agents planned, evaluated, and compiled this application.</p>
          </div>
          <div className="timeline-container">
            <div className="timeline-item">
              <div className="timeline-item-dot"></div>
              <div className="timeline-item-meta">
                <span className="timeline-pill timeline-pill-thinking">Thinking</span>
                <span className="timeline-item-title">Hermes - Brain Planning</span>
              </div>
              <p className="timeline-item-desc">
                Formulates project steps: database schemas, relationships, routes, and glassmorphic frontend structure. Dispatches execution tasks to OpenClaw.
              </p>
            </div>
            <div className="timeline-item">
              <div className="timeline-item-dot"></div>
              <div className="timeline-item-meta">
                <span className="timeline-pill timeline-pill-grep">Grep</span>
                <span className="timeline-item-title">OpenClaw - Structure Search</span>
              </div>
              <p className="timeline-item-desc">
                Scans backend config files, directory structures, and environment settings to prepare scaffolding.
              </p>
            </div>
            <div className="timeline-item">
              <div className="timeline-item-dot"></div>
              <div className="timeline-item-meta">
                <span className="timeline-pill timeline-pill-read">Read</span>
                <span className="timeline-item-title">OpenClaw - Source Validation</span>
              </div>
              <p className="timeline-item-desc">
                Reads the composer.json, package.json, and PHP setup scripts to align execution dependencies and library versions.
              </p>
            </div>
            <div className="timeline-item">
              <div className="timeline-item-dot"></div>
              <div className="timeline-item-meta">
                <span className="timeline-pill timeline-pill-edit">Edit</span>
                <span className="timeline-item-title">OpenClaw - Code Generation</span>
              </div>
              <p className="timeline-item-desc">
                Writes models, migrations, `KanbanController`, routing files, React pages, and CSS tokens.
              </p>
            </div>
            <div className="timeline-item">
              <div className="timeline-item-dot"></div>
              <div className="timeline-item-meta">
                <span className="timeline-pill timeline-pill-done">Done</span>
                <span className="timeline-item-title">Hermes - Compilation & Test</span>
              </div>
              <p className="timeline-item-desc">
                Runs database seeders, compiles production bundles, runs unit tests, and validates local servers.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing / Details Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingTop: '40px' }} className="features-grid">
          <div className="detail-card">
            <h3 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-primary)' }} className="detail-title">SQLite Mode</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }} className="detail-desc">
              Perfect for local development. Runs entirely off a single file inside the Laravel database folder. Zero setup required.
            </p>
          </div>
          <div className="detail-card detail-card-featured">
            <h3 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '1rem' }} className="detail-title">Postgres Mode</h3>
            <p style={{ color: 'var(--bg-surface-soft)', lineHeight: '1.6' }} className="detail-desc">
              Ready for production environments. Features containerized scaling, Docker setups, and persistent cloud execution pipelines.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="footer-column">
            <div className="footer-column-title">Product</div>
            <a href="#" className="footer-link">Features</a>
            <a href="#" className="footer-link">Security</a>
            <a href="#" className="footer-link">Pricing</a>
            <a href="#" className="footer-link">Localhost</a>
          </div>
          <div className="footer-column">
            <div className="footer-column-title">Resources</div>
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Changelog</a>
            <a href="#" className="footer-link">API Reference</a>
            <a href="#" className="footer-link">GitHub</a>
          </div>
          <div className="footer-column">
            <div className="footer-column-title">Company</div>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Press Kit</a>
          </div>
          <div className="footer-column">
            <div className="footer-column-title">Support</div>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">Contact Support</a>
            <a href="#" className="footer-link">Developer Forum</a>
            <a href="#" className="footer-link">Status Page</a>
          </div>
          <div className="footer-column">
            <div className="footer-column-title">AgileBoard</div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Built for the Forge 2 Qualifier.<br />
              Designed by Karan Pratap Singh.
            </span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color-soft)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span>&copy; {new Date().getFullYear()} AgileBoard. All rights reserved.</span>
          <span>Designed with Editorial Calm</span>
        </div>
      </footer>
    </div>
  );
}
