import type { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown
};

export function ok<T>({
  c,
  data,
  message = "Success",
  status = 200,
}: {
  c: Context;
  data: T;
  message?: string;
  status?: ContentfulStatusCode;
}) {
  return c.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
    },
    status,
  );
}

export function fail({
  c,
  message,
  error,
  status = 400,
}: {
  c: Context;
  message: string;
  error?: unknown
  status?: ContentfulStatusCode;
}) {
  return c.json<ApiResponse<null>>(
    {
      success: false,
      message,
      error
    },
    status,
  );
}
