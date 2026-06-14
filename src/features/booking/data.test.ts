import { describe, expect, it } from "vitest";
import { computePricing, deriveTimeline, makeBookingReference } from "./data";

describe("booking pricing", () => {
  it("scales the subtotal by traveler count and adds the flat platform fee", () => {
    const p = computePricing(45, 3, 12);
    expect(p.subtotal).toBe(135);
    expect(p.fee).toBe(12);
    expect(p.total).toBe(147);
  });
});

describe("booking reference", () => {
  it("matches the JLT-4### format", () => {
    expect(makeBookingReference()).toMatch(/^JLT-4\d{3}$/);
  });
});

describe("booking status timeline", () => {
  it("marks pending-review current while the booking is pending", () => {
    const steps = deriveTimeline("pending");
    expect(steps.map((s) => s.state)).toEqual([
      "done",
      "current",
      "upcoming",
      "upcoming",
    ]);
  });

  it("marks the decision current once approved", () => {
    const decision = deriveTimeline("approved").find(
      (s) => s.key === "decision",
    );
    expect(decision?.state).toBe("current");
  });

  it("flags the decision rejected when the agency declines", () => {
    const decision = deriveTimeline("rejected").find(
      (s) => s.key === "decision",
    );
    expect(decision?.state).toBe("rejected");
  });

  it("flags the decision rejected when the traveler cancels", () => {
    const decision = deriveTimeline("cancelled").find(
      (s) => s.key === "decision",
    );
    expect(decision?.state).toBe("rejected");
  });

  it("marks every step done once completed", () => {
    const steps = deriveTimeline("completed");
    expect(steps.every((s) => s.state === "done")).toBe(true);
  });
});
