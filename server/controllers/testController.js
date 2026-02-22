const { generateQuestions, generateUnifiedQuestions } = require('../utils/gemini');
const { calculateScore } = require('../utils/scoring');
const TestResult = require('../models/TestResult');
const User = require('../models/User');

// Map route param names to human-readable stream display names
const STREAM_MAP = {
  computerScience: 'Computer Science',
  commerce:        'Commerce',
  biology:         'Biology',
  maths:           'Mathematics',
  arts:            'Arts',
};

const VALID_STREAMS = [...Object.keys(STREAM_MAP), 'unified'];

/**
 * GET /api/test/generate/:stream
 * Fetch 10 AI-generated MCQ questions for the requested stream.
 */
const getQuestions = async (req, res) => {
  try {
    const { stream } = req.params;

    if (!VALID_STREAMS.includes(stream)) {
      return res.status(400).json({
        message: `Invalid stream. Must be one of: ${VALID_STREAMS.join(', ')}`,
      });
    }

    const streamDisplayName = STREAM_MAP[stream];
    const questions = await generateQuestions(streamDisplayName);

    res.status(200).json({ stream, questions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate questions', error: error.message });
  }
};

/**
 * GET /api/test/generate  (protected)
 * Generate a unified aptitude test based on the student's saved subjects.
 */
const getUnifiedQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fall back to default subjects if none saved yet (camelCase keys matching Preferences.js)
    const subjects = user.subjects && user.subjects.length > 0
      ? user.subjects
      : ['mathematics', 'science', 'english', 'socialStudies'];

    const questions = await generateUnifiedQuestions(subjects);
    res.status(200).json({ stream: 'unified', questions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate questions', error: error.message });
  }
};

/**
 * POST /api/test/submit  (protected)
 * Score a submitted test and persist the result for the authenticated user.
 */
const submitTest = async (req, res) => {
  try {
    const { stream, userAnswers, correctAnswers } = req.body;

    if (!VALID_STREAMS.includes(stream)) {
      return res.status(400).json({
        message: `Invalid stream. Must be one of: ${VALID_STREAMS.join(', ')}`,
      });
    }

    const score = calculateScore(userAnswers, correctAnswers);

    // Upsert: find the existing record for this user or create a new one
    let testResult = await TestResult.findOne({ userId: req.user.id });

    if (!testResult) {
      testResult = new TestResult({ userId: req.user.id });
    }

    // Update only the score for the submitted stream
    testResult.scores[stream] = score;
    await testResult.save();

    res.status(200).json({ stream, score, testResult });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit test', error: error.message });
  }
};

module.exports = { getQuestions, getUnifiedQuestions, submitTest };
