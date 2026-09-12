"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SmashAudio } from "@/lib/smash-audio";
import "./smash-game.css";

type Phase = "ready" | "revving" | "driving" | "celebrating";
const COLORS = ["#f34b42", "#389ff4", "#ffe43b"];

export default function SmashGame() {
  const [phase, setPhase] = useState<Phase>("ready");
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audio = useRef<SmashAudio | null>(null);

  useEffect(() => {
    audio.current = new SmashAudio();
    const reset = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      busy.current = false;
      audio.current?.stop();
      window.speechSynthesis?.cancel();
      setPhase("ready");
    };
    const visibility = () => { if (document.hidden) reset(); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      timers.current.forEach(clearTimeout);
      audio.current?.dispose();
      window.speechSynthesis?.cancel();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  function start() {
    if (busy.current) return;
    busy.current = true;
    audio.current?.unlock();
    audio.current?.play("rev");
    setPhase("revving");
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    later(() => {
      setPhase("driving");
      audio.current?.stop();
      audio.current?.play("engine", 0.28);
    }, 350);
    later(() => {
      setPhase("celebrating");
      audio.current?.stop();
      audio.current?.play("crash", 0.35);
      if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
        window.speechSynthesis.cancel();
        const words = new SpeechSynthesisUtterance("Three blocks!");
        words.lang = "en-US";
        words.rate = 0.85;
        try { window.speechSynthesis.speak(words); } catch { /* The visible count stays available. */ }
      }
    }, 1300);
    later(() => {
      audio.current?.stop();
      timers.current = [];
      busy.current = false;
      setPhase("ready");
    }, 3300);
  }

  return (
    <main className="smash-game" data-phase={phase} onPointerDown={(event) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest("a")) return;
      start();
    }}>
      <Image src="/assets/dirt-track.png" alt="" fill sizes="100vw" preload className="smash-backdrop" />
      <header className="smash-header">
        <Link href="/" className="smash-home" aria-label="Back home">⌂ Home</Link>
        <h1>Smash Mode</h1>
      </header>
      <button type="button" className="smash-play" aria-label="Smash three blocks" onClick={(event) => { if (event.detail === 0) start(); }}>
        <span className="smash-prompt" aria-hidden="true">{phase === "ready" ? "Tap to smash!" : phase === "celebrating" ? "Three blocks!" : "Here we go!"}</span>
        <span className="smash-world" aria-hidden="true">
          <span className="smash-truck-lane"><span className="smash-truck">
            <Image src="/assets/monster-truck.png" alt="" width={1536} height={1024} sizes="(min-width: 1000px) 320px, 32vw" preload draggable={false} />
          </span></span>
          <span className="smash-stack">
            {COLORS.map((color, i) => <span key={color} className={`smash-block block-${i}`} style={{ backgroundColor: color }} />)}
          </span>
          {phase === "celebrating" && <span className="smash-confetti">
            {Array.from({ length: 24 }, (_, i) => <span key={i} style={{ "--x": `${(i % 8 - 3.5) * 34}px`, "--y": `${-70 - (i % 5) * 28}px`, "--turn": `${i * 71}deg`, backgroundColor: COLORS[i % 3], animationDelay: `${i % 3 * 35}ms` } as CSSProperties} />)}
          </span>}
        </span>
        {phase === "celebrating" && <span className="smash-count" aria-hidden="true">3</span>}
      </button>
      <p className="sr-only" role="status" aria-live="polite">{phase === "celebrating" ? "Three blocks!" : phase === "ready" ? "Ready to smash three blocks." : "Truck driving."}</p>
    </main>
  );
}
