"use client";

import {ChoiceDialog} from "./choice-dialog";
import {ChoicePager} from "./choice-pager";
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
  const [choosing,setChoosing]=useState(false),[choices,setChoices]=useState<'letters'|'words'>('letters');
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

  return <main className="trace-game fixed-trace">
    <header className="trace-header"><Link href="/" className="trace-button home-link">⌂ Home</Link><button className="trace-button" onClick={()=>setChoosing(true)}>Choose</button><button className="trace-button" onClick={()=>speak(letter.speech)}>Hear ♪</button></header>
    <div className="fixed-trace-stage"><section className="trace-summary"><h1>{word?`Write ${word}`:`Trace ${letter.name}`}</h1>
      {word&&<div className="word-tiles">{[...word].map((l,i)=><span key={i} className={`word-tile ${i<tile||(i===tile&&complete)?'tile-done':''}`} aria-current={i===tile?'step':undefined}>{l}</span>)}</div>}
      <p role="status">{complete?'Good job, Collins!':'Follow the numbered path.'}</p>
      {complete&&<div className="trace-actions">{!wordComplete&&<button className="trace-button next-road" onClick={nextRoad}>{word?'Next letter →':'Next letter →'}</button>}<button className="trace-button" onClick={()=>{if(wordComplete)setTile(0);reset()}}>Again ↻</button></div>}
    </section><TraceBoard key={`${word||'letters'}-${letter.name}-${tile}-${round}`} letter={letter} onComplete={finish}/></div>
    {choosing&&<ChoiceDialog label="Choose a tracing road" onClose={()=>setChoosing(false)}>
      <header><h2>Choose a road</h2><button autoFocus className="trace-button" onClick={()=>setChoosing(false)}>Done ✓</button></header>
      <div className="choice-tabs"><button className="trace-button" aria-pressed={choices==='letters'} onClick={()=>setChoices('letters')}>Letters</button><button className="trace-button" aria-pressed={choices==='words'} onClick={()=>setChoices('words')}>Words</button></div>
      {choices==='words'&&!words.length?<p>Trace letters to unlock their words.</p>:<ChoicePager key={choices} items={choices==='letters'?availableLetters().map(l=>({id:l.name,label:l.name+(progress.letters.includes(l.name)?' ★':'')})):words.map(w=>({id:w,label:w+(progress.words.includes(w)?' ★':'')}))} onChoose={id=>{if(choices==='letters')selectLetter(LETTERS.findIndex(l=>l.name===id));else selectWord(id);setChoosing(false)}}/>}
    </ChoiceDialog>}
  </main>;
}
