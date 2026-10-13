import { osLessons } from "./os";
import { cnLessons } from "./cn";
import { dlLessons } from "./digital-logic";
import { combinationalLesson } from "./dl-combinational";
import { expandedLessons, enrichLesson } from "./expanded";
import type { Lesson, TrackId } from "./types";

export type Track = { id: TrackId; name: string; short: string; tag: string; blurb: string; planned: number; lessons: Lesson[] };

export const tracks: Record<TrackId, Track> = {
  os: { id: "os", name: "Operating Systems", tag: "Track I", short: "OS", planned: 0, blurb: "Processes, scheduling, synchronization, memory — the machine beneath every service.", lessons: [...osLessons, ...expandedLessons.filter(l => l.track === "os")].map(enrichLesson) },
  cn: { id: "cn", name: "Computer Networks", tag: "Track II", short: "Networks", planned: 0, blurb: "From a typed URL to packets on a wire — DNS, TCP, TLS, routing, QUIC.", lessons: [...cnLessons, ...expandedLessons.filter(l => l.track === "cn")].map(enrichLesson) },
  "digital-logic": { id: "digital-logic", name: "Digital Logic", short: "Logic", tag: "Track III", planned: 18, blurb: "Bits, gates, Boolean algebra, combinational and sequential circuits — the hardware vocabulary under every instruction.", lessons: [...dlLessons, combinationalLesson] },
  architecture: { id: "architecture", name: "Computer Architecture", short: "Architecture", tag: "Track IV", planned: 14, blurb: "ISAs, datapaths, pipelining, caches and memory hierarchy — how a program actually executes on a CPU.", lessons: [] },
};

/** Display order of tracks. */
export const trackOrder: TrackId[] = ["os", "cn", "digital-logic", "architecture"];

/** Prerequisite chain shown on the Learning Path page. Networks is standalone. */
export const learningPath: { chain: TrackId[]; standalone: TrackId[] } = { chain: ["digital-logic", "architecture", "os"], standalone: ["cn"] };

/** Progress fraction 0..1 for a track; safe for empty tracks (never NaN). */
export function trackFraction(lessons: Lesson[], status: (slug: string) => number) {
  if (lessons.length === 0) return 0;
  return lessons.reduce((a, l) => a + status(l.slug), 0) / lessons.length;
}

export function getLesson(track: string, slug: string) {
  const t = tracks[track as TrackId];
  return t?.lessons.find((l) => l.slug === slug);
}

export const labIndex: { id: string; name: string; track: TrackId; slug: string }[] = [
  { id: "ctxswitch", name: "Context-switch overhead", track: "os", slug: "context-switching" },
  { id: "scheduler", name: "CPU scheduling Gantt", track: "os", slug: "cpu-scheduling" },
  { id: "vm", name: "Virtual memory & TLB", track: "os", slug: "virtual-memory" },
  { id: "prodcons", name: "Producer–consumer buffer", track: "os", slug: "producer-consumer" },
  { id: "race", name: "Race interleavings", track: "os", slug: "race-conditions" },
  { id: "deadlock", name: "Resource-allocation graph", track: "os", slug: "deadlocks" },
  { id: "cas", name: "CAS / ABA", track: "os", slug: "cas-aba" },
  { id: "handshake", name: "TCP handshake timeline", track: "cn", slug: "tcp-handshake" },
  { id: "dns", name: "DNS hierarchy", track: "cn", slug: "dns" },
  { id: "lifecycle", name: "Request lifecycle", track: "cn", slug: "url-lifecycle" },
  { id: "cidr", name: "CIDR calculator", track: "cn", slug: "cidr-subnetting" },
  { id: "cwnd", name: "Congestion window", track: "cn", slug: "congestion-control" },
  { id: "nat", name: "NAT & routing hops", track: "cn", slug: "nat" },
  { id: "quic", name: "TLS / QUIC handshake RTTs", track: "cn", slug: "quic" },
  { id: "baseconv", name: "Base converter", track: "digital-logic", slug: "number-systems" },
  { id: "twos", name: "Two's complement & flags", track: "digital-logic", slug: "twos-complement" },
  { id: "ieee", name: "IEEE-754 float32", track: "digital-logic", slug: "fixed-ieee754" },
  { id: "boolean", name: "Boolean expression & truth table", track: "digital-logic", slug: "boolean-gates" },
  { id: "kmap", name: "Karnaugh map & minimiser", track: "digital-logic", slug: "karnaugh-maps" },
  { id: "combinational", name: "Combinational building blocks", track: "digital-logic", slug: "combinational-building-blocks" },
];

export type { Lesson, TrackId };
export type { LessonRef } from "./types";