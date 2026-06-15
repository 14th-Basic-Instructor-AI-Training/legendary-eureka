import { describe, expect, it } from "vitest";
import { submitReport } from "./data";
import type { ReportFormInput } from "./schema";

const valid: ReportFormInput = {
  reason: "fraud",
  description:
    "The listing advertised a private tour but it was a crowded group bus.",
  evidence: [],
};

describe("report submit — permissions", () => {
  it("a traveler can submit a report", async () => {
    const res = await submitReport("traveler", "ag-angkor", valid);
    expect(res).toEqual({ ok: true, data: { agencyId: "ag-angkor" } });
  });

  it("non-travelers are forbidden from reporting", async () => {
    for (const actor of ["guest", "agency", "admin", null] as const) {
      const res = await submitReport(actor, "ag-angkor", valid);
      expect(res).toEqual({ ok: false, error: "forbidden" });
    }
  });
});

describe("report submit — validation", () => {
  it("rejects an empty description even for a traveler", async () => {
    const res = await submitReport("traveler", "ag-angkor", {
      ...valid,
      description: "  ",
    });
    expect(res).toEqual({ ok: false, error: "invalid" });
  });
});
