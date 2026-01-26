/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma, withPrisma } from "../../../middlewares/prisma.js";
import type { Next } from "hono";

// 🧠 Mock Prisma export FIRST
vi.mock("../../../src/middleware/withPrisma", async () => {
  const actual = await vi.importActual<any>(
    "../../../src/middleware/withPrisma",
  );

  return {
    ...actual,
    prisma: { __mock: "prisma-client" },
  };
});

describe("withPrisma middleware", () => {
  let next: ReturnType<typeof vi.fn<Next>>;

  beforeEach(() => {
    next = vi.fn<Next>();
  });

  it("sets prisma into context when not present", async () => {
    const set = vi.fn();
    const get = vi.fn().mockReturnValue(undefined);

    const c = { get, set } as any;

    await withPrisma(c, next);

    expect(get).toHaveBeenCalledWith("prisma");
    expect(set).toHaveBeenCalledWith("prisma", prisma);
    expect(next).toHaveBeenCalledOnce();
  });

  it("does NOT override prisma if already exists in context", async () => {
    const existingPrisma = { __existing: true };

    const set = vi.fn();
    const get = vi.fn().mockReturnValue(existingPrisma);

    const c = { get, set } as any;

    await withPrisma(c, next);

    expect(set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("always calls next()", async () => {
    const c = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    } as any;

    await withPrisma(c, next);

    expect(next).toHaveBeenCalled();
  });

  it("injects the singleton prisma instance", async () => {
    const set = vi.fn();
    const get = vi.fn().mockReturnValue(undefined);

    const c = { get, set } as any;

    await withPrisma(c, next);

    const [, injectedPrisma] = set.mock.calls[0];
    expect(injectedPrisma).toBe(prisma);
  });
});
