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

const STREAM_LABELS = {
  computerScience: 'Computer Science',
  commerce: 'Commerce',
  biology: 'Biology',
  maths: 'Mathematics',
  arts: 'Arts',
};

const STREAM_EMOJIS = {
  computerScience: '💻',
  commerce: '📊',
  biology: '🔬',
  maths: '📐',
  arts: '🎨',
};

const STREAM_COLORS = {
  computerScience: '#4f46e5',
  commerce: '#0891b2',
  biology: '#16a34a',
  maths: '#d97706',
  arts: '#db2777',
};

export default function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get('/result/final');
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, []);

  if (loading) {
    return (
      <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <span className="loading-spinner" style={{ width: 48, height: 48, borderWidth: 5 }} />
        <p style={{ color: '#fff', fontSize: '1.1rem' }}>Analyzing your results with AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p className="error-message">{error}</p>
          <button className="btn-primary mt-2" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const { testResult, aiAnalysis } = result || {};
  const recommendedStream = aiAnalysis?.recommendedStream;
  const scores = testResult?.scores || {};
  const explanation = aiAnalysis?.explanation;
  const confidencePct = Math.round(aiAnalysis?.confidenceLevel || 0);
  const ranking = aiAnalysis?.streamRanking || [];

  const recColor = STREAM_COLORS[recommendedStream] || '#667eea';

  const chartData = {
    labels: Object.keys(scores).map((k) => STREAM_LABELS[k] || k),
    datasets: [
      {
        label: 'Score',
        data: Object.values(scores),
        backgroundColor: Object.keys(scores).map((k) =>
          k === recommendedStream ? recColor : `${recColor}55`
        ),
        borderColor: Object.keys(scores).map((k) =>
          k === recommendedStream ? recColor : `${recColor}99`
        ),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: '#f0f0f0' },
        ticks: { font: { size: 12 } },
      },
      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
    },
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Recommended Stream Card */}
        <div className="card mb-3" style={{ textAlign: 'center', border: `3px solid ${recColor}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: recColor }} />
          <div style={{ fontSize: '3.5rem', marginTop: '0.5rem' }}>{STREAM_EMOJIS[recommendedStream] || '🎓'}</div>
          <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.75rem' }}>
            AI Recommended Stream
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: recColor, margin: '0.5rem 0' }}>
            {STREAM_LABELS[recommendedStream] || recommendedStream}
          </h1>

          {/* Confidence */}
          <div style={{ maxWidth: '320px', margin: '0.75rem auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777', marginBottom: '0.3rem' }}>
              <span>Confidence Level</span>
              <span style={{ fontWeight: '700', color: '#27ae60' }}>{confidencePct}%</span>
            </div>
            <div className="confidence-bar-wrapper">
              <div className="confidence-bar-fill" style={{ width: `${confidencePct}%` }} />
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        {Object.keys(scores).length > 0 && (
          <div className="card mb-3">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#333' }}>📊 Stream Score Comparison</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {/* AI Explanation */}
        {explanation && (
          <div className="card mb-3">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#333' }}>🤖 AI Analysis</h3>
            <p style={{ color: '#555', lineHeight: '1.8', fontSize: '0.95rem' }}>{explanation}</p>
          </div>
        )}

        {/* Stream Ranking */}
        {ranking.length > 0 && (
          <div className="card mb-3">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#333' }}>�� Stream Rankings</h3>
            {ranking.map((item, index) => {
              const streamKey = typeof item === 'string' ? item : item.stream;
              const streamScore = typeof item === 'object' ? item.score : scores[streamKey];
              const color = STREAM_COLORS[streamKey] || '#667eea';
              return (
                <div key={streamKey} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: index < ranking.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                    {index + 1}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>{STREAM_EMOJIS[streamKey] || '📚'}</span>
                  <span style={{ flex: 1, fontWeight: '600', color: '#333' }}>{STREAM_LABELS[streamKey] || streamKey}</span>
                  {streamScore !== undefined && (
                    <span style={{ fontWeight: '700', color, fontSize: '0.9rem' }}>{Math.round(streamScore)}%</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem', textAlign: 'center' }}>
          ℹ️ <strong>Disclaimer:</strong> This AI-based recommendation is for guidance only. Please consult with academic counsellors before making final decisions.
        </div>

        {/* Actions */}
        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ background: '#fff', color: '#667eea' }} onClick={() => navigate('/dashboard')}>
            🔄 Take Another Test
          </button>
          <button className="btn-secondary" style={{ borderColor: '#fff', color: '#fff' }} onClick={() => navigate('/preferences')}>
            ✏️ Update Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
