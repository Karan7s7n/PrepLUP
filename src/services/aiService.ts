interface EvaluationResult {
  score: number;
  breakdown: {
    clarity: number;
    technical: number;
    structure: number;
    experience: number;
    impact: number;
  };
  strengths: string;
  improvements: string;
}

const pick = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

////////////////////////////////////////////////////
// FEEDBACK BANK
////////////////////////////////////////////////////
const clarityGood = [
  "Clear and easy to understand explanation",
  "Well-articulated response",
  "Strong communication skills",
  "Answer is concise and readable",
  "Good clarity in explanation",
];

const clarityBad = [
  "Improve clarity and sentence flow",
  "Explanation feels unclear",
  "Try simplifying your answer",
  "Use clearer wording",
  "Answer lacks clarity",
];

const techGood = [
  "Strong technical understanding",
  "Good use of technical concepts",
  "Demonstrates solid domain knowledge",
  "Covers relevant technologies well",
  "Technically sound answer",
];

const techBad = [
  "Add more technical depth",
  "Lacks technical explanation",
  "Include relevant concepts or tools",
  "Answer feels too generic",
  "Missing technical insights",
];

const structureGood = [
  "Well structured response",
  "Logical step-by-step explanation",
  "Answer flows nicely",
  "Good use of structured thinking",
  "Follows a clear approach",
];

const structureBad = [
  "Structure your answer better",
  "Use step-by-step explanation",
  "Try STAR method",
  "Organize thoughts more clearly",
  "Answer lacks structure",
];

const expGood = [
  "Includes real-world experience",
  "Good use of practical examples",
  "Shows hands-on experience",
  "Strong real project reference",
  "Demonstrates applied knowledge",
];

const expBad = [
  "Add real-world examples",
  "Mention past projects",
  "Include personal experience",
  "Answer feels theoretical",
  "Show practical usage",
];

const impactGood = [
  "Shows measurable impact",
  "Highlights results effectively",
  "Mentions optimization or improvements",
  "Strong outcome-focused answer",
  "Good mention of results",
];

const impactBad = [
  "Mention results or impact",
  "Add measurable outcomes",
  "Include numbers or improvements",
  "Explain impact of your work",
  "Answer lacks impact",
];

////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////
export function evaluateAnswer(answer: string): EvaluationResult {
  if (!answer || !answer.trim()) {
    return {
      score: 0,
      breakdown: {
        clarity: 0,
        technical: 0,
        structure: 0,
        experience: 0,
        impact: 0,
      },
      strengths: "No answer provided",
      improvements: "Provide a complete answer",
    };
  }

  const text = answer.toLowerCase();
  const words = text.split(/\s+/).length;

  const tech = ["react","api","database","state","hooks","backend"];
  const structure = ["first","then","finally","because","example"];
  const experience = ["i built","i worked","my project","i created"];
  const impact = ["improved","increased","reduced","optimized","%"];

  const count = (arr: string[]) =>
    arr.filter((k) => text.includes(k)).length;

  const clarity =
    words < 10 ? 2 : words < 30 ? 5 : words < 80 ? 7 : 9;

  const technical = Math.min(count(tech) * 2, 10);
  const structureScore = count(structure) ? 6 : 3;
  const experienceScore = count(experience) ? 8 : 3;
  const impactScore = count(impact) ? 8 : 3;

  const finalScore = Math.round(
    (clarity + technical + structureScore + experienceScore + impactScore) / 5
  );

  const strengthsArr: string[] = [];
  const improvementsArr: string[] = [];

  clarity >= 7 ? strengthsArr.push(pick(clarityGood)) : improvementsArr.push(pick(clarityBad));
  technical >= 6 ? strengthsArr.push(pick(techGood)) : improvementsArr.push(pick(techBad));
  structureScore >= 6 ? strengthsArr.push(pick(structureGood)) : improvementsArr.push(pick(structureBad));
  experienceScore >= 6 ? strengthsArr.push(pick(expGood)) : improvementsArr.push(pick(expBad));
  impactScore >= 6 ? strengthsArr.push(pick(impactGood)) : improvementsArr.push(pick(impactBad));

  return {
    score: finalScore,
    breakdown: {
      clarity,
      technical,
      structure: structureScore,
      experience: experienceScore,
      impact: impactScore,
    },
    strengths: strengthsArr.join(", "),
    improvements: improvementsArr.join(", "),
  };
}
