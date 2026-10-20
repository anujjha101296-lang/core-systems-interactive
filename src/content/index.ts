import { osLessons } from "./os";
import { cnLessons } from "./cn";
import { dlLessons } from "./digital-logic";
import { combinationalLesson } from "./dl-combinational";
import { sequentialLesson } from "./dl-sequential";
import { registersLesson } from "./dl-registers";
import { fsmLesson } from "./dl-fsm";
import { timingLesson } from "./dl-timing";
import { architectureFoundationsLesson } from "./architecture-foundations";
import { datapathLesson } from "./architecture-datapath";
import { performanceLesson } from "./architecture-performance";
import { pipelineLesson } from "./architecture-pipeline";
import { cacheLesson } from "./architecture-cache";
import { virtualMemoryLesson } from "./architecture-vm";
import { coherenceLesson } from "./architecture-coherence";
import { ioLesson } from "./architecture-io";
import { dramLesson } from "./architecture-dram";
import { vectorLesson } from "./architecture-vector";
import { memoryConsistencyLesson } from "./architecture-memory-consistency";
import { gpuLesson } from "./architecture-gpu";
import { scalabilityLesson } from "./architecture-scalability";
import { architectureCapstoneLesson } from "./architecture-capstone";
import { branchPredictionLesson } from "./architecture-branch-prediction";
import { expandedLessons, enrichLesson } from "./expanded";
import type { Lesson, TrackId } from "./types";

export type Track = { id: TrackId; name: string; short: string; tag: string; blurb: string; planned: number; lessons: Lesson[] };

export const tracks: Record<TrackId, Track> = {
  os: { id: "os", name: "Operating Systems", tag: "Track I", short: "OS", planned: 0, blurb: "Processes, scheduling, synchronization, memory — the machine beneath every service.", lessons: [...osLessons, ...expandedLessons.filter(l => l.track === "os")].map(enrichLesson) },
  cn: { id: "cn", name: "Computer Networks", tag: "Track II", short: "Networks", planned: 0, blurb: "From a typed URL to packets on a wire — DNS, TCP, TLS, routing, QUIC.", lessons: [...cnLessons, ...expandedLessons.filter(l => l.track === "cn")].map(enrichLesson) },
  "digital-logic": { id: "digital-logic", name: "Digital Logic", short: "Logic", tag: "Track III", planned: 18, blurb: "Bits, gates, Boolean algebra, combinational and sequential circuits — the hardware vocabulary under every instruction.", lessons: [...dlLessons, combinationalLesson, sequentialLesson, registersLesson, fsmLesson, timingLesson] },
  architecture: { id: "architecture", name: "Computer Architecture", short: "Architecture", tag: "Track IV", planned: 14, blurb: "ISAs, datapaths, pipelining, caches and memory hierarchy — how a program actually executes on a CPU.", lessons: [architectureFoundationsLesson, datapathLesson, performanceLesson, pipelineLesson, cacheLesson, virtualMemoryLesson, coherenceLesson, ioLesson, dramLesson, vectorLesson, memoryConsistencyLesson, gpuLesson, scalabilityLesson, architectureCapstoneLesson, branchPredictionLesson] },
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
  { id: "sequential", name: "Sequential logic foundations", track: "digital-logic", slug: "sequential-foundations" },
  { id: "registers", name: "Registers, shift registers & counters", track: "digital-logic", slug: "registers-shift-registers-counters" },
  { id: "fsm", name: "FSM & sequence detector", track: "digital-logic", slug: "finite-state-machines" },
  { id: "timing", name: "Timing, hazards & reliability", track: "digital-logic", slug: "timing-hazards-reliable-design" },
  { id: "archisa", name: "ISA & instruction encoding", track: "architecture", slug: "architecture-foundations-isa" },
  { id: "archdatapath", name: "Single-cycle datapath & control", track: "architecture", slug: "single-cycle-datapath-control" },
  { id: "archperf", name: "CPU performance & Amdahl’s law", track: "architecture", slug: "cpu-performance-cpi-amdahl" },
  { id: "archpipeline", name: "Pipeline hazards & forwarding", track: "architecture", slug: "pipeline-hazards-forwarding" },
  { id: "archcache", name: "Cache mapping & AMAT", track: "architecture", slug: "cache-mapping-amat" },
  { id: "archvm", name: "Virtual memory & TLB", track: "architecture", slug: "virtual-memory-tlb" },
  { id: "archcoherence", name: "Multicore cache coherence (MSI)", track: "architecture", slug: "multicore-cache-coherence-msi" },
  { id: "archio", name: "I/O, interrupts & DMA", track: "architecture", slug: "io-interrupts-dma" },
  { id: "archdram", name: "DRAM row buffers & timing", track: "architecture", slug: "dram-memory-system-timing" },
  { id: "archvector", name: "SIMD & vector execution", track: "architecture", slug: "simd-vector-execution" },
  { id: "archconsistency", name: "Memory consistency & ordering", track: "architecture", slug: "memory-consistency-ordering" },
  { id: "archgpu", name: "GPU SIMT & memory coalescing", track: "architecture", slug: "gpu-simt-coalescing-divergence" },
  { id: "archscale", name: "Multicore scaling & false sharing", track: "architecture", slug: "multicore-scalability-contention" },
  { id: "archcapstone", name: "Architecture performance capstone", track: "architecture", slug: "architecture-performance-capstone" },
  { id: "archbranch", name: "Branch prediction & control hazards", track: "architecture", slug: "branch-prediction-control-hazards" },
];

export type { Lesson, TrackId };
export type { LessonRef } from "./types";