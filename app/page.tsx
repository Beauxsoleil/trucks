import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home relative isolate flex min-h-svh items-center justify-center overflow-hidden">
      <Image src="/assets/dirt-track.png" alt="" fill sizes="100vw" preload className="pointer-events-none -z-10 object-cover" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-10">
        <header className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border-4 bg-[#fff8e9] px-5 py-4 sm:flex-row sm:gap-6">
          <Image src="/assets/monster-truck.png" alt="A friendly orange-and-blue monster truck with smiling headlights and big tires" width={1536} height={1024} sizes="(min-width: 640px) 220px, 160px" preload className="h-auto w-40 shrink-0 sm:w-[220px]" />
          <h1 className="text-center font-black tracking-tight sm:text-left">
            <span className="block text-[clamp(1.75rem,3vw,2.5rem)]">Collins&apos;s</span>
            <span className="block text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05]">Monster Truck<br />Adventures</span>
          </h1>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link href="/smash" className="mode-card smash-card flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[2rem] border-4 border-current p-5 text-center">
            <Image src="/assets/wooden-blocks.png" alt="" width={1024} height={1536} sizes="80px" className="h-[120px] w-20 object-contain" />
            <span className="text-[clamp(2rem,3.5vw,3rem)] font-black leading-tight">Smash Mode</span>
          </Link>
          <Link href="/trace" className="mode-card trace-card flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[2rem] border-4 border-current p-5 text-center">
            <span aria-hidden="true" className="flex h-[120px] items-center justify-center gap-3 text-6xl font-black"><span className="-rotate-6">L</span><span className="translate-y-[-8px]">T</span><span className="rotate-6">I</span></span>
            <span className="text-[clamp(2rem,3.5vw,3rem)] font-black leading-tight">Trace &amp; Drive Mode</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
