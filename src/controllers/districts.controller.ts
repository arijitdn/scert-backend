import type { Context } from "hono";

import { db } from "../config";

export const getAllDistricts = async (c: Context) => {
  try {
    // Get all distinct districts from the Block table
    const districts = await db.block.findMany({
      select: {
        district: true,
      },
      distinct: ["district"],
    });

    const districtData = await Promise.all(
      districts.map(async (district) => {
        // Get all blocks for this district
        const blocks = await db.block.findMany({
          where: {
            district: district.district,
          },
          select: {
            id: true,
            name: true,
            code: true,
            phone: true,
            _count: {
              select: {
                schools: true,
              },
            },
          },
        });

        return {
          id: district.district,
          name: district.district
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          blocks: blocks.map((block) => ({
            id: block.code.toString(),
            name: block.name,
            phone: block.phone,
            schoolCount: block._count.schools,
          })),
        };
      })
    );

    return c.json({
      success: true,
      total: districtData.length,
      data: districtData,
    });
  } catch (error) {
    console.error("Error fetching districts:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch districts",
      },
      500
    );
  }
};

export const getDistrictById = async (c: Context) => {
  try {
    const districtId = c.req.param("id");

    // Convert the district ID back to enum format
    const districtEnum = districtId.toUpperCase().replace(/ /g, "_");

    const blocks = await db.block.findMany({
      where: {
        district: districtEnum as any,
      },
      include: {
        _count: {
          select: {
            schools: true,
          },
        },
      },
    });

    if (blocks.length === 0) {
      return c.json(
        {
          success: false,
          error: "District not found",
        },
        404
      );
    }

    const districtData = {
      id: districtEnum,
      name: districtId
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      blocks: blocks.map((block) => ({
        id: block.code.toString(),
        name: block.name,
        phone: block.phone,
        schoolCount: block._count.schools,
      })),
    };

    return c.json({
      success: true,
      data: districtData,
    });
  } catch (error) {
    console.error("Error fetching district:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch district",
      },
      500
    );
  }
};
