import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INFO_CARDS = [
  { icon: '💻', label: 'Computer Science', desc: 'Algorithms, programming & software engineering' },
  { icon: '📊', label: 'Commerce', desc: 'Accounting, economics & business studies' },
  { icon: '🔬', label: 'Biology', desc: 'Life sciences, genetics & medicine' },
  { icon: '📐', label: 'Mathematics', desc: 'Pure maths, statistics & calculus' },
  { icon: '🎨', label: 'Arts', desc: 'History, literature, fine arts & creative fields' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ background: '#f5f7ff', minHeight: '100vh' }}>
      {/* ── Nav ── */}
      <header className="nav-header">
        <span className="nav-brand">🎓 StreamWise AI</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#4338ca', fontSize: '0.9rem', fontWeight: '500' }}>
            Hi, <strong>{user?.name || 'Student'}</strong>
          </span>
          <button
            className="btn-secondary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>

        {/* ── Welcome card ── */}
        <div className="card mb-3" style={{ background: '#6366f1', border: 'none', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-20px', right: '80px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              Welcome, {user?.name || 'Student'}! 👋
            </h2>
            <p style={{ opacity: 0.88, marginBottom: '1.5rem', fontSize: '0.95rem', maxWidth: '520px' }}>
              Discover your ideal post-10th stream. Set up your subjects &amp; marks, then take the AI-powered aptitude test.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{ background: '#fff', color: '#6366f1', boxShadow: 'none' }}
                onClick={() => navigate('/preferences')}
              >
                ✏️ Update Subjects &amp; Marks
              </button>
              <button
                onClick={() => navigate('/result')}
                style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.6)', color: '#fff', borderRadius: '10px', padding: '0.7rem 1.4rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
              >
                📈 View My Result
              </button>
            </div>
          </div>
        </div>

        {/* ── Single Test CTA ── */}
        <div className="card mb-3" style={{ textAlign: 'center', border: '2px solid #e0e7ff' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🧠</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '0.4rem' }}>
            Aptitude Test
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            A personalised 15-question test based on all the subjects you studied. Our AI will analyse your answers along with your marks to recommend the best stream for you.
          </p>
          <button
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '0.85rem 2.5rem' }}
            onClick={() => navigate('/test')}
          >
            Start Aptitude Test →
          </button>
        </div>

        {/* ── Streams info ── */}
        <h3 style={{ color: '#4338ca', fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Streams we analyse
        </h3>
        <div className="grid grid-5" style={{ gap: '0.75rem' }}>
          {INFO_CARDS.map((s) => (
            <div
              key={s.label}
              className="card"
              style={{ textAlign: 'center', padding: '1.25rem 0.75rem', border: '1px solid #e0e7ff' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <p style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e1b4b', marginBottom: '0.3rem' }}>{s.label}</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.4' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Disclaimer ── */}
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', marginTop: '2rem' }}>
          ℹ️ This AI-based recommendation is for guidance only. Consult an academic counsellor before making final decisions.
        </p>
      </main>
    </div>
  );
}
