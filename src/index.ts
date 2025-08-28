import "./config/compress.config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { compress } from "hono/compress";

import { errorHandler, notFound } from "./middlewares";
import schools from "./routes/schools.route";
import districts from "./routes/districts.route";
import blocks from "./routes/blocks.route";
import books from "./routes/books.route";
import requisitions from "./routes/requisitions.route";
import stock from "./routes/stock.route";
import echallan from "./routes/echallan.route";
import issues from "./routes/issues.route";
import notifications from "./routes/notifications.route";
import { auth } from "./config";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>({ strict: false });

const port = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE || "/api/v1";

app.use(logger());
app.use(
  compress({
    encoding: "gzip",
  })
);
app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    maxAge: 86400,
  })
);

app.get("/", (c) => {
  return c.json({
    message: "Welcome to SCERT Backend API",
  });
});

app.all("/api/auth/*", async (c) => {
  return await auth.handler(c.req.raw);
});

app.route(API_BASE + "/schools", schools);
app.route(API_BASE + "/districts", districts);
app.route(API_BASE + "/blocks", blocks);
app.route(API_BASE + "/books", books);
app.route(API_BASE + "/requisitions", requisitions);
app.route(API_BASE + "/stock", stock);
app.route(API_BASE + "/echallans", echallan);
app.route(API_BASE + "/issues", issues);
app.route(API_BASE + "/notifications", notifications);

app.onError(errorHandler);
app.notFound(notFound);

export default {
  port,
  fetch: app.fetch,
};
