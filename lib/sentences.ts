export interface Sentence {
  index: number;
  text: string;
  start: number; // seconds
  end: number;
}

/**
 * Placeholder transcript used until a real transcript source is wired up
 * (extension → backend API → manual paste). Lowercase, no punctuation, to keep
 * the typing target clean — same spirit as the reference site.
 */
export const DEMO_SENTENCES: Sentence[] = [
  { index: 0, text: "the quiet rhythm of your fingers becomes a kind of music", start: 0, end: 6 },
  { index: 1, text: "every keystroke is a small bet placed against the clock", start: 6, end: 12 },
  { index: 2, text: "you are not just watching the video you are inside of it", start: 12, end: 18 },
  { index: 3, text: "accuracy comes first and the speed will follow on its own", start: 18, end: 24 },
  { index: 4, text: "when the words begin to flow the screen seems to disappear", start: 24, end: 30 },
];

export interface DemoVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  gradient: string;
}

/** Real, caption-rich videos so the demo cards play an actual video. */
export const DEMO_VIDEOS: DemoVideo[] = [
  {
    id: "UF8uR6Z6KLc",
    title: "Steve Jobs' Stanford Commencement Address",
    channel: "Stanford",
    duration: "15:04",
    gradient: "linear-gradient(135deg, #6d5efc, #b06dff)",
  },
  {
    id: "aircAruvnKk",
    title: "But what is a neural network?",
    channel: "3Blue1Brown",
    duration: "18:40",
    gradient: "linear-gradient(135deg, #00d4ff, #6d5efc)",
  },
  {
    id: "arj7oStGLkU",
    title: "Inside the mind of a master procrastinator",
    channel: "TED",
    duration: "14:04",
    gradient: "linear-gradient(135deg, #ff5c7a, #6d5efc)",
  },
];
