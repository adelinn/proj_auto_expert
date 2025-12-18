// Questions by category (A, B, C, D, Tr)
import questionsA from './questions_A.js';
import questionsB from './questions_B.js';
import questionsC from './questions_C.js';
import questionsD from './questions_D.js';
import questionsTr from './questions_Tr.js';

export const QUESTIONS_BY_CATEGORY = {
  A: questionsA,
  B: questionsB,
  C: questionsC,
  D: questionsD,
  Tr: questionsTr,
};

export function getQuestionsByCategory(code = 'B') {
  const key = String(code).trim();
  return QUESTIONS_BY_CATEGORY[key] || null;
}
