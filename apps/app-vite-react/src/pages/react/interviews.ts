import { performanceQuestions } from "./interviews/performance";
import { principleQuestions } from "./interviews/principles";
import { react19Questions } from "./interviews/react19";
import { scenarioQuestions } from "./interviews/scenarios";
import { stateEffectQuestions } from "./interviews/state-effects";
import type { InterviewEntry } from "./types";

export const interviewEntries: InterviewEntry[] = [
  ...principleQuestions,
  ...stateEffectQuestions,
  ...performanceQuestions,
  ...scenarioQuestions,
  ...react19Questions,
];
