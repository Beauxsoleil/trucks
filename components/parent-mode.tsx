"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EMPTY_PROGRESS, STORAGE_KEY, parseProgress, type Progress } from "@/lib/trace-letters";
import { createParentHold } from "@/lib/parent-hold";
import "./parent-mode.css";

export default function ParentMode() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const hold = useRef<ReturnType<typeof createParentHold> | null>(null);
  function cancelHold() { hold.current?.cancel(); }
  function getHold() {
    hold.current ??= createParentHold(() => {
      try { setProgress(parseProgress(localStorage.getItem(STORAGE_KEY))); setStorageAvailable(true); }
      catch { setProgress(EMPTY_PROGRESS); setStorageAvailable(false); }
      setOpen(true);
    });
    return hold.current;
  }
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  useEffect(() => {
    const leave = () => { cancelHold(); setOpen(false); };
    const hidden = () => { if (document.hidden) leave(); };
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", hidden);
    return () => { cancelHold(); window.removeEventListener("blur", leave); document.removeEventListener("visibilitychange", hidden); };
  }, []);

  return <>
    <button type="button" className="parent-logo" aria-label="Truck logo: hold for parent mode" aria-haspopup="dialog" aria-expanded={open}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        getHold().start({ x: event.clientX, y: event.clientY });
      }}
      onPointerMove={(event) => { hold.current?.move({ x: event.clientX, y: event.clientY }); }}
      onPointerUp={cancelHold} onPointerCancel={cancelHold} onLostPointerCapture={cancelHold} onBlur={cancelHold}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); getHold().start(); } }}
      onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); cancelHold(); } }}>
      <Image src="/assets/monster-truck.png" alt="A friendly orange-and-blue monster truck" width={1536} height={1024} sizes="(min-width: 640px) 220px, 160px" preload draggable={false} className="h-auto w-40 sm:w-[220px]" />
    </button>
    <dialog ref={dialog} className="parent-panel" aria-labelledby="parent-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
      <h2 id="parent-title">Parent mode</h2>
      <p>A little progress, one happy drive at a time.</p>
      {storageAvailable ? <dl className="parent-progress">
        <div><dt>Letters completed</dt><dd>{progress.letters.length} / 9</dd></div>
        <div><dt>Words completed</dt><dd>{progress.words.length} / 4</dd></div>
      </dl> : <p>Saved progress isn’t available in this browser.</p>}
      {progress.letters.length > 0 && <p><strong>Letter roads:</strong> {progress.letters.join(", ")}</p>}
      {progress.words.length > 0 && <p><strong>Word roads:</strong> {progress.words.join(", ")}</p>}
      <p>Use the tablet sideways, keep the volume comfortable, and let Collins go at his own pace. Progress saves on this browser when storage is available.</p>
      <button type="button" className="parent-close" onClick={() => setOpen(false)}>Back to game</button>
    </dialog>
  </>;
}
