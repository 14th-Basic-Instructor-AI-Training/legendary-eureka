import { describe, expect, it } from "vitest";
import {
  ROLE_FROM_API,
  ROLE_TO_API,
  apiRoleToActor,
  unwrap,
  type ApiResponse,
  type ApiRole,
} from "./response";

describe("role mapping", () => {
  it("maps every wire role to an actor", () => {
    const roles: ApiRole[] = ["ADMIN", "TOUR_AGENCY", "TRAVELER", "GUEST"];
    for (const r of roles) {
      expect(ROLE_FROM_API[r]).toBeTruthy();
      expect(apiRoleToActor(r)).toBe(ROLE_FROM_API[r]);
    }
  });

  it("GUEST maps to the guest actor", () => {
    expect(ROLE_FROM_API.GUEST).toBe("guest");
  });

  it("round-trips the three stored roles (frontend → wire → frontend)", () => {
    expect(ROLE_FROM_API[ROLE_TO_API.admin]).toBe("admin");
    expect(ROLE_FROM_API[ROLE_TO_API.agency]).toBe("agency");
    expect(ROLE_FROM_API[ROLE_TO_API.traveler]).toBe("traveler");
  });
});

describe("unwrap", () => {
  it("turns an envelope into an ok result", () => {
    const res: ApiResponse<number[]> = {
      status: 200,
      message: "OK",
      data: [1, 2, 3],
      timestamp: "2026-06-14T00:00:00.000Z",
    };
    const out = unwrap(res);
    expect(out).toEqual({ ok: true, data: [1, 2, 3] });
  });

  it("turns null into a load_failed result", () => {
    expect(unwrap(null)).toEqual({ ok: false, error: "load_failed" });
  });
});
