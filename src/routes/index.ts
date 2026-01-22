import { authHandler, initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";
import privateRoutes from "./private/index.js";
import { authConfig } from "../lib/auth.js";
import { HttpError } from "../lib/http-error.js";
import { ContentfulStatusCode } from "hono/utils/http-status";

const routes = new Hono()

routes.use(
    "*",
    initAuthConfig((c) => authConfig(c.env)),
  )
  .use("/auth/*", authHandler());

routes.route("/api", privateRoutes);

routes.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json(
      { success: false, error: err.message },
      err.status as ContentfulStatusCode
    )
  }

  console.error(err)
  return c.json(
    { success: false, error: "Internal Server Error" },
    500
  )
})


routes.get("/", (c) => {
  return c.json({ message: "Hello, Welcome to Inkspace API" });
});

export default routes;
