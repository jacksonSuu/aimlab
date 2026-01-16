import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-zinc-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 md:pt-20">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              训练原型 · Web 版
            </p>

            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              AIMlab：FPS 瞄准与反应训练
            </h1>

            <p className="text-pretty text-lg leading-8 text-zinc-300">
              练习点击目标、反应速度、命中率统计。先把“手感”练出来，再去排位里当队友的光。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/trainer">开始训练</ButtonLink>
              <Link
                href="#modes"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white/90 hover:bg-white/10"
              >
                查看训练模式
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-zinc-400">统计</div>
                <div className="mt-1 font-semibold">RT / 命中率</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-zinc-400">训练</div>
                <div className="mt-1 font-semibold">点射 / 甩枪</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-zinc-400">扩展</div>
                <div className="mt-1 font-semibold">追踪 / 习惯</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/25 via-fuchsia-500/10 to-emerald-500/10 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-zinc-200/80">本次推荐训练</div>
                  <div className="mt-1 text-xl font-semibold">静态点击（Click）</div>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-zinc-100">
                  30s
                </span>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-zinc-200/90">
                <li>• 每次出现一个目标，尽快点击</li>
                <li>• 统计平均反应时间与命中率</li>
                <li>• 支持调整目标大小与训练时长</li>
              </ul>

              <div className="mt-6">
                <ButtonLink href="/trainer" variant="primary">
                  进入训练场
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section id="modes" className="mt-14">
          <h2 className="text-lg font-semibold">训练模式（计划）</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-medium">静态点击</div>
              <p className="mt-2 text-sm text-zinc-300">
                练“反应 + 定点命中”。适合热身与手感找回。
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-medium">移动追踪（TODO）</div>
              <p className="mt-2 text-sm text-zinc-300">
                目标持续移动，练跟枪与微调。
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-medium">甩枪/切枪（TODO）</div>
              <p className="mt-2 text-sm text-zinc-300">
                多目标快速切换，练大幅度瞄准与停枪。
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

