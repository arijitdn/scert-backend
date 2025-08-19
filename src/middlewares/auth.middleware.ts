import type { Context, Next } from "hono";
import { auth } from "../config/auth.config";

export const protect = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.user) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: "User is not authenticated",
      },
      401
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

export const isState = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.user || session.user.role !== "STATE") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: "User is not an state admin",
      },
      403
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

export const isDistrict = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.user || session.user.role !== "DISTRICT") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: "User is not from district office",
      },
      403
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

export const isBlock = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.user || session.user.role !== "BLOCK") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: "User is not from block office",
      },
      403
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};
