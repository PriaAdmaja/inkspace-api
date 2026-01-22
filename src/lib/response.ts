import type { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
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
  error,
  status = 400,
}: {
  c: Context;
  error: string;
  status?: ContentfulStatusCode;
}) {
  return c.json<ApiResponse<null>>(
    {
      success: false,
      error,
    },
    status,
  );
}
