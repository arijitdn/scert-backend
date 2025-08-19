import type { Context } from "hono";

import { db } from "../config";

export const getAllSchools = async (c: Context) => {
  const schools = await db.school.findMany();

  const safeSchools = schools.map((school) => ({
    ...school,
    udise: school.udise?.toString(),
  }));

  return c.json({
    success: true,
    total: safeSchools.length,
    data: safeSchools,
  });
};
