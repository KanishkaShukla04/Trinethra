export const KPI_DEFINITIONS = [
  "Execution Discipline — Does the Fellow complete tasks reliably and on time?",
  "Accountability Systems — Has the Fellow built or improved any tracking or accountability mechanism?",
  "Cross-functional Coordination — Does the Fellow coordinate across teams or departments?",
  "Problem Diagnosis — Can the Fellow identify root causes, not just symptoms?",
  "Supervisor Trust — Does the supervisor trust the Fellow to work independently?",
  "Team Behavior Change — Has the team changed how they work because of the Fellow?",
  "Systems Building — Has the Fellow created something that will outlast their time at the company?",
  "Communication Quality — Does the Fellow communicate clearly with supervisors and team?",
];

export const RUBRIC_SUMMARY = `
RUBRIC LEVELS:
1-2: Non-Functional — not showing up, no positive evidence
3-4: Below Expectations — passive, only follows instructions, supervisor low confidence
5-6: Functional — reliable, completes tasks, some initiative, supervisor satisfied but not impressed
7-8: Strong — proactive, trusted, building visible systems, team goes to Fellow directly
9-10: Exceptional — operating beyond role, lasting systems, measurable business impact

ASSESSMENT DIMENSIONS:
- Task Completion & Reliability
- Initiative & Proactiveness
- Systems Building
- Team Behavior Change
- Supervisor Trust & Relationship
- Cross-functional Coordination
- Communication Quality
- Problem Diagnosis Accuracy
`;

export function buildPrompt(transcript: string): string {
  return `You are a psychology assessment assistant working for DeepThought, a company that places Fellows inside Indian manufacturing companies.

Your job is to analyze a supervisor's spoken feedback about a Fellow and produce a structured assessment draft.

${RUBRIC_SUMMARY}

KPI DEFINITIONS:
${KPI_DEFINITIONS.map((k, i) => `${i + 1}. ${k}`).join("\n")}

INSTRUCTIONS:
1. Extract specific quotes from the transcript as evidence. Tag each as "positive", "negative", or "neutral".
2. Suggest a rubric score from 1-10 with a justification paragraph citing the evidence.
3. Map the Fellow's work to relevant KPIs from the list above.
4. Identify which assessment dimensions the transcript did NOT cover (gaps).
5. Generate 3-5 follow-up questions targeting specific gaps.

IMPORTANT: Return ONLY valid JSON. No commentary before or after. No markdown code blocks. Just raw JSON.

JSON FORMAT:
{
  "evidence": [
    { "quote": "exact quote from transcript", "tag": "positive" | "negative" | "neutral", "dimension": "which assessment dimension this relates to" }
  ],
  "rubricScore": <number 1-10>,
  "rubricLabel": "<Non-Functional|Below Expectations|Functional|Strong|Exceptional>",
  "justification": "<one paragraph explaining the score, citing evidence>",
  "kpis": ["<KPI name>"],
  "gaps": ["<assessment dimension not covered>"],
  "followUpQuestions": [
    { "question": "<question text>", "targets": "<which gap this addresses>" }
  ]
}

TRANSCRIPT:
${transcript}`;
}
