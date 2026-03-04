const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY is not set. AI features will not work.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Extract a JSON value (array or object) from a string that may contain
 * markdown fences or other surrounding text returned by the model.
 * @param {string} text - Raw text from the model response.
 * @returns {any} Parsed JSON value.
 */
const extractJSON = (text) => {
  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  const withoutFences = text.replace(/```(?:json)?\s*|\s*```/g, "").trim();
  // Try direct parse first
  try {
    return JSON.parse(withoutFences);
  } catch (_) {
    // Fall back: find the first JSON array or object in the text and parse from there
    const arrayStart = withoutFences.indexOf("[");
    const objectStart = withoutFences.indexOf("{");
    const start =
      arrayStart === -1
        ? objectStart
        : objectStart === -1
          ? arrayStart
          : Math.min(arrayStart, objectStart);
    if (start === -1) throw new SyntaxError("No JSON found in model response");
    return JSON.parse(withoutFences.slice(start));
  }
};

// Map camelCase subject keys (from Preferences.js) to readable display names for AI prompts
const SUBJECT_DISPLAY_NAMES = {
  mathematics: "Mathematics",
  science: "Science",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  english: "English",
  hindi: "Hindi",
  socialStudies: "Social Studies",
  history: "History",
  geography: "Geography",
  economics: "Economics",
  computerScience: "Computer Science",
  accountancy: "Accountancy",
  arts: "Arts & Drawing",
  physicalEducation: "Physical Education",
  music: "Music",
};

/**
 * Generate 10 MCQ aptitude questions for a given stream using Groq AI.
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
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });
    const text = chatCompletion.choices[0]?.message?.content || "";
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
  const { name, marks, preferences, scores, subjects, subjectMarks } =
    studentData;

  // Build a readable academic marks section for the AI prompt
  let academicMarksSection = "";
  if (subjectMarks && subjectMarks.size > 0) {
    academicMarksSection = "\nSubject Marks (out of 100):\n";
    for (const [subj, mark] of subjectMarks) {
      academicMarksSection += `  - ${SUBJECT_DISPLAY_NAMES[subj] || subj}: ${mark}\n`;
    }
  } else {
    academicMarksSection = `\nAcademic Marks (out of 100):\n  - Mathematics: ${marks.maths}\n  - Science: ${marks.science}\n  - English: ${marks.english}\n  - Social Studies: ${marks.social}\n`;
  }

  const aptitudeScore =
    scores.unified !== undefined
      ? `Unified Aptitude Test Score: ${scores.unified}%`
      : `Aptitude Scores: Computer Science ${scores.computerScience}%, Commerce ${scores.commerce}%, Biology ${scores.biology}%, Mathematics ${scores.maths}%, Arts ${scores.arts}%`;

  const prompt = `You are an academic counsellor. Analyze the following student profile objectively and recommend the MOST suitable stream for further studies after 10th standard based on their strengths and interests.

Student Name: ${name}
Subjects Studied: ${subjects && subjects.length ? subjects.map((s) => SUBJECT_DISPLAY_NAMES[s] || s).join(", ") : "Not specified"}
${academicMarksSection}
Stated Interests: ${preferences && preferences.length ? preferences.join(", ") : "None provided"}
${aptitudeScore}

IMPORTANT: Consider all factors equally. Do NOT default to Computer Science unless it is genuinely the best fit. Analyze the student's actual performance and interests.

Available streams and their focus areas:
- Computer Science: For students strong in logic, mathematics, programming, technology
- Commerce: For students interested in business, finance, economics, accounting
- Biology: For students strong in life sciences, medicine, healthcare
- Mathematics: For students exceptional in pure mathematics, analytical thinking
- Arts: For students interested in humanities, social sciences, creative fields

Return ONLY a valid JSON object (no markdown, no extra text) with:
- "recommendedStream": one of "Computer Science", "Commerce", "Biology", "Mathematics", "Arts"
- "confidenceLevel": a number between 0 and 100 indicating confidence
- "explanation": 2-3 sentences explaining why this stream matches their profile
- "streamRanking": an array of all 5 stream names sorted from most to least suitable`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 1024,
    });
    const text = chatCompletion.choices[0]?.message?.content || "";
    const analysis = extractJSON(text);
    return analysis;
  } catch (error) {
    throw new Error(`Failed to analyze results: ${error.message}`);
  }
};

/**
 * Generate a unified aptitude test covering all subjects the student studied.
 * @param {string[]} subjects - Array of subject keys (camelCase) or display names.
 * @returns {Promise<Array>} Array of question objects (15 per subject).
 */
const generateUnifiedQuestions = async (subjects) => {
  // Convert camelCase keys to display names; fall back to the original string if not found
  const displayNames = subjects.map((s) => SUBJECT_DISPLAY_NAMES[s] || s);
  
  // Generate 15 questions for EACH subject
  const allQuestions = [];
  let questionId = 1;
  
  for (const subjectName of displayNames) {
    const prompt = `Generate exactly 15 multiple-choice aptitude questions for a 10th standard student on the subject: ${subjectName}.

Each question should be appropriate for a 10th standard student and test their understanding of ${subjectName}.

Return ONLY a valid JSON array (no markdown, no extra text) where each element has:
- "id": question number (starting from 1)
- "question": the question text
- "options": an array of exactly 4 answer strings
- "correctAnswer": the index (0-3) of the correct option
- "subject": "${subjectName}"

Example format:
[
  {
    "id": 1,
    "question": "Sample question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2,
    "subject": "${subjectName}"
  }
]`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 4096,
      });
      const text = chatCompletion.choices[0]?.message?.content || '';
      const questions = extractJSON(text);
      
      // Renumber questions and add to the all questions array
      questions.forEach((q) => {
        allQuestions.push({
          ...q,
          id: questionId++,
        });
      });
    } catch (error) {
      console.error(`Failed to generate questions for ${subjectName}:`, error.message);
      throw new Error(`Failed to generate questions for ${subjectName}: ${error.message}`);
    }
  }
  
  return allQuestions;
};

module.exports = {
  generateQuestions,
  generateUnifiedQuestions,
  analyzeFinalResult,
};
