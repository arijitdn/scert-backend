import type { Context } from "hono";

import { db } from "../config";

export const getAllSchools = async (c: Context) => {
  const schools = await db.school.findMany();

  return c.json({
    success: true,
    data: schools,
  });
};
