export type TrackId = "os" | "cn" | "digital-logic" | "architecture";

export type LessonRef = { track: TrackId; slug: string; title?: string };

export type AnswerDepth = { model?: string; why?: string; followups?: { q: string; a: string }[]; tradeoff?: string; assumptions?: string; sanity?: string };
export type Question = AnswerDepth & (
  | { id: string; kind: "mcq"; prompt: string; options: string[]; answer: number; explain: string; hints?: string[] }
  | { id: string; kind: "msq"; prompt: string; options: string[]; answer: number[]; explain: string; hints?: string[] }
  | { id: string; kind: "numeric"; prompt: string; answer: number; tolerance?: number; unit?: string; explain: string; hints?: string[] }
  | { id: string; kind: "typed"; prompt: string; accept: string[]; explain: string; hints?: string[]; placeholder?: string }
  | { id: string; kind: "order"; prompt: string; items: string[]; explain: string; hints?: string[] } // items in correct order
  | { id: string; kind: "match"; prompt: string; pairs: [string, string][]; explain: string; hints?: string[] }
  | { id: string; kind: "code"; prompt: string; code: string; accept: string[]; explain: string; hints?: string[] }
  | { id: string; kind: "scenario"; prompt: string; options: string[]; answer: number; explain: string; hints?: string[] });

export type TraceStep = { label: string; detail: string };

export type Lesson = {
  slug: string;
  track: TrackId;
  title: string;
  short: string;
  flagship?: boolean;
  question: string;
  problem: string; // "see the problem" narrative
  idea: string;
  how: { text: string; formula?: string; example?: string };
  lab?: string; // lab id
  trace?: TraceStep[]; // fallback interactive stepper
  checks: Question[];
  deeper: { title: string; body: string }[];
  followups: { q: string; a: string }[];
  tradeoff: { failure: string; tradeoff: string };
  numbers?: { label: string; value: string }[];
  model?: string; // model interview answer
  debug?: { q: string; a: string };
  rapid?: string[];
  // Optional shared metadata (added for new tracks; existing lessons need none of it)
  before?: LessonRef[]; // prerequisites
  after?: LessonRef[]; // suggested next lessons
  derive?: string; // "derive it yourself" prompt
  keyIdea?: string;
  commonMistake?: string;
  interviewLadder?: { level: "definition" | "mechanism" | "trade-off" | "systems"; q: string; a: string }[];
  extended?: { title: string; body: string }[];
  bridge?: { to: LessonRef; note: string };
};