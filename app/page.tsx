import Link from "next/link";

export default function Home() {
  return (
    <main className="home mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-8 px-5 py-8 sm:px-10">
      <h1 className="text-center font-black tracking-tight">
        <span className="block text-[clamp(1.75rem,4vw,3rem)]">Collins&apos;s</span>
        <span className="block text-[clamp(2.25rem,6vw,4.75rem)] leading-[1.05]">Monster Truck<br className="sm:hidden" /> Adventures</span>
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link href="/smash" className="mode-card smash-card flex min-h-[240px] flex-col items-center justify-center gap-5 rounded-[2rem] border-4 border-current p-7 text-center">
          <span aria-hidden="true" className="flex items-end gap-2 text-5xl font-black">
            <span className="number-block bg-[#f85b45] -rotate-6">1</span>
            <span className="number-block bg-[#59bbef] translate-y-[-12px]">2</span>
            <span className="number-block bg-[#ffe778] rotate-6">3</span>
          </span>
          <span className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight">Smash Mode</span>
        </Link>
        <Link href="/trace" className="mode-card trace-card flex min-h-[240px] flex-col items-center justify-center gap-5 rounded-[2rem] border-4 border-current p-7 text-center">
          <span aria-hidden="true" className="flex gap-3 text-6xl font-black"><span className="-rotate-6">L</span><span className="translate-y-[-8px]">T</span><span className="rotate-6">I</span></span>
          <span className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight">Trace &amp; Drive Mode</span>
        </Link>
      </div>
    </main>
  );
}
