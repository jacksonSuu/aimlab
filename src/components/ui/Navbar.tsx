import Link from "next/link";

function LogoMark() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/25">
      <span className="text-sm font-semibold text-indigo-200">AI</span>
    </div>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">AIMlab</div>
            <div className="text-xs text-zinc-400">Aim & Reaction Trainer</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/trainer"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
          >
            训练场
          </Link>
          <a
            href="https://steamcommunity.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 md:inline-flex"
          >
            灵感来源（Steam）
          </a>
        </nav>
      </div>
    </header>
  );
}
