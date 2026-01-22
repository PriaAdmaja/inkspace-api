import { Hono } from "hono";
import { serve } from "@hono/node-server";
import routes from "./routes/index.js";
import { ContextWithPrisma } from "./types/app.js";

const app = new Hono<ContextWithPrisma>();

app.route("/", routes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
