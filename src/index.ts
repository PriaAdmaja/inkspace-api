import { Hono } from "hono";
import { serve } from "@hono/node-server";
import routes from "./routes/index.js";
import { ContextWithPrisma } from "./types/app.js";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono<ContextWithPrisma>();

app.use(prettyJSON());
app.use("/*", cors({
  origin: (origin) => origin || "*", // Allow all origins dynamically
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.route("/", routes);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
