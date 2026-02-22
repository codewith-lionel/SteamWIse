import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ALL_SUBJECTS = [
  { key: 'mathematics', label: 'Mathematics', icon: '📐' },
  { key: 'science', label: 'Science', icon: '⚗️' },
  { key: 'physics', label: 'Physics', icon: '⚡' },
  { key: 'chemistry', label: 'Chemistry', icon: '🧪' },
  { key: 'biology', label: 'Biology', icon: '🔬' },
  { key: 'english', label: 'English', icon: '📚' },
  { key: 'hindi', label: 'Hindi', icon: '🗣️' },
  { key: 'socialStudies', label: 'Social Studies', icon: '🌍' },
  { key: 'history', label: 'History', icon: '🏛️' },
  { key: 'geography', label: 'Geography', icon: '🗺️' },
  { key: 'economics', label: 'Economics', icon: '📊' },
  { key: 'computerScience', label: 'Computer Science', icon: '💻' },
  { key: 'accountancy', label: 'Accountancy', icon: '🧾' },
  { key: 'arts', label: 'Arts & Drawing', icon: '🎨' },
  { key: 'physicalEducation', label: 'Physical Education', icon: '🏃' },
  { key: 'music', label: 'Music', icon: '🎵' },
];

const INTERESTS = [
  'Technology', 'Business', 'Medicine', 'Research',
  'Creative Arts', 'Engineering', 'Finance', 'Teaching',
];

export default function Preferences() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSubject = (key) => {
    setSelectedSubjects((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
    setError('');
  };

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const goToStep2 = () => {
    if (selectedSubjects.length < 3) {
      return setError('Please select at least 3 subjects you studied.');
    }
    setError('');
    setStep(2);
  };

  const validate = () => {
    for (const key of selectedSubjects) {
      const val = Number(marks[key]);
      const subj = ALL_SUBJECTS.find((s) => s.key === key);
      if (!marks[key] && marks[key] !== 0) return `${subj?.label || key} marks are required.`;
      if (isNaN(val) || val < 0 || val > 100) return `${subj?.label || key} marks must be 0–100.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      // Map selected subjects to legacy fixed marks fields where applicable.
      // If multiple subjects map to the same legacy field (e.g. physics + chemistry → science),
      // the first matching subject's mark is used; all subjects are also stored in subjectMarks.
      const subjectMarks = {};
      selectedSubjects.forEach((key) => { subjectMarks[key] = Number(marks[key]); });

      await api.put('/auth/marks', {
        maths:   Number(marks.mathematics || marks.maths || 0),
        science: Number(marks.science || marks.physics || marks.chemistry || 0),
        english: Number(marks.english || 0),
        social:  Number(marks.socialStudies || marks.history || marks.geography || 0),
        subjects: selectedSubjects,
        subjectMarks,
        preferences: interests,
      });

      setSuccess('Profile saved! Redirecting to dashboard…');
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '640px' }}>
        <div className="auth-card-accent" />

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot${step === 1 ? ' active' : ' done'}`} />
          <div style={{ width: '48px', height: '2px', background: step >= 2 ? '#6366f1' : '#c7d2fe', borderRadius: 1 }} />
          <div className={`step-dot${step === 2 ? ' active' : step > 2 ? ' done' : ''}`} />
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#6366f1', fontWeight: '600', marginTop: '-0.75rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Step {step} of 2 — {step === 1 ? 'Select Your Subjects' : 'Enter Your Marks'}
        </p>

        {/* Back button */}
        <button
          onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          ← {step === 2 ? 'Back to Subject Selection' : 'Skip — Go to Dashboard'}
        </button>

        {/* ── STEP 1: Select Subjects ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '0.3rem', color: '#1e1b4b' }}>
              What subjects did you study?
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Select all subjects from your 10th standard curriculum — your aptitude test will be based on these.
            </p>

            {error && <div className="error-message">{error}</div>}

            <div className="grid grid-4" style={{ gap: '0.65rem', marginBottom: '1.5rem' }}>
              {ALL_SUBJECTS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSubject(key)}
                  className={`subject-btn${selectedSubjects.includes(key) ? ' selected' : ''}`}
                >
                  <span style={{ fontSize: '1.6rem' }}>{icon}</span>
                  <span>{label}</span>
                  {selectedSubjects.includes(key) && (
                    <span style={{ color: '#6366f1', fontSize: '0.68rem', fontWeight: '700' }}>✓ Selected</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '600' }}>
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected (min. 3)
              </span>
              <button
                type="button"
                className="btn-primary"
                onClick={goToStep2}
                disabled={selectedSubjects.length < 3}
              >
                Next: Enter Marks →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Enter Marks ── */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '0.3rem', color: '#1e1b4b' }}>
              Enter your marks
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Enter your marks out of 100 for each selected subject.
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                {selectedSubjects.map((key) => {
                  const subj = ALL_SUBJECTS.find((s) => s.key === key);
                  return (
                    <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                      <label htmlFor={key}>
                        {subj?.icon} {subj?.label || key}
                      </label>
                      <input
                        id={key}
                        name={key}
                        type="number"
                        min="0"
                        max="100"
                        className="form-input"
                        placeholder="e.g. 85"
                        value={marks[key] ?? ''}
                        onChange={(e) => setMarks((prev) => ({ ...prev, [key]: e.target.value }))}
                        required
                      />
                    </div>
                  );
                })}
              </div>

              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#4338ca', fontSize: '0.9rem' }}>
                Your Interests <span style={{ fontWeight: '400', color: '#9ca3af' }}>(optional)</span>
              </h4>
              <div className="tag-group mb-3">
                {INTERESTS.map((interest) => (
                  <span
                    key={interest}
                    className={`tag-pill${interests.includes(interest) ? ' selected' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <span className="loading-spinner light" /> : '✓ Save & Continue to Dashboard'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
