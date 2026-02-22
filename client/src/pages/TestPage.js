import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TestPage() {
  const { stream } = useParams(); // undefined when route is /test (unified)
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Use unified endpoint when no stream param
      const endpoint = stream ? `/test/generate/${stream}` : '/test/generate';
      const { data } = await api.get(endpoint);
      setQuestions(data.questions || data);
      setAnswers({});
      setCurrentIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [stream]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((_, i) => answers[i] === undefined);
    if (unanswered.length > 0) {
      return setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
    }
    setSubmitting(true);
    setError('');
    try {
      const userAnswers = questions.map((_, i) => answers[i]);
      const correctAnswers = questions.map((q) => q.correctAnswer);
      const streamKey = stream || 'unified';
      await api.post('/test/submit', { stream: streamKey, userAnswers, correctAnswers });
      navigate('/result');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
  const currentQuestion = questions[currentIndex];

  if (loading) {
    return (
      <div style={{ background: '#f5f7ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ width: 56, height: 56, border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: '#4338ca', fontSize: '1.05rem', fontWeight: '600' }}>
          {stream ? `Generating ${stream} questions…` : 'Generating your personalised aptitude test…'}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>This may take a few seconds</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div style={{ background: '#f5f7ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p className="error-message">{error}</p>
          <button className="btn-primary mt-2" onClick={fetchQuestions}>Try Again</button>
          <button className="btn-secondary mt-2" style={{ marginLeft: '0.75rem' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f7ff', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header className="nav-header">
        <div>
          <span className="nav-brand">🧠 Aptitude Test</span>
          <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
            Question {currentIndex + 1} of {total}
          </span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '8px', padding: '0.45rem 1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}
        >
          ✕ Exit
        </button>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* ── Progress ── */}
        <div className="card mb-3" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            <span>{answered} of {total} answered</span>
            <span>{progress}% complete</span>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* ── Question Card ── */}
        {currentQuestion && (
          <div className="card mb-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#eef2ff', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                Question {currentIndex + 1}
              </span>
              {currentQuestion.subject && (
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500', background: '#f5f7ff', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                  {currentQuestion.subject}
                </span>
              )}
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1e1b4b', marginBottom: '1.25rem', lineHeight: '1.7' }}>
              {currentQuestion.question}
            </p>

            <div>
              {(currentQuestion.options || []).map((option, optIdx) => (
                <label
                  key={optIdx}
                  className={`radio-option${answers[currentIndex] === optIdx ? ' selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    value={optIdx}
                    checked={answers[currentIndex] === optIdx}
                    onChange={() => handleAnswer(currentIndex, optIdx)}
                    style={{ marginTop: '2px' }}
                  />
                  <span style={{ fontSize: '0.95rem', color: '#374151' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <div className="error-message mb-2">{error}</div>}

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  fontSize: '0.68rem', fontWeight: '700', transition: 'all 0.15s',
                  background: i === currentIndex ? '#6366f1' : answers[i] !== undefined ? '#c7d2fe' : '#e0e7ff',
                  color: i === currentIndex ? '#fff' : answers[i] !== undefined ? '#4338ca' : '#9ca3af',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < total - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            >
              Next →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <span className="loading-spinner light" /> : 'Submit Test ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
