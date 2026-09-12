"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SmashAudio } from "@/lib/smash-audio";
import type { createDriveWorld } from "@/lib/drive-world";
import "./smash-game.css";

type World = ReturnType<typeof createDriveWorld>;
export default function SmashGame() {
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<World | null>(null);
  const audio = useRef<SmashAudio | null>(null);
  const inputs = useRef(new Set<string>());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [gas, setGas] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [attempt, setAttempt] = useState(0);

  function accelerate(id: string, down: boolean) {
    if (!world.current) return;
    if (down) inputs.current.add(id); else inputs.current.delete(id);
    const pressed = inputs.current.size > 0;
    world.current.gas(pressed); setGas(pressed);
    if (down) { audio.current?.unlock(); audio.current?.play("rev", 0.18); }
    if (!pressed) audio.current?.stop();
  }
  function jump() { audio.current?.unlock(); world.current?.jump(); }

  useEffect(() => {
    let disposed = false;
    const activeInputs = inputs.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    audio.current = new SmashAudio();
    const fail = () => { if (!disposed) { setFailed(true); setReady(false); inputs.current.clear(); setGas(false); audio.current?.stop(); } };
    void import("@/lib/drive-world").then(({ createDriveWorld }) => {
      if (disposed || !host.current) return;
      world.current = createDriveWorld(host.current, () => {
        setCelebrating(true); clearTimeout(timer);
        audio.current?.play("crash", 0.25);
        try {
          if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance("Three blocks! Great driving, Collins!");
            speech.lang = "en-US"; speech.rate = 0.85; window.speechSynthesis.speak(speech);
          }
        } catch { /* The visible celebration remains available. */ }
        timer = setTimeout(() => setCelebrating(false), 2300);
      }, fail);
      setReady(true);
    }).catch(fail);
    const stop = () => {
      inputs.current.clear(); world.current?.pause(true); setGas(false);
      audio.current?.stop(); window.speechSynthesis?.cancel();
    };
    const resume = () => { if (!document.hidden) world.current?.pause(false); };
    const visibility = () => { if (document.hidden) stop(); else resume(); };
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("a,button,input,textarea,select")) return;
      if (event.code === "ArrowUp" || event.code === "KeyW") { event.preventDefault(); if (!event.repeat) accelerate(event.code, true); }
      if (event.code === "Space") { event.preventDefault(); if (!event.repeat) jump(); }
    };
    const keyup = (event: KeyboardEvent) => { if (event.code === "ArrowUp" || event.code === "KeyW") accelerate(event.code, false); };
    window.addEventListener("keydown", keydown); window.addEventListener("keyup", keyup);
    window.addEventListener("blur", stop); window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true; clearTimeout(timer); activeInputs.clear();
      world.current?.dispose(); world.current = null; audio.current?.dispose(); window.speechSynthesis?.cancel();
      window.removeEventListener("keydown", keydown); window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", stop); window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [attempt]);

  return <main className="drive-game">
    <div className="drive-world" ref={host} />
    <header className="drive-header"><Link href="/" className="drive-home">⌂ Home</Link><h1>3D Truck Playground</h1></header>
    <p className={`drive-message ${celebrating ? "drive-celebrate" : ""}`} role="status">{celebrating ? "3 blocks! Great driving, Collins! ★" : "Hold Gas to drive. Tap Jump to fly!"}</p>
    {!ready && <div className="drive-loading" role="status">{failed ? <><h2>The truck needs a restart</h2><p>Try again, or enjoy a letter road.</p><button onClick={() => { setFailed(false); setAttempt((n) => n + 1); }}>Try again ↻</button><Link href="/trace">Play letter roads →</Link></> : "Getting your truck ready…"}</div>}
    <div className="drive-pedals" aria-label="Truck controls">
      <button type="button" className="drive-jump" disabled={!ready} aria-label="Jump" onPointerDown={(event) => { if (event.button === 0) { event.preventDefault(); jump(); } }} onClick={(event) => { if (event.detail === 0) jump(); }}><span aria-hidden="true">↟</span>Jump</button>
      <button type="button" className="drive-gas" disabled={!ready} aria-label="Gas: hold to drive" aria-pressed={gas}
        onPointerDown={(event) => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); accelerate(`pointer-${event.pointerId}`, true); }}
        onPointerUp={(event) => accelerate(`pointer-${event.pointerId}`, false)} onPointerCancel={(event) => accelerate(`pointer-${event.pointerId}`, false)} onLostPointerCapture={(event) => accelerate(`pointer-${event.pointerId}`, false)}
        onKeyDown={(event) => { if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); if (!event.repeat) accelerate("button-key", true); } }}
        onKeyUp={(event) => { if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); accelerate("button-key", false); } }}
        onBlur={() => accelerate("button-key", false)}><span aria-hidden="true">▰</span>Gas</button>
    </div>
  </main>;
}
