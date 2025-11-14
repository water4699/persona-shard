import type { SurveyResponses } from "../types/survey";

export function calculateStressIndex(responses: SurveyResponses) {
  const weights = [4, 6, 5, 7, 3];
  const values = [responses.q1, responses.q2, responses.q3, responses.q4, responses.q5];
  return values.reduce((acc, value, idx) => acc + value * weights[idx], 0);
}

