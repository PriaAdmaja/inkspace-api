/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { authChecker } from "../../../middlewares/authChecker.js";
import { HttpError } from "../../../libs/http-error.js";

describe("authChecker middleware", () => {
  it("throws HttpError(401) when authUser is missing", () => {
    const c = {
      get: vi.fn().mockReturnValue(null),
    } as any;

    const next = vi.fn();

    expect(() => authChecker(c, next)).toThrow(HttpError);

    try {
      authChecker(c, next);
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(err.message).toBe("Unauthorized");
    }

    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when authUser exists", async () => {
    const c = {
      get: vi.fn().mockReturnValue({
        id: "1",
        email: "user@test.com",
      }),
    } as any;

    const next = vi.fn().mockResolvedValue(undefined);

    await authChecker(c, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
