const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Extract a JSON value (array or object) from a string that may contain
 * markdown fences or other surrounding text returned by the model.
 * @param {string} text - Raw text from the model response.
 * @returns {any} Parsed JSON value.
 */
const extractJSON = (text) => {
  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  const withoutFences = text.replace(/```(?:json)?\s*|\s*```/g, '').trim();
  // Try direct parse first
  try {
    return JSON.parse(withoutFences);
  } catch (_) {
    // Fall back: find the first JSON array or object in the text and parse from there
    const arrayStart = withoutFences.indexOf('[');
    const objectStart = withoutFences.indexOf('{');
    const start =
      arrayStart === -1 ? objectStart :
      objectStart === -1 ? arrayStart :
      Math.min(arrayStart, objectStart);
    if (start === -1) throw new SyntaxError('No JSON found in model response');
    return JSON.parse(withoutFences.slice(start));
  }
};

// Map camelCase subject keys (from Preferences.js) to readable display names for AI prompts
const SUBJECT_DISPLAY_NAMES = {
  mathematics: 'Mathematics',
  science: 'Science',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  english: 'English',
  hindi: 'Hindi',
  socialStudies: 'Social Studies',
  history: 'History',
  geography: 'Geography',
  economics: 'Economics',
  computerScience: 'Computer Science',
  accountancy: 'Accountancy',
  arts: 'Arts & Drawing',
  physicalEducation: 'Physical Education',
  music: 'Music',
};

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
    const questions = extractJSON(text);
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
  const { name, marks, preferences, scores, subjects, subjectMarks } = studentData;

  // Build a readable academic marks section for the AI prompt
  let academicMarksSection = '';
  if (subjectMarks && subjectMarks.size > 0) {
    academicMarksSection = '\nSubject Marks (out of 100):\n';
    for (const [subj, mark] of subjectMarks) {
      academicMarksSection += `  - ${SUBJECT_DISPLAY_NAMES[subj] || subj}: ${mark}\n`;
    }
  } else {
    academicMarksSection = `\nAcademic Marks (out of 100):\n  - Mathematics: ${marks.maths}\n  - Science: ${marks.science}\n  - English: ${marks.english}\n  - Social Studies: ${marks.social}\n`;
  }

  const aptitudeScore = scores.unified !== undefined
    ? `Unified Aptitude Test Score: ${scores.unified}%`
    : `Aptitude Scores: Computer Science ${scores.computerScience}%, Commerce ${scores.commerce}%, Biology ${scores.biology}%, Mathematics ${scores.maths}%, Arts ${scores.arts}%`;

  const prompt = `You are an academic counsellor. Analyse the following student profile and recommend the most suitable stream for further studies after 10th standard.

Student Name: ${name}
Subjects Studied: ${subjects && subjects.length ? subjects.map((s) => SUBJECT_DISPLAY_NAMES[s] || s).join(', ') : 'Not specified'}
${academicMarksSection}
Stated Interests: ${preferences && preferences.length ? preferences.join(', ') : 'None provided'}
${aptitudeScore}

Return ONLY a valid JSON object (no markdown, no extra text) with:
- "recommendedStream": one of "Computer Science", "Commerce", "Biology", "Mathematics", "Arts"
- "confidenceLevel": a number between 0 and 100 indicating confidence
- "explanation": 2-3 sentences explaining the recommendation
- "streamRanking": an array of all 5 stream names sorted from most to least suitable`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const analysis = extractJSON(text);
    return analysis;
  } catch (error) {
    throw new Error(`Failed to analyze results: ${error.message}`);
  }
};

/**
 * Generate a unified aptitude test covering all subjects the student studied.
 * @param {string[]} subjects - Array of subject keys (camelCase) or display names.
 * @returns {Promise<Array>} Array of 15 question objects.
 */
const generateUnifiedQuestions = async (subjects) => {
  // Convert camelCase keys to display names; fall back to the original string if not found
  const displayNames = subjects.map((s) => SUBJECT_DISPLAY_NAMES[s] || s);
  const subjectList = displayNames.join(', ');
  const prompt = `Generate exactly 15 multiple-choice aptitude questions for a 10th standard student who studied: ${subjectList}.

Mix questions across all these subjects proportionally. Each question should suit a 10th standard student.

Return ONLY a valid JSON array (no markdown, no extra text) where each element has:
- "id": question number (1-15)
- "question": the question text
- "options": an array of exactly 4 answer strings
- "correctAnswer": the index (0-3) of the correct option
- "subject": the subject name this question is from

Example format:
[
  {
    "id": 1,
    "question": "Sample question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2,
    "subject": "Mathematics"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const questions = extractJSON(text);
    return questions;
  } catch (error) {
    throw new Error(`Failed to generate unified questions: ${error.message}`);
  }
};

module.exports = { generateQuestions, generateUnifiedQuestions, analyzeFinalResult };
