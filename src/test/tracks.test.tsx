import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { tracks, trackFraction, getLesson } from "@/content";
import { lessonStatus } from "@/lib/progress";
import { routeTree } from "@/routeTree.gen";

describe("tracks", () => {
  it("registers Digital Logic with 19 planned lessons and Architecture with 14", () => {
    expect(tracks["digital-logic"].planned).toBe(19);
    expect(tracks.architecture.planned).toBe(14);
  });
  it("empty track progress is 0, never NaN", () => {
    expect(trackFraction([], () => 1)).toBe(0);
  });
  it("existing OS/CN lessons still resolve", () => {
    expect(getLesson("os", "context-switching")).toBeDefined();
    expect(getLesson("cn", "dns")).toBeDefined();
  });
  it("old progress shape still parses with track/slug keys", () => {
    const old = { lessons: { "os/context-switching": { sections: [1, 2, 3], checks: {}, done: true } }, interview: {} };
    expect(lessonStatus(old, "os", "context-switching")).toBe(1);
    expect(lessonStatus(old, "digital-logic", "context-switching")).toBe(0);
  });
  it("routes match for new tracks and the learning path", () => {
    const r = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(r.matchRoutes("/track/digital-logic").at(-1)?.routeId).toBe("/track/$track");
    expect(r.matchRoutes("/learning-path").at(-1)?.routeId).toBe("/learning-path");
  });
});