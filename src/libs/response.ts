import type { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export type Meta = {
  current_page: number;
  last_page: number;
  limit: number;
  total: number;

};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
  meta?: Meta;
};

export function ok<T>({
  c,
  data,
  message = "Success",
  status = 200,
  meta
}: {
  c: Context;
  data: T;
  message?: string;
  status?: ContentfulStatusCode;
  meta?: Meta;
}) {
  return c.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
      meta
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
