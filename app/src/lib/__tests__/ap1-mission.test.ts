import { describe, expect, it } from "vitest";

import {
  buildDailyMission,
  calculateReadiness,
  calculateReviewSchedule,
  calculateTopicPriority,
  calculateXp,
  daysUntilExam,
} from "../ap1-mission";
import type { Topic } from "../ap1-topics";

const topic: Topic = {
  id: "subnetting",
  name: "Subnetting / IPv4",
  rel: 5,
  prio: "A",
  kind: "calc",
  hint: "Maske, Netz, Broadcast, Hosts",
};

describe("calculateTopicPriority", () => {
  it("priorisiert ein schwaches, überfälliges A-Thema höher als ein sicher beherrschtes Thema", () => {
    const now = new Date("2026-09-14T12:00:00.000Z");
    const weak = calculateTopicPriority(
      topic,
      {
        topic_id: topic.id,
        richtig: 2,
        falsch: 6,
        updated_at: "2026-09-01T12:00:00.000Z",
        confidence_score: 0.2,
        streak: 0,
        next_review_at: "2026-09-10T12:00:00.000Z",
        last_seen_at: "2026-09-01T12:00:00.000Z",
        xp: 20,
      },
      4,
      now,
    );
    const strong = calculateTopicPriority(
      topic,
      {
        topic_id: topic.id,
        richtig: 18,
        falsch: 2,
        updated_at: "2026-09-14T09:00:00.000Z",
        confidence_score: 0.95,
        streak: 8,
        next_review_at: "2026-09-21T12:00:00.000Z",
        last_seen_at: "2026-09-14T09:00:00.000Z",
        xp: 240,
      },
      0,
      now,
    );

    expect(weak.score).toBeGreaterThan(strong.score);
    expect(weak.reasons).toContain("hohe Fehlerquote");
    expect(weak.reasons).toContain("Wiederholung fällig");
    expect(strong.score).toBeLessThan(0.45);
  });
});

describe("calculateReviewSchedule", () => {
  it("wiederholt Fehler in der Session und plant danach den nächsten Tag", () => {
    const now = new Date("2026-09-14T12:00:00.000Z");
    const schedule = calculateReviewSchedule(false, "sure", 4, now);

    expect(schedule.repeatInSession).toBe(true);
    expect(schedule.nextReviewAt.toISOString()).toBe("2026-09-15T12:00:00.000Z");
    expect(schedule.nextStreak).toBe(0);
  });

  it("staffelt sichere richtige Antworten über 1, 3, 7 und 14 Tage", () => {
    const now = new Date("2026-09-14T12:00:00.000Z");
    expect(calculateReviewSchedule(true, "sure", 0, now).intervalDays).toBe(1);
    expect(calculateReviewSchedule(true, "sure", 1, now).intervalDays).toBe(3);
    expect(calculateReviewSchedule(true, "sure", 2, now).intervalDays).toBe(7);
    expect(calculateReviewSchedule(true, "sure", 8, now).intervalDays).toBe(14);
    expect(calculateReviewSchedule(true, "guessed", 8, now).intervalDays).toBe(1);
  });
});

describe("calculateXp", () => {
  it("vergibt XP nach Aufgabentyp und reduziert geratenes Wissen", () => {
    expect(calculateXp(true, "sure", "quick")).toBe(10);
    expect(calculateXp(true, "sure", "calculation")).toBe(20);
    expect(calculateXp(true, "sure", "boss")).toBe(50);
    expect(calculateXp(true, "guessed", "calculation")).toBe(10);
    expect(calculateXp(false, "sure", "boss")).toBe(0);
  });
});

describe("calculateReadiness", () => {
  it("gewichtet nur echte Ergebnisse und behandelt ungesehene Themen als nicht bereit", () => {
    const result = calculateReadiness([topic, { ...topic, id: "raid", name: "RAID", rel: 3 }], {
      subnetting: {
        topic_id: "subnetting",
        richtig: 9,
        falsch: 1,
        updated_at: "2026-09-14T09:00:00.000Z",
        confidence_score: 0.9,
        streak: 4,
        next_review_at: null,
        last_seen_at: "2026-09-14T09:00:00.000Z",
        xp: 100,
      },
    });

    expect(result.score).toBe(56);
    expect(result.coverage).toBe(0.63);
  });
});

describe("buildDailyMission", () => {
  it("wählt die drei höchsten Prioritäten und leitet eine reale Dauer ab", () => {
    const priorities = [
      { ...calculateTopicPriority(topic, undefined, 0), score: 0.9 },
      {
        ...calculateTopicPriority({ ...topic, id: "raid", name: "RAID" }, undefined, 0),
        score: 0.8,
      },
      {
        ...calculateTopicPriority(
          { ...topic, id: "sicherheit", name: "IT-Sicherheit", kind: "card" },
          undefined,
          0,
        ),
        score: 0.7,
      },
      {
        ...calculateTopicPriority({ ...topic, id: "strom", name: "Strom" }, undefined, 0),
        score: 0.2,
      },
    ];

    const mission = buildDailyMission(priorities);
    expect(mission.items.map((item) => item.topic.id)).toEqual([
      "subnetting",
      "raid",
      "sicherheit",
    ]);
    expect(mission.estimatedMinutes).toBe(29);
  });
});

describe("daysUntilExam", () => {
  it("klemmt den Countdown nach dem Prüfungstag auf null", () => {
    expect(daysUntilExam(new Date("2026-09-14T12:00:00+02:00"))).toBe(16);
    expect(daysUntilExam(new Date("2026-10-01T12:00:00+02:00"))).toBe(0);
  });
});
