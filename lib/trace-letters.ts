export const LETTERS = [
  { name: "L", paths: ["M140 70V310H290"], speech: "L. Lll, lll, lll. L as in lion." },
  { name: "T", paths: ["M110 75H310", "M210 75V315"], speech: "T. Tuh, tuh, tuh. T as in top." },
  { name: "I", paths: ["M140 75H280", "M210 75V315", "M140 315H280"], speech: "I. Ih, ih, ih. I as in it." },
  { name: "F", paths: ["M145 75V315", "M145 75H300", "M145 190H270"], speech: "F. Fff, fff, fff. F as in fish." },
  { name: "E", paths: ["M145 75V315", "M145 75H295", "M145 190H270", "M145 315H295"], speech: "E. Eh, eh, eh. E as in egg." },
  { name: "H", paths: ["M135 75V315", "M285 75V315", "M135 195H285"], speech: "H. Huh, huh, huh. H as in hat." },
  { name: "C", paths: ["M300 110C245 30 115 60 115 195C115 325 245 355 300 280"], speech: "C. Kuh, kuh, kuh. C as in cat." },
  { name: "O", paths: ["M210 65C80 65 80 325 210 325C340 325 340 65 210 65"], speech: "O. Ah, ah, ah. O as in octopus." },
  { name: "U", paths: ["M130 75V245C130 350 290 350 290 245V75"], speech: "U. Uh, uh, uh. U as in up." },
] as const;
export const WORDS = ["IT", "FIT", "LET", "HIT"] as const;
export type Progress = { version: 1; letters: string[]; words: string[] };
export const EMPTY_PROGRESS: Progress = { version: 1, letters: [], words: [] };
export const STORAGE_KEY = "collins-truck-trace-v1";

export function parseProgress(raw: string | null): Progress {
  try {
    const data = JSON.parse(raw || "null");
    if (data?.version !== 1) return { ...EMPTY_PROGRESS };
    const letters = LETTERS.map((l) => l.name).filter((l) => Array.isArray(data.letters) && data.letters.includes(l));
    const words = WORDS.filter((w) => Array.isArray(data.words) && data.words.includes(w) && [...w].every((l) => letters.includes(l as typeof LETTERS[number]["name"])));
    return { version: 1, letters, words };
  } catch { return { ...EMPTY_PROGRESS }; }
}
export function availableLetters(progress: Progress) {
  const next = LETTERS.findIndex((l) => !progress.letters.includes(l.name));
  return LETTERS.slice(0, next === -1 ? LETTERS.length : next + 1);
}
export function availableWords(progress: Progress) {
  if (progress.letters.length < 3) return [];
  return WORDS.filter((word) => [...word].every((l) => progress.letters.includes(l)));
}
export function saveProgress(progress: Progress) {
  try {
    const existing = parseProgress(localStorage.getItem(STORAGE_KEY));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parseProgress(JSON.stringify({ version: 1, letters: [...existing.letters, ...progress.letters], words: [...existing.words, ...progress.words] }))));
  } catch { /* Private/full/disabled storage: keep playing with in-memory progress. */ }
}
