/**
 * Calculate the aptitude test score by comparing user answers to correct answers.
 * @param {number[]} userAnswers    - Array of answer indices chosen by the student.
 * @param {number[]} correctAnswers - Array of correct answer indices.
 * @returns {number} Score as a rounded percentage (0-100).
 */
const calculateScore = (userAnswers, correctAnswers) => {
  if (!Array.isArray(userAnswers) || !Array.isArray(correctAnswers) || correctAnswers.length === 0) {
    return 0;
  }

  let correct = 0;
  correctAnswers.forEach((answer, index) => {
    if (userAnswers[index] === answer) {
      correct++;
    }
  });

  const percentage = (correct / correctAnswers.length) * 100;
  return Math.round(percentage);
};

module.exports = { calculateScore };
