const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Aptitude test scores per stream (percentage 0-100)
  scores: {
    computerScience: { type: Number, default: 0 },
    commerce:        { type: Number, default: 0 },
    biology:         { type: Number, default: 0 },
    maths:           { type: Number, default: 0 },
    arts:            { type: Number, default: 0 },
    unified:         { type: Number, default: 0 },
  },
  recommendedStream: String,
  confidenceLevel:   Number,
  explanation:       String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TestResult', testResultSchema);
