const LETTER_PATHS = [
  { name: "L", paths: ["M140 70V310H290"], speech: "L. Lll, lll, lll. L as in lion." },
  { name: "T", paths: ["M110 75H310", "M210 75V315"], speech: "T. Tuh, tuh, tuh. T as in top." },
  { name: "I", paths: ["M140 75H280", "M210 75V315", "M140 315H280"], speech: "I. Ih, ih, ih. I as in it." },
  { name: "F", paths: ["M145 75V315", "M145 75H300", "M145 190H270"], speech: "F. Fff, fff, fff. F as in fish." },
  { name: "E", paths: ["M145 75V315", "M145 75H295", "M145 190H270", "M145 315H295"], speech: "E. Eh, eh, eh. E as in egg." },
  { name: "H", paths: ["M135 75V315", "M285 75V315", "M135 195H285"], speech: "H. Huh, huh, huh. H as in hat." },
  { name: "C", paths: ["M300 110C245 30 115 60 115 195C115 325 245 355 300 280"], speech: "C. Kuh, kuh, kuh. C as in cat." },
  { name: "O", paths: ["M210 65C80 65 80 325 210 325C340 325 340 65 210 65"], speech: "O. Ah, ah, ah. O as in octopus." },
  { name: "U", paths: ["M130 75V245C130 350 290 350 290 245V75"], speech: "U. Uh, uh, uh. U as in up." },
  { name: "A", paths: ["M100 315L210 70L320 315", "M145 220H275"], speech: "A. Ah, ah, ah. A as in apple." },
  { name: "B", paths: ["M130 75V315", "M130 75H205C315 75 315 195 205 195H130", "M130 195H215C330 195 330 315 215 315H130"], speech: "B. Buh, buh, buh. B as in ball." },
  { name: "D", paths: ["M130 75V315", "M130 75H180C350 75 350 315 180 315H130"], speech: "D. Duh, duh, duh. D as in dog." },
  { name: "G", paths: ["M300 110C245 30 110 60 110 195C110 325 260 350 305 265V210H225"], speech: "G. Guh, guh, guh. G as in goat." },
  { name: "J", paths: ["M125 75H300", "M265 75V255C265 340 120 350 120 260"], speech: "J. Juh, juh, juh. J as in jump." },
  { name: "K", paths: ["M135 75V315", "M300 75L135 210", "M190 165L305 315"], speech: "K. Kuh, kuh, kuh. K as in kite." },
  { name: "M", paths: ["M105 315V75L210 225L315 75V315"], speech: "M. Mmm, mmm, mmm. M as in moon." },
  { name: "N", paths: ["M120 315V75L300 315V75"], speech: "N. Nnn, nnn, nnn. N as in nest." },
  { name: "P", paths: ["M135 75V315", "M135 75H215C335 75 335 200 215 200H135"], speech: "P. Puh, puh, puh. P as in pig." },
  { name: "Q", paths: ["M210 65C80 65 80 315 210 315C340 315 340 65 210 65", "M240 255L315 330"], speech: "Q. Kwuh, kwuh, kwuh. Q as in queen." },
  { name: "R", paths: ["M135 75V315", "M135 75H215C335 75 335 195 215 195H135", "M210 195L305 315"], speech: "R. Rrr, rrr, rrr. R as in rabbit." },
  { name: "S", paths: ["M295 105C255 45 125 45 125 130C125 205 295 180 295 260C295 345 160 350 115 285"], speech: "S. Sss, sss, sss. S as in sun." },
  { name: "V", paths: ["M105 75L210 315L315 75"], speech: "V. Vvv, vvv, vvv. V as in van." },
  { name: "W", paths: ["M80 75L135 315L210 155L285 315L340 75"], speech: "W. Wuh, wuh, wuh. W as in water." },
  { name: "X", paths: ["M115 75L305 315", "M305 75L115 315"], speech: "X. Kss, kss, kss. X as in fox." },
  { name: "Y", paths: ["M110 75L210 195L310 75", "M210 195V315"], speech: "Y. Yuh, yuh, yuh. Y as in yellow." },
  { name: "Z", paths: ["M115 75H305L115 315H305"], speech: "Z. Zzz, zzz, zzz. Z as in zebra." },
] as const;
export type LetterName = typeof LETTER_PATHS[number]["name"];
export const LETTERS = [...LETTER_PATHS].sort((a, b) => a.name.localeCompare(b.name));
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
export function availableLetters() {
  return LETTERS;
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
