const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate 10 MCQ aptitude questions for a given stream using Gemini AI.
 * @param {string} streamName - Display name of the stream (e.g. 'Computer Science').
 * @returns {Promise<Array>} Array of question objects.
 */
const generateQuestions = async (streamName) => {
  const prompt = `Generate exactly 10 multiple-choice aptitude questions for students interested in the "${streamName}" stream at the high school / college-entry level.

Return ONLY a valid JSON array (no markdown, no extra text) where each element has:
- "id": question number (1-10)
- "question": the question text
- "options": an array of exactly 4 answer strings
- "correctAnswer": the index (0-3) of the correct option in the options array

Example format:
[
  {
    "id": 1,
    "question": "Sample question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleaned);
    return questions;
  } catch (error) {
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

/**
 * Analyze a student's overall performance and recommend the best stream.
 * @param {{ name: string, marks: object, preferences: string[], scores: object }} studentData
 * @returns {Promise<{ recommendedStream: string, confidenceLevel: number, explanation: string, streamRanking: string[] }>}
 */
const analyzeFinalResult = async (studentData) => {
  const { name, marks, preferences, scores } = studentData;

  const prompt = `You are an academic counsellor. Analyse the following student profile and recommend the most suitable stream for further studies.

Student Name: ${name}
Academic Marks (out of 100):
  - Mathematics: ${marks.maths}
  - Science: ${marks.science}
  - English: ${marks.english}
  - Social Studies: ${marks.social}
Stated Preferences: ${preferences.length ? preferences.join(', ') : 'None provided'}
Aptitude Test Scores (percentage):
  - Computer Science: ${scores.computerScience}
  - Commerce: ${scores.commerce}
  - Biology: ${scores.biology}
  - Mathematics: ${scores.maths}
  - Arts: ${scores.arts}

Return ONLY a valid JSON object (no markdown, no extra text) with:
- "recommendedStream": the single best-fit stream name
- "confidenceLevel": a number between 0 and 100 indicating confidence
- "explanation": 2-3 sentences explaining the recommendation
- "streamRanking": an array of all 5 stream names sorted from most to least suitable`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleaned);
    return analysis;
  } catch (error) {
    throw new Error(`Failed to analyze results: ${error.message}`);
  }
};

module.exports = { generateQuestions, analyzeFinalResult };
