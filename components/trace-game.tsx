"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { TraceBoard } from "@/components/trace-board";
import { LETTERS, STORAGE_KEY, availableLetters, availableWords, parseProgress, saveProgress, type Progress } from "@/lib/trace-letters";
import "./trace-game.css";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function snapshot() { try { return localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; } }
function speak(text: string) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  } catch { /* Letter, completion, and word remain visible without speech. */ }
}

export default function TraceGame() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return raw === null ? <main className="trace-loading">Starting your letter road…</main> : <TraceSession initialProgress={parseProgress(raw)} />;
}

function TraceSession({ initialProgress }: { initialProgress: Progress }) {
  const [progress, setProgress] = useState(initialProgress);
  const [letterIndex, setLetterIndex] = useState(() => Math.max(0, LETTERS.findIndex((l) => !initialProgress.letters.includes(l.name))));
  const [word, setWord] = useState<string | null>(null);
  const [tile, setTile] = useState(0);
  const [round, setRound] = useState(0);
  const [complete, setComplete] = useState(false);
  const [wordComplete, setWordComplete] = useState(false);
  const words = availableWords(progress);
  const letter = word ? LETTERS.find((l) => l.name === word[tile])! : LETTERS[letterIndex];
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function reset() {
    window.speechSynthesis?.cancel();
    setComplete(false); setWordComplete(false); setRound((n) => n + 1);
  }
  function selectLetter(index: number) { reset(); setWord(null); setLetterIndex(index); }
  function selectWord(value: string) { reset(); setTile(0); setWord(value); }
  function finish() {
    if (complete) return;
    setComplete(true);
    const isLast = word !== null && tile === word.length - 1;
    const next: Progress = { version: 1, letters: [...new Set([...progress.letters, letter.name])], words: isLast ? [...new Set([...progress.words, word])] : progress.words };
    setProgress(next); saveProgress(next);
    if (isLast) {
      setWordComplete(true);
      speak(`Good job, Collins! ${letter.speech} ${word.split("").join(". ")}. ${word.toLowerCase()}!`);
    } else speak(`Good job, Collins! ${letter.speech}`);
  }
  function nextRoad() {
    if (word) { reset(); setTile((i) => i + 1); }
    else selectLetter((letterIndex + 1) % LETTERS.length);
  }

  return <main className="trace-game">
    <header className="trace-header"><Link href="/" className="trace-button home-link">⌂ Home</Link><h1>Trace &amp; Drive</h1></header>
    <div className="trace-layout">
      <section className="trace-controls" aria-label="Choose a letter road">
        <h2>{word ? `Let’s write ${word}!` : `Drive along ${letter.name}`}</h2>
        {word ? <div className={`word-road ${wordComplete ? "word-finished" : ""}`} aria-label={`Word ${word}`}>
          <div className="word-tiles">{[...word].map((l, i) => <span key={i} className={`word-tile ${i < tile || (i === tile && complete) ? "tile-done" : ""}`} aria-current={i === tile ? "step" : undefined}>{l}</span>)}</div>
          {wordComplete && <Image src="/assets/monster-truck.png" alt="Truck driving across the completed word" width={1536} height={1024} sizes="80px" className="word-truck" />}
        </div> : <div className="letter-choices">{availableLetters().map((l, i) => <button type="button" key={l.name} className="letter-choice" aria-label={`Practice ${l.name}`} aria-pressed={i === letterIndex} onClick={() => selectLetter(i)}>{l.name}<span aria-hidden="true">{progress.letters.includes(l.name) ? "★" : ""}</span></button>)}</div>}
        <button type="button" className="trace-button hear-letter" onClick={() => speak(letter.speech)}>Hear {letter.name} ♪</button>
        <p className="trace-status" role="status">{complete ? wordComplete ? `${word}! Good job, Collins!` : `${letter.name}! Good job, Collins!` : "Start at the number. Follow the arrow."}</p>
        {complete && <div className="trace-actions">
          {!wordComplete && <button type="button" className="trace-button next-road" onClick={nextRoad}>{word ? "Next letter →" : letterIndex === LETTERS.length - 1 ? "Back to A →" : `Next: ${LETTERS[letterIndex + 1].name} →`}</button>}
          <button type="button" className="trace-button" onClick={() => { if (wordComplete) setTile(0); reset(); }}>{wordComplete ? "Write it again ↻" : "Drive again ↻"}</button>
        </div>}
        {words.length > 0 && <section className="word-choices" aria-label="Word Mode"><h3>Word roads</h3><div>{words.map((w) => <button type="button" key={w} className="trace-button" aria-pressed={word === w} onClick={() => selectWord(w)}>{w}{progress.words.includes(w) ? " ★" : ""}</button>)}</div></section>}
        {word && <button type="button" className="trace-button" onClick={() => selectLetter(letterIndex)}>Letter roads</button>}
      </section>
      <TraceBoard key={`${word || "letters"}-${letter.name}-${tile}-${round}`} letter={letter} onComplete={finish} />
    </div>
  </main>;
}
