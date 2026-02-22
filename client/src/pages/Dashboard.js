import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STREAMS = [
  {
    key: 'computerScience',
    emoji: '💻',
    name: 'Computer Science',
    description: 'Algorithms, programming, data structures, and software engineering.',
    color: '#4f46e5',
  },
  {
    key: 'commerce',
    emoji: '📊',
    name: 'Commerce',
    description: 'Accounting, economics, business studies, and finance.',
    color: '#0891b2',
  },
  {
    key: 'biology',
    emoji: '🔬',
    name: 'Biology',
    description: 'Life sciences, human anatomy, genetics, and medicine.',
    color: '#16a34a',
  },
  {
    key: 'maths',
    emoji: '📐',
    name: 'Mathematics',
    description: 'Pure math, statistics, calculus, and quantitative reasoning.',
    color: '#d97706',
  },
  {
    key: 'arts',
    emoji: '🎨',
    name: 'Arts',
    description: 'History, literature, philosophy, fine arts, and creative fields.',
    color: '#db2777',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <header className="nav-header">
        <span className="nav-brand">�� StreamWise AI</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#fff', fontSize: '0.9rem' }}>
            Hi, <strong>{user?.name || 'Student'}</strong>
          </span>
          <button className="btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', padding: '0.4rem 1rem', fontSize: '0.875rem' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Welcome Banner */}
        <div className="card mb-3" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', color: '#fff' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name || 'Student'}! 👋
          </h2>
          <p style={{ opacity: 0.9, marginBottom: '1.25rem' }}>
            Take an aptitude test to discover your ideal academic stream, or update your preferences.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ background: '#fff', color: '#667eea' }} onClick={() => navigate('/preferences')}>
              ✏️ Enter Marks
            </button>
            <button className="btn-secondary" style={{ borderColor: '#fff', color: '#fff' }} onClick={() => navigate('/result')}>
              📈 View Results
            </button>
          </div>
        </div>

        {/* Stream Cards */}
        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
          Choose a Stream — Take the Aptitude Test
        </h3>
        <div className="grid grid-5" style={{ gap: '1.25rem' }}>
          {STREAMS.map((stream) => (
            <div key={stream.key} className="card" style={{ textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{stream.emoji}</div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: stream.color, marginBottom: '0.5rem' }}>
                {stream.name}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', lineHeight: '1.5' }}>
                {stream.description}
              </p>
              <button
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', width: '100%' }}
                onClick={() => navigate(`/test/${stream.key}`)}
              >
                Take Test
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
