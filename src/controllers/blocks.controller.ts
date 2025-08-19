import type { Context } from "hono";

import { db } from "../config";

export const getAllBlocks = async (c: Context) => {
  try {
    const districtParam = c.req.query("district");

    let whereClause = {};
    if (districtParam) {
      // Convert district name to enum format
      const districtEnum = districtParam.toUpperCase().replace(/ /g, "_");
      whereClause = { district: districtEnum as any };
    }

    const blocks = await db.block.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            schools: true,
          },
        },
      },
    });

    const blockData = blocks.map((block) => ({
      id: block.code.toString(),
      name: block.name,
      district: block.district
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      phone: block.phone,
      schoolCount: block._count.schools,
    }));

    return c.json({
      success: true,
      total: blockData.length,
      data: blockData,
    });
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch blocks",
      },
      500
    );
  }
};

export const getBlockById = async (c: Context) => {
  try {
    const blockId = c.req.param("id");

    const block = await db.block.findUnique({
      where: {
        code: parseInt(blockId),
      },
      include: {
        schools: {
          select: {
            id: true,
            name: true,
            udise: true,
            category: true,
            management: true,
            type: true,
          },
        },
        _count: {
          select: {
            schools: true,
          },
        },
      },
    });

    if (!block) {
      return c.json(
        {
          success: false,
          error: "Block not found",
        },
        404
      );
    }

    const blockData = {
      id: block.code.toString(),
      name: block.name,
      district: block.district
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      phone: block.phone,
      schoolCount: block._count.schools,
      schools: block.schools.map((school) => ({
        id: school.id,
        name: school.name,
        udise: school.udise.toString(),
        category: school.category,
        management: school.management,
        type: school.type,
      })),
    };

    return c.json({
      success: true,
      data: blockData,
    });
  } catch (error) {
    console.error("Error fetching block:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch block",
      },
      500
    );
  }
};

export const updateBlockPassword = async (c: Context) => {
  try {
    const blockId = c.req.param("id");
    const { password } = await c.req.json();

    if (!password) {
      return c.json(
        {
          success: false,
          error: "Password is required",
        },
        400
      );
    }

    const updatedBlock = await db.block.update({
      where: {
        code: parseInt(blockId),
      },
      data: {
        password: password,
      },
    });

    return c.json({
      success: true,
      message: "Block password updated successfully",
      data: {
        id: updatedBlock.code.toString(),
        name: updatedBlock.name,
      },
    });
  } catch (error) {
    console.error("Error updating block password:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update block password",
      },
      500
    );
  }
};
