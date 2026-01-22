import { authHandler, initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";
import privateRoutes from "./private/index.js";
import { authConfig } from "../lib/auth.js";
import { HttpError } from "../lib/http-error.js";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { fail } from "../lib/response.js";
import { HTTPException } from "hono/http-exception";
import z from "zod";

const routes = new Hono();

routes
  .use(
    "*",
    initAuthConfig((c) => authConfig(c.env)),
  )
  .use("/auth/*", authHandler());

routes.route("/api", privateRoutes);

routes.notFound((c) => {
  return fail({ c, message: "Route not found", status: 404 });
});

routes.onError((err, c) => {
  if (err instanceof HttpError) {
    return fail({
      c,
      message: err.message,
      status: err.status as ContentfulStatusCode,
    });
  }

  // catch auth error
  if (err instanceof HTTPException && err.res?.status === 401) {
    return fail({ c, message: "Unauthorized", status: 401 });
  }

  if (err instanceof z.ZodError) {
    const errors = z.flattenError(err);
    return fail({ c, message: "Validation error", error: errors, status: 400 });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return fail({ c, message: "Internal Server Error", status: 500 });
});

routes.get("/", (c) => {
  return c.json({ message: "Hello, Welcome to Inkspace API" });
});

export default routes;
