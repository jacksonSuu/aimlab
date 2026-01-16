"use client";

import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/Button";

type RunState = "idle" | "running" | "finished";

type TrainerMode = "click-1" | "multi-3" | "multi-6";

type Target = {
  id: string;
  x: number;
  y: number;
  spawnedAt: number;
};

type AimRunSummary = {
  hits: number;
  misses: number;
  accuracy: number; // 0..1
  avgReactionMs: number | null;
  bestReactionMs: number | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatMs(ms: number | null) {
  if (ms === null) return "-";
  return `${Math.round(ms)} ms`;
}

export function TrainerClient() {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<RunState>("idle");

  const [state, setState] = useState<RunState>("idle");
  const [mode, setMode] = useState<TrainerMode>("click-1");
  const [durationSec, setDurationSec] = useState<number>(30);
  const [targetSizePx, setTargetSizePx] = useState<number>(52);
  const [interTargetDelayMs, setInterTargetDelayMs] = useState<number>(150);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [timeLeftMs, setTimeLeftMs] = useState<number>(durationSec * 1000);
  const [targets, setTargets] = useState<Target[]>([]);

  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const summary: AimRunSummary = useMemo(() => {
    const totalShots = hits + misses;
    const accuracy = totalShots === 0 ? 0 : hits / totalShots;
    const avgReactionMs =
      reactionTimes.length === 0
        ? null
        : reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    const bestReactionMs = reactionTimes.length === 0 ? null : Math.min(...reactionTimes);
    return {
      hits,
      misses,
      accuracy,
      avgReactionMs,
      bestReactionMs,
    };
  }, [hits, misses, reactionTimes]);

  const reactionMedian = useMemo(() => median(reactionTimes), [reactionTimes]);

  const targetCount = useMemo(() => {
    if (mode === "multi-3") return 3;
    if (mode === "multi-6") return 6;
    return 1;
  }, [mode]);

  const modeLabel = useMemo(() => {
    if (mode === "multi-3") return "三目标";
    if (mode === "multi-6") return "六目标";
    return "静态点击";
  }, [mode]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  function randomId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function getArenaMetrics() {
    const arena = arenaRef.current;
    if (!arena) return null;
    const rect = arena.getBoundingClientRect();
    const hudRect = hudRef.current?.getBoundingClientRect() ?? null;
    const padding = 8;
    const size = targetSizePx;

    // 避免目标生成在顶部 HUD 之下
    const topInset = hudRect ? Math.max(0, hudRect.bottom - rect.top) : 0;
    const minX = padding;
    const maxX = Math.max(padding, rect.width - size - padding);
    const minY = padding + topInset + 8;
    const maxY = Math.max(minY, rect.height - size - padding);
    return { size, minX, maxX, minY, maxY };
  }

  function isOverlapping(a: { x: number; y: number }, b: { x: number; y: number }, size: number) {
    const ax = a.x + size / 2;
    const ay = a.y + size / 2;
    const bx = b.x + size / 2;
    const by = b.y + size / 2;
    const dx = ax - bx;
    const dy = ay - by;
    // 半径近似，给一点间距
    const minDist = size * 1.1;
    return dx * dx + dy * dy < minDist * minDist;
  }

  function genTarget(existing: Target[]): Target | null {
    const metrics = getArenaMetrics();
    if (!metrics) return null;
    const { size, minX, maxX, minY, maxY } = metrics;

    const tries = 50;
    for (let i = 0; i < tries; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      const pos = { x, y };

      const ok = existing.every((t) => !isOverlapping(pos, t, size));
      if (ok) {
        return {
          id: randomId(),
          x,
          y,
          spawnedAt: performance.now(),
        };
      }
    }

    // 兜底：放不下也别卡住
    return {
      id: randomId(),
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
      spawnedAt: performance.now(),
    };
  }

  function fillTargets(count: number) {
    setTargets(() => {
      const next: Target[] = [];
      for (let i = 0; i < count; i++) {
        const t = genTarget(next);
        if (t) next.push(t);
      }
      return next;
    });
  }

  function spawnOneTarget() {
    setTargets((prev) => {
      const t = genTarget(prev);
      if (!t) return prev;
      return [...prev, t];
    });
  }

  function reset() {
    setState("idle");
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setTargets([]);
    setTimeLeftMs(durationSec * 1000);
  }

  function start() {
    reset();
    setState("running");
    setTimeLeftMs(durationSec * 1000);
    setShowSettings(false);
    // 等一帧，让 arena 渲染完
    requestAnimationFrame(() => {
      fillTargets(targetCount);
    });
  }

  function stop() {
    setState("finished");
    setTargets([]);
  }

  // 倒计时
  useEffect(() => {
    if (state !== "running") return;

    const startedAt = performance.now();
    const totalMs = durationSec * 1000;

    const id = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const left = clamp(totalMs - elapsed, 0, totalMs);
      setTimeLeftMs(left);
      if (left <= 0) {
        window.clearInterval(id);
        stop();
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [state, durationSec]);

  function onArenaPointerDown() {
    // 点在目标以外视为 miss（目标有 stopPropagation）
    if (state !== "running") return;
    setMisses((m) => m + 1);
  }

  function onTargetPointerDown(e: PointerEvent, t: Target) {
    e.stopPropagation();
    if (state !== "running") return;

    setHits((h) => h + 1);
    const rt = e.timeStamp - t.spawnedAt;
    setReactionTimes((prev) => [...prev, rt]);

    // 命中后移除该目标，延迟补一个新的（保持目标数量恒定）
    setTargets((prev) => prev.filter((x) => x.id !== t.id));
    window.setTimeout(() => {
      if (stateRef.current !== "running") return;
      spawnOneTarget();
    }, clamp(interTargetDelayMs, 0, 2000));
  }

  const displayTimeLeftMs = state === "running" ? timeLeftMs : durationSec * 1000;
  const timeLeftSec = Math.ceil(displayTimeLeftMs / 1000);

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-50">
      {/* Fullscreen arena */}
      <div
        ref={arenaRef}
        onPointerDown={onArenaPointerDown}
        className="absolute inset-0 select-none overflow-hidden bg-[radial-gradient(1200px_circle_at_50%_-20%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(900px_circle_at_80%_10%,rgba(16,185,129,0.14),transparent_45%),radial-gradient(900px_circle_at_10%_10%,rgba(236,72,153,0.12),transparent_45%)] cursor-crosshair touch-none"
      >
        {/* Center crosshair */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-white/20" />
          <div className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-white/20" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
        </div>

        {state !== "running" ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div className="max-w-md rounded-3xl border border-white/10 bg-black/35 px-6 py-5 backdrop-blur">
              <div className="text-base font-semibold">{modeLabel} · Trainer</div>
              <div className="mt-2 text-sm text-zinc-300">
                目标会随机出现。尽快点击它。点击空白处（训练中）会记为 miss。
              </div>
              <div className="mt-3 text-xs text-zinc-400">
                右上角可调整时长 / 目标大小 / 间隔。
              </div>
            </div>
          </div>
        ) : null}

        {state === "running"
          ? targets.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-label="target"
                onPointerDown={(e) => onTargetPointerDown(e, t)}
                className="absolute rounded-full border border-white/20 bg-indigo-500/80 shadow-[0_0_0_6px_rgba(99,102,241,0.18)] transition-transform active:scale-95"
                style={{
                  width: `${targetSizePx}px`,
                  height: `${targetSizePx}px`,
                  left: `${t.x}px`,
                  top: `${t.y}px`,
                }}
              >
                <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
              </button>
            ))
          : null}
      </div>

      {/* Floating HUD */}
      <div className="fixed inset-x-0 top-0 z-20 p-3 sm:p-4">
        <div
          ref={hudRef}
          className="mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-3xl border border-white/10 bg-black/40 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 hover:bg-white/10"
              title="返回首页"
            >
              ← AIMlab
            </Link>
            <div className="hidden text-xs text-zinc-400 sm:block">
              状态：<span className="text-zinc-200">{state}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-zinc-400">模式</span>
              <span className="font-medium text-zinc-100">{modeLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-zinc-400">剩余</span>
              <span className="tabular-nums font-medium text-zinc-100">{timeLeftSec}s</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-zinc-400">命中/失误</span>
              <span className="tabular-nums font-medium text-zinc-100">
                {hits}/{misses}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-zinc-400">命中率</span>
              <span className="tabular-nums font-medium text-zinc-100">
                {Math.round(summary.accuracy * 100)}%
              </span>
            </span>
            <span className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 sm:inline-flex">
              <span className="text-zinc-400">平均反应</span>
              <span className="tabular-nums font-medium text-zinc-100">
                {formatMs(summary.avgReactionMs)}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {state !== "running" ? (
              <Button onClick={start} variant="primary">
                {state === "finished" ? "再来一局" : "开始"}
              </Button>
            ) : (
              <Button onClick={stop} variant="danger">
                停止
              </Button>
            )}
            <Button
              onClick={reset}
              variant="secondary"
              disabled={state === "running"}
              title={state === "running" ? "训练中无法重置设置" : "重置统计"}
            >
              重置
            </Button>
            <Button
              onClick={() => setShowSettings((v) => !v)}
              variant="secondary"
              disabled={state === "running"}
              title={state === "running" ? "训练中无法调整设置" : "调整训练参数"}
            >
              设置
            </Button>
          </div>
        </div>

        {showSettings ? (
          <div className="mx-auto mt-3 w-full max-w-6xl rounded-3xl border border-white/10 bg-black/45 p-4 text-sm backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <label className="text-sm text-zinc-300" htmlFor="mode">
                  目标数量
                </label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TrainerMode)}
                  className="h-10 w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-indigo-400/60"
                >
                  <option value="click-1">1</option>
                  <option value="multi-3">3</option>
                  <option value="multi-6">6</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <label className="text-sm text-zinc-300" htmlFor="duration">
                  时长（秒）
                </label>
                <input
                  id="duration"
                  type="number"
                  min={5}
                  max={180}
                  value={durationSec}
                  disabled={state === "running"}
                  onChange={(e) => setDurationSec(clamp(Number(e.target.value || 0), 5, 180))}
                  className="h-10 w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-indigo-400/60"
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <label className="text-sm text-zinc-300" htmlFor="size">
                  目标大小（px）
                </label>
                <input
                  id="size"
                  type="number"
                  min={18}
                  max={120}
                  value={targetSizePx}
                  disabled={state === "running"}
                  onChange={(e) => setTargetSizePx(clamp(Number(e.target.value || 0), 18, 120))}
                  className="h-10 w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-indigo-400/60"
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <label className="text-sm text-zinc-300" htmlFor="delay">
                  目标间隔（ms）
                </label>
                <input
                  id="delay"
                  type="number"
                  min={0}
                  max={2000}
                  value={interTargetDelayMs}
                  disabled={state === "running"}
                  onChange={(e) =>
                    setInterTargetDelayMs(clamp(Number(e.target.value || 0), 0, 2000))
                  }
                  className="h-10 w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-indigo-400/60"
                />
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-zinc-300 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-zinc-400">最佳反应</span>
                <span className="tabular-nums font-medium text-zinc-100">
                  {formatMs(summary.bestReactionMs)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-zinc-400">中位数反应</span>
                <span className="tabular-nums font-medium text-zinc-100">
                  {formatMs(reactionMedian)}
                </span>
              </div>
              <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-400 sm:flex sm:items-center sm:justify-between">
                <span>提示</span>
                <span className="text-zinc-200">下一步可做 Tracking</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
