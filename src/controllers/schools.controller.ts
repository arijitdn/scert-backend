import type { Context } from "hono";

import { db } from "../config";

export const getAllSchools = async (c: Context) => {
  try {
    const districtParam = c.req.query("district");
    const blockParam = c.req.query("block");

    let whereClause: any = {};

    if (districtParam) {
      whereClause.district = districtParam;
    }

    if (blockParam) {
      whereClause.block_name = blockParam;
    }

    const schools = await db.school.findMany({
      where: whereClause,
      include: {
        Block: {
          select: {
            name: true,
            district: true,
          },
        },
      },
    });

    const safeSchools = schools.map((school) => ({
      ...school,
      udise: school.udise?.toString(),
      district:
        school.Block?.district
          ?.replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || school.district,
      block: school.Block?.name || school.block_name,
    }));

    return c.json({
      success: true,
      total: safeSchools.length,
      data: safeSchools,
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch schools",
      },
      500
    );
  }
};

export const getSchoolById = async (c: Context) => {
  try {
    const schoolId = c.req.param("id");

    const school = await db.school.findUnique({
      where: {
        id: schoolId,
      },
      include: {
        Block: {
          select: {
            name: true,
            district: true,
          },
        },
      },
    });

    if (!school) {
      return c.json(
        {
          success: false,
          error: "School not found",
        },
        404
      );
    }

    const safeSchool = {
      ...school,
      udise: school.udise?.toString(),
      district:
        school.Block?.district
          ?.replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || school.district,
      block: school.Block?.name || school.block_name,
    };

    return c.json({
      success: true,
      data: safeSchool,
    });
  } catch (error) {
    console.error("Error fetching school:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch school",
      },
      500
    );
  }
};

export const getSchoolByUdise = async (c: Context) => {
  try {
    const udise = c.req.param("udise");

    const school = await db.school.findUnique({
      where: {
        udise: BigInt(udise),
      },
      include: {
        Block: {
          select: {
            name: true,
            district: true,
          },
        },
      },
    });

    if (!school) {
      return c.json(
        {
          success: false,
          error: "School not found",
        },
        404
      );
    }

    const safeSchool = {
      ...school,
      udise: school.udise?.toString(),
      district:
        school.Block?.district
          ?.replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || school.district,
      block: school.Block?.name || school.block_name,
    };

    return c.json({
      success: true,
      data: safeSchool,
    });
  } catch (error) {
    console.error("Error fetching school:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch school",
      },
      500
    );
  }
};
