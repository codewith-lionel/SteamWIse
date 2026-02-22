import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const INTERESTS = ['Technology', 'Business', 'Medicine', 'Research', 'Creative Arts', 'Engineering', 'Finance', 'Teaching'];

const SUBJECTS = [
  { key: 'maths', label: 'Mathematics' },
  { key: 'science', label: 'Science' },
  { key: 'english', label: 'English' },
  { key: 'social', label: 'Social Studies' },
];

export default function Preferences() {
  const navigate = useNavigate();
  const [marks, setMarks] = useState({ maths: '', science: '', english: '', social: '' });
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMarkChange = (e) => {
    const { name, value } = e.target;
    setMarks({ ...marks, [name]: value });
  };

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const validate = () => {
    for (const { key, label } of SUBJECTS) {
      const val = Number(marks[key]);
      if (marks[key] === '') return `${label} marks are required.`;
      if (isNaN(val) || val < 0 || val > 100) return `${label} marks must be between 0 and 100.`;
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
      await api.put('/auth/marks', {
        maths: Number(marks.maths),
        science: Number(marks.science),
        english: Number(marks.english),
        social: Number(marks.social),
      });
      setSuccess('Preferences saved successfully!');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '560px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', padding: 0 }}>
          ← Back to Dashboard
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>Academic Preferences</h2>
        <p style={{ color: '#777', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter your marks and select your interests to personalise AI recommendations.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: '#444' }}>Academic Marks (0–100)</h4>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            {SUBJECTS.map(({ key, label }) => (
              <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  name={key}
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  placeholder="e.g. 85"
                  value={marks[key]}
                  onChange={handleMarkChange}
                  required
                />
              </div>
            ))}
          </div>

          <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#444' }}>Interests & Preferences</h4>
          <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Select all that apply</p>
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
            {loading ? <span className="loading-spinner" /> : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
