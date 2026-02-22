import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STREAM_EMOJIS = {
  'Computer Science': '💻',
  'Commerce': '📊',
  'Biology': '🔬',
  'Mathematics': '📐',
  'Arts': '🎨',
};

const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];

export default function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/result/final')
      .then(({ data }) => setResult(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load results.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#f5f7ff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: 52, height: 52, border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: '#4338ca', fontSize: '1.05rem', fontWeight: '600' }}>Analyzing your results with AI…</p>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>This may take a few seconds</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#f5f7ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p className="error-message">{error}</p>
          <button className="btn-primary mt-2" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const { aiAnalysis } = result || {};
  const recommendedStream = aiAnalysis?.recommendedStream || '';
  const explanation = aiAnalysis?.explanation || '';
  const confidencePct = Math.round(aiAnalysis?.confidenceLevel || 0);
  const ranking = aiAnalysis?.streamRanking || [];
  const recEmoji = STREAM_EMOJIS[recommendedStream] || '🎓';

  // Build bar chart from stream ranking (if we have scores, show them; otherwise use ranking position)
  const scores = result?.testResult?.scores || {};
  const unifiedScore = scores.unified;

  const chartData = ranking.length > 0 ? {
    labels: ranking,
    datasets: [{
      label: 'Suitability',
      data: ranking.map((_, i) => Math.max(10, 100 - i * 18)),
      backgroundColor: ranking.map((s) => s === recommendedStream ? '#6366f1' : '#c7d2fe'),
      borderColor: ranking.map((s) => s === recommendedStream ? '#4f46e5' : '#a5b4fc'),
      borderWidth: 2,
      borderRadius: 8,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 110, grid: { color: '#f0f4ff' }, ticks: { display: false } },
      x: { grid: { display: false }, ticks: { font: { size: 12, weight: '600' }, color: '#4338ca' } },
    },
  };

  return (
    <div style={{ background: '#f5f7ff', minHeight: '100vh' }}>
      {/* Nav */}
      <header className="nav-header">
        <span className="nav-brand">🎓 StreamWise AI</span>
        <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      </header>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* ── Recommended Stream Hero ── */}
        <div className="card mb-3" style={{ textAlign: 'center', border: '2px solid #6366f1', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
          <div style={{ marginTop: '0.5rem', fontSize: '4rem' }}>{recEmoji}</div>
          <p style={{ color: '#9ca3af', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.75rem' }}>
            AI Recommended Stream
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1e1b4b', margin: '0.4rem 0 1rem' }}>
            {recommendedStream}
          </h1>

          {/* Aptitude score badge */}
          {unifiedScore !== undefined && unifiedScore > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eef2ff', borderRadius: '999px', padding: '0.4rem 1rem', marginBottom: '1rem' }}>
              <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '0.9rem' }}>🎯 Aptitude Score:</span>
              <span style={{ color: '#1e1b4b', fontWeight: '800', fontSize: '1rem' }}>{unifiedScore}%</span>
            </div>
          )}

          {/* Confidence bar */}
          <div style={{ maxWidth: '340px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: '600' }}>Confidence Level</span>
              <span style={{ fontWeight: '800', color: '#6366f1' }}>{confidencePct}%</span>
            </div>
            <div className="confidence-bar-wrapper">
              <div className="confidence-bar-fill" style={{ width: `${confidencePct}%` }} />
            </div>
          </div>
        </div>

        {/* ── Stream Ranking Bar Chart ── */}
        {chartData && (
          <div className="card mb-3">
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1rem' }}>
              📊 Stream Suitability Ranking
            </h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {/* ── AI Explanation ── */}
        {explanation && (
          <div className="card mb-3" style={{ border: '1px solid #e0e7ff' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '0.75rem' }}>
              🤖 AI Analysis
            </h3>
            <p style={{ color: '#374151', lineHeight: '1.85', fontSize: '0.95rem' }}>{explanation}</p>
          </div>
        )}

        {/* ── Stream Ranking List ── */}
        {ranking.length > 0 && (
          <div className="card mb-3">
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1rem' }}>
              🏆 Stream Rankings
            </h3>
            {ranking.map((streamName, index) => (
              <div
                key={streamName}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.65rem 0', borderBottom: index < ranking.length - 1 ? '1px solid #f0f4ff' : 'none' }}
              >
                <span style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  background: MEDAL_COLORS[index] || '#e0e7ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '800', color: index < 3 ? '#fff' : '#6b7280',
                }}>
                  {index + 1}
                </span>
                <span style={{ fontSize: '1.25rem' }}>{STREAM_EMOJIS[streamName] || '📚'}</span>
                <span style={{ flex: 1, fontWeight: index === 0 ? '800' : '600', color: '#1e1b4b', fontSize: '0.95rem' }}>
                  {streamName}
                </span>
                {index === 0 && (
                  <span style={{ background: '#eef2ff', color: '#6366f1', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.65rem' }}>
                    Best Fit
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Disclaimer ── */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#92400e', fontSize: '0.82rem', textAlign: 'center' }}>
          ℹ️ <strong>Disclaimer:</strong> This AI-based recommendation is for guidance only. Please consult an academic counsellor before making final decisions.
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/test')}>
            🔄 Retake Test
          </button>
          <button className="btn-secondary" onClick={() => navigate('/preferences')}>
            ✏️ Update Subjects & Marks
          </button>
        </div>
      </div>
    </div>
  );
}
