import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STREAM_LABELS = {
  computerScience: 'Computer Science',
  commerce: 'Commerce',
  biology: 'Biology',
  maths: 'Mathematics',
  arts: 'Arts',
};

export default function TestPage() {
  const { stream } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex (0-3) }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/test/generate/${stream}`);
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
    const unanswered = questions.filter((_, i) => !answers[i]);
    if (unanswered.length > 0) {
      return setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
    }
    setSubmitting(true);
    setError('');
    try {
      const userAnswers = questions.map((_, i) => answers[i]);
      const correctAnswers = questions.map((q) => q.correctAnswer);
      await api.post('/test/submit', { stream, userAnswers, correctAnswers });
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
      <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <span className="loading-spinner" style={{ width: 48, height: 48, borderWidth: 5 }} />
        <p style={{ color: '#fff', fontSize: '1.1rem' }}>Generating questions for {STREAM_LABELS[stream] || stream}...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p className="error-message">{error}</p>
          <button className="btn-primary mt-2" onClick={fetchQuestions}>Retry</button>
          <button className="btn-secondary mt-2" style={{ marginLeft: '0.75rem' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700' }}>
              {STREAM_LABELS[stream] || stream} Test
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
              Question {currentIndex + 1} of {total}
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            ✕ Exit
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <span>{answered} of {total} answered</span>
            <span>{progress}% complete</span>
          </div>
          <div className="progress-bar-wrapper" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%`, background: '#fff' }} />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="card mb-2">
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Question {currentIndex + 1}
            </p>
            <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#222', marginBottom: '1.25rem', lineHeight: '1.6' }}>
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
                  <span style={{ fontSize: '0.95rem', color: '#333' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <div className="error-message mb-2">{error}</div>}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  fontSize: '0.7rem', fontWeight: '700',
                  background: i === currentIndex ? '#fff' : answers[i] ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                  color: i === currentIndex ? '#667eea' : answers[i] ? '#667eea' : '#fff',
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
              {submitting ? <span className="loading-spinner" /> : 'Submit Test'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
