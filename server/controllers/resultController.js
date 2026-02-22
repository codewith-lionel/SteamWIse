const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { analyzeFinalResult } = require('../utils/gemini');

/**
 * GET /api/result/final  (protected)
 * Generate an AI-powered stream recommendation based on the student's
 * academic marks and all completed aptitude test scores.
 */
const getFinalResult = async (req, res) => {
  try {
    const testResult = await TestResult.findOne({ userId: req.user.id });

    if (!testResult) {
      return res.status(404).json({ message: 'No test results found' });
    }

    // Fetch user profile (exclude password)
    const user = await User.findById(req.user.id).select('-password');

    const studentData = {
      name:         user.name,
      marks:        user.marks,
      preferences:  user.preferences,
      scores:       testResult.scores,
      subjects:     user.subjects || [],
      subjectMarks: user.subjectMarks || new Map(),
    };

    const aiAnalysis = await analyzeFinalResult(studentData);

    // Persist the AI recommendation back to the TestResult document
    testResult.recommendedStream = aiAnalysis.recommendedStream;
    testResult.confidenceLevel   = aiAnalysis.confidenceLevel;
    testResult.explanation       = aiAnalysis.explanation;
    await testResult.save();

    res.status(200).json({ testResult, aiAnalysis });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate final result', error: error.message });
  }
};

module.exports = { getFinalResult };
