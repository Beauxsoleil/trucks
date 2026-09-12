import Link from "next/link";

export function ModeShell({ title, symbol, tone }: { title: string; symbol: string; tone: "smash" | "trace" }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <h1 className="text-4xl font-black sm:text-6xl">{title}</h1>
      <div className={`${tone}-card w-full rounded-[2rem] border-4 p-10`}>
        <div aria-hidden="true" className="mb-6 text-7xl font-black">{symbol}</div>
        <p className="text-3xl font-bold sm:text-4xl">Adventure coming soon!</p>
      </div>
      <Link href="/" className="rounded-3xl border-4 bg-[#ffe778] px-10 py-6 text-3xl font-black">Back home</Link>
    </main>
  );
}
