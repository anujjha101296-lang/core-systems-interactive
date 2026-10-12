import { useSyncExternalStore } from "react";

export type ProgressState = {
  lessons: Record<string, { sections: number[]; checks: Record<string, boolean>; done?: boolean }>;
  last?: { track: string; slug: string };
  interview: Record<string, number>; // chainId -> deepest rung reached
};

const KEY = "core-systems-progress-v1";
const empty: ProgressState = { lessons: {}, interview: {} };
let state: ProgressState = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}
function save(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useProgress() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => {
      load();
      return state;
    },
    () => empty,
  );
}

const key = (track: string, slug: string) => `${track}/${slug}`;

function lesson(track: string, slug: string) {
  load();
  return state.lessons[key(track, slug)] ?? { sections: [], checks: {} };
}

export const progress = {
  visit(track: string, slug: string) {
    load();
    if (state.last?.track === track && state.last.slug === slug) return;
    save({ ...state, last: { track, slug } });
  },
  markSection(track: string, slug: string, n: number) {
    const l = lesson(track, slug);
    if (l.sections.includes(n)) return;
    save({ ...state, lessons: { ...state.lessons, [key(track, slug)]: { ...l, sections: [...l.sections, n] } } });
  },
  markCheck(track: string, slug: string, id: string, ok: boolean) {
    const l = lesson(track, slug);
    if (l.checks[id] === true) return;
    save({ ...state, lessons: { ...state.lessons, [key(track, slug)]: { ...l, checks: { ...l.checks, [id]: ok } } } });
  },
  toggleDone(track: string, slug: string) {
    const l = lesson(track, slug);
    save({ ...state, lessons: { ...state.lessons, [key(track, slug)]: { ...l, done: !l.done } } });
  },
  interview(chain: string, rung: number) {
    load();
    if ((state.interview[chain] ?? -1) >= rung) return;
    save({ ...state, interview: { ...state.interview, [chain]: rung } });
  },
  reset() {
    save({ ...empty, lessons: {}, interview: {} });
  },
};

export function lessonStatus(s: ProgressState, track: string, slug: string) {
  const l = s.lessons[key(track, slug)];
  if (!l) return 0;
  if (l.done) return 1;
  return Math.min(0.95, l.sections.length / 9);
}