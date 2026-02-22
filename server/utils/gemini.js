const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate 10 MCQ aptitude questions for a given stream using Groq AI.
 * @param {string} streamName - Display name of the stream (e.g. 'Computer Science').
 * @returns {Promise<Array>} Array of question objects.
 */
const generateQuestions = async (streamName) => {
  const prompt = `Generate exactly 10 multiple-choice aptitude questions for students interested in the "${streamName}" stream at the high school / college-entry level.

IMPORTANT REQUIREMENTS:
1. Questions should be SLIGHTLY DIFFICULT - suitable for competitive exam preparation
2. Include analytical thinking, application-based, and problem-solving questions
3. Avoid simple recall or memorization questions
4. Make distractors (wrong options) plausible and challenging
5. Questions should test aptitude, logical reasoning, and subject understanding

Return ONLY a valid JSON array (no markdown, no extra text) where each element has:
- "id": question number (1-10)
- "question": the question text (should be challenging and thought-provoking)
- "options": an array of exactly 4 answer strings (all options should be plausible)
- "correctAnswer": the index (0-3) of the correct option in the options array

Example format:
[
  {
    "id": 1,
    "question": "In object-oriented programming, what is the primary purpose of encapsulation?",
    "options": ["To hide implementation details and expose only necessary interfaces", "To allow multiple inheritance", "To improve code execution speed", "To create global variables"],
    "correctAnswer": 0
  }
]`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 2048,
    });

    const text = chatCompletion.choices[0]?.message?.content || '';
    
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

  const prompt = `You are an expert academic counsellor with 20 years of experience. Analyse the following student profile comprehensively and recommend the MOST suitable stream for further studies after 10th standard.

Student Name: ${name}
Subjects Studied: ${subjects && subjects.length ? subjects.map((s) => SUBJECT_DISPLAY_NAMES[s] || s).join(', ') : 'Not specified'}
${academicMarksSection}
Student's Stated Interests/Preferences: ${preferences && preferences.length ? preferences.join(', ') : 'None provided'}
${aptitudeScore}

ANALYSIS GUIDELINES (VERY IMPORTANT):
1. DO NOT default to Computer Science - analyze ALL streams objectively
2. Consider THREE key factors with EQUAL weight:
   a) Academic Performance (subject marks show natural strengths)
   b) Aptitude Test Scores (indicate potential in different streams)
   c) Student Interests (shows passion and motivation)
3. Stream Matching Criteria:
   - Computer Science: High in Math/CS, logical thinking, interest in technology
   - Commerce: High in Math/Economics, business interest, analytical skills
   - Biology/Medical: High in Biology/Chemistry/Physics, interest in healthcare/life sciences
   - Mathematics: Exceptional in Math, interest in pure sciences, problem-solving
   - Arts: High in languages/social sciences, creative interests, humanities
4. If marks are balanced, give MORE weight to aptitude scores and stated interests
5. Provide honest ranking - if Biology aptitude is highest, don't recommend Computer Science
6. Confidence level should be 70-90 for clear cases, 50-69 for borderline cases

Return ONLY a valid JSON object (no markdown, no extra text) with:
- "recommendedStream": MUST be one of "Computer Science", "Commerce", "Biology", "Mathematics", "Arts"
- "confidenceLevel": a number between 50 and 95 indicating confidence in the recommendation
- "explanation": 2-3 detailed sentences explaining WHY this stream is best suited (mention specific marks, scores, and interests that support this recommendation)
- "streamRanking": an array of all 5 stream names sorted from most to least suitable based on the analysis

EXAMPLE (for a biology-interested student):
{
  "recommendedStream": "Biology",
  "confidenceLevel": 82,
  "explanation": "You show exceptional strength in Biology (92) and Chemistry (88), combined with a strong interest in healthcare. Your unified aptitude score of 78% demonstrates solid analytical abilities needed for medical sciences. While your Math score is good, your passion and academic excellence in life sciences make Biology the ideal choice.",
  "streamRanking": ["Biology", "Mathematics", "Computer Science", "Commerce", "Arts"]
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const text = chatCompletion.choices[0]?.message?.content || '';
    
    const cleaned = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleaned);
    
    // Log the recommendation for debugging
    console.log('[analyzeFinalResult] Recommended stream:', analysis.recommendedStream);
    console.log('[analyzeFinalResult] Confidence:', analysis.confidenceLevel);
    
    return analysis;
  } catch (error) {
    throw new Error(`Failed to analyze results: ${error.message}`);
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
 * Generate a unified aptitude test covering all subjects the student studied.
 * @param {string[]} subjects - Array of subject keys (camelCase) or display names.
 * @returns {Promise<Array>} Array of question objects (10 per subject).
 */
const generateUnifiedQuestions = async (subjects) => {
  // Convert camelCase keys to display names; fall back to the original string if not found
  const displayNames = subjects.map((s) => SUBJECT_DISPLAY_NAMES[s] || s);
  const subjectList = displayNames.join(', ');
  const questionsPerSubject = 10;
  const totalQuestions = subjects.length * questionsPerSubject;
  
  const prompt = `Generate exactly ${totalQuestions} multiple-choice aptitude questions for a 10th standard student who studied: ${subjectList}.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${questionsPerSubject} questions for EACH subject (total ${totalQuestions} questions)
2. Distribution must be: ${displayNames.map(s => `${s}: ${questionsPerSubject} questions`).join(', ')}
3. Questions should be SLIGHTLY DIFFICULT - suitable for competitive exam preparation
4. Include analytical thinking, application-based, and problem-solving questions
5. Avoid simple recall or memorization questions
6. Make distractors (wrong options) plausible and challenging

Return ONLY a valid JSON array (no markdown, no extra text) where each element has:
- "id": question number (1-${totalQuestions})
- "question": the question text (should be challenging and thought-provoking)
- "options": an array of exactly 4 answer strings (all options should be plausible)
- "correctAnswer": the index (0-3) of the correct option
- "subject": the subject name this question is from

IMPORTANT: Ensure exactly ${questionsPerSubject} questions per subject. Group questions by subject.

Example format:
[
  {
    "id": 1,
    "question": "If a train travels at a speed of 60 km/h for the first half of the journey and 90 km/h for the second half, what is the average speed for the entire journey?",
    "options": ["70 km/h", "72 km/h", "75 km/h", "80 km/h"],
    "correctAnswer": 1,
    "subject": "Mathematics"
  }
]`;

  try {
    console.log('[generateUnifiedQuestions] Calling Groq API with subjects:', subjectList);
    console.log(`[generateUnifiedQuestions] Generating ${totalQuestions} questions (${questionsPerSubject} per subject)...`);
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 8000,
    });

    const text = chatCompletion.choices[0]?.message?.content || '';
    console.log('[generateUnifiedQuestions] Raw response length:', text.length);
    
    const cleaned = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleaned);
    console.log('[generateUnifiedQuestions] Successfully parsed', questions.length, 'questions');
    
    // Verify we got the expected number of questions
    if (questions.length !== totalQuestions) {
      console.warn(`[generateUnifiedQuestions] Warning: Expected ${totalQuestions} questions, got ${questions.length}`);
    }
    
    // Count questions per subject
    const subjectCounts = {};
    questions.forEach(q => {
      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    });
    console.log('[generateUnifiedQuestions] Questions per subject:', subjectCounts);
    
    return questions;
  } catch (error) {
    console.error('[generateUnifiedQuestions] Error:', error.message);
    throw new Error(`Failed to generate unified questions: ${error.message}`);
  }
};

module.exports = { generateQuestions, generateUnifiedQuestions, analyzeFinalResult };
