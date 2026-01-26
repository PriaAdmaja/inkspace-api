/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { register } from "../../../features/users/me/me.controller.js";
import * as meRepository from "../../../features/users/me/me.repository.js";

vi.mock("../../../features/users/me/me.repository.js");

vi.mock("../../../libs/hash.js", () => ({
  comparePassword: vi.fn(),
  encryptPassword: vi.fn(),
}));

describe("me controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a new user", async () => {
    const body = {
      email: "test@example.com",
      password: "password",
    };

    const mockUser = {
      id: "1",
      email: "test@example.com",
      username: "testuser",
      avatar: null,
      about: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock repository functions
    vi.mocked(meRepository.getMe).mockResolvedValue(null);
    vi.mocked(meRepository.register).mockResolvedValue(mockUser);

    const prisma = {} as any;

    const mockJsonResponse = {
      success: true,
      message: "Success",
      data: mockUser,
    };

    const c = {
      req: {
        json: vi.fn().mockResolvedValue(body),
      },
      get: vi.fn().mockReturnValue(prisma),
      json: vi.fn().mockReturnValue(mockJsonResponse),
    } as any;

    const result = await register(c);

    expect(meRepository.getMe).toHaveBeenCalledWith(prisma, body.email);
    expect(meRepository.register).toHaveBeenCalledWith(prisma, body);
    expect(c.json).toHaveBeenCalledWith(
      {
        success: true,
        message: "Success",
        data: mockUser,
        meta: undefined,
      },
      200,
    );
    expect(result).toEqual(mockJsonResponse);
  });

  it("should return 409 if user already exists", async () => {
    const body = {
      email: "test@example.com",
      password: "password",
    };

    const mockUser = {
      id: "1",
      email: "test@example.com",
      username: "testuser",
      avatar: null,
      about: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock repository functions
    vi.mocked(meRepository.getMe).mockResolvedValue(mockUser);
    vi.mocked(meRepository.register).mockResolvedValue(mockUser);

    const prisma = {} as any;

    const mockJsonResponse = {
      success: false,
      message: "User already exists",
      data: null,
    };

    const c = {
      req: {
        json: vi.fn().mockResolvedValue(body),
      },
      get: vi.fn().mockReturnValue(prisma),
      json: vi.fn().mockReturnValue(mockJsonResponse),
    } as any;

    const result = await register(c);

    expect(meRepository.getMe).toHaveBeenCalledWith(prisma, body.email);
    expect(meRepository.register).not.toHaveBeenCalled(); // Should NOT call register when user exists
    expect(c.json).toHaveBeenCalledWith(
      {
        success: false,
        message: "User already exists",
        error: undefined,
      },
      409,
    );
    expect(result).toEqual(mockJsonResponse);
  });
});
