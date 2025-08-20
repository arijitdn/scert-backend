import type { Context } from "hono";

import { db } from "../config";

export const getAllRequisitions = async (c: Context) => {
  try {
    const schoolIdParam = c.req.query("schoolId");
    const statusParam = c.req.query("status");

    let whereClause: any = {};

    if (schoolIdParam) {
      whereClause.schoolId = schoolIdParam;
    }

    if (statusParam) {
      whereClause.status = statusParam;
    }

    const requisitions = await db.requisition.findMany({
      where: whereClause,
      include: {
        book: true,
        school: {
          include: {
            Block: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRequisitions = requisitions.map((req) => ({
      ...req,
      school: {
        ...req.school,
        udise: req.school.udise.toString(),
      },
    }));

    return c.json({
      success: true,
      total: formattedRequisitions.length,
      data: formattedRequisitions,
    });
  } catch (error) {
    console.error("Error fetching requisitions:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch requisitions",
      },
      500
    );
  }
};

export const getRequisitionById = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");

    const requisition = await db.requisition.findUnique({
      where: {
        id: requisitionId,
      },
      include: {
        book: true,
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    if (!requisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    const formattedRequisition = {
      ...requisition,
      school: {
        ...requisition.school,
        udise: requisition.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error fetching requisition:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch requisition",
      },
      500
    );
  }
};

export const createRequisition = async (c: Context) => {
  try {
    const { schoolId, bookId, quantity, reqId } = await c.req.json();

    if (!schoolId || !bookId || !quantity || !reqId) {
      return c.json(
        {
          success: false,
          error: "School ID, Book ID, quantity, and reqId are required",
        },
        400
      );
    }

    const requisition = await db.requisition.create({
      data: {
        schoolId,
        bookId,
        quantity: parseInt(quantity),
        received: 0,
        reqId,
        status: "PENDING",
      },
      include: {
        book: true,
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    const formattedRequisition = {
      ...requisition,
      school: {
        ...requisition.school,
        udise: requisition.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      message: "Requisition created successfully",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error creating requisition:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create requisition",
      },
      500
    );
  }
};

export const updateRequisition = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { quantity, received, status, remarksByBlock, remarksByDistrict } =
      await c.req.json();

    const updateData: any = {};

    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (received !== undefined) updateData.received = parseInt(received);
    if (status !== undefined) updateData.status = status;
    if (remarksByBlock !== undefined)
      updateData.remarksByBlock = remarksByBlock;
    if (remarksByDistrict !== undefined)
      updateData.remarksByDistrict = remarksByDistrict;

    const requisition = await db.requisition.update({
      where: {
        id: requisitionId,
      },
      data: updateData,
      include: {
        book: true,
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    const formattedRequisition = {
      ...requisition,
      school: {
        ...requisition.school,
        udise: requisition.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      message: "Requisition updated successfully",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error updating requisition:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update requisition",
      },
      500
    );
  }
};

export const deleteRequisition = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");

    await db.requisition.delete({
      where: {
        id: requisitionId,
      },
    });

    return c.json({
      success: true,
      message: "Requisition deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting requisition:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete requisition",
      },
      500
    );
  }
};

export const getRequisitionsBySchool = async (c: Context) => {
  try {
    const schoolId = c.req.param("schoolId");

    const requisitions = await db.requisition.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
        book: true,
        school: {
          include: {
            Block: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRequisitions = requisitions.map((req) => ({
      ...req,
      school: {
        ...req.school,
        udise: req.school.udise.toString(),
      },
    }));

    return c.json({
      success: true,
      total: formattedRequisitions.length,
      data: formattedRequisitions,
    });
  } catch (error) {
    console.error("Error fetching school requisitions:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch school requisitions",
      },
      500
    );
  }
};

export const getRequisitionsByBlock = async (c: Context) => {
  try {
    const blockCode = c.req.param("blockCode");

    const requisitions = await db.requisition.findMany({
      where: {
        school: {
          block_code: parseInt(blockCode),
        },
      },
      include: {
        book: true,
        school: {
          include: {
            Block: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRequisitions = requisitions.map((req) => ({
      ...req,
      school: {
        ...req.school,
        udise: req.school.udise.toString(),
      },
    }));

    return c.json({
      success: true,
      total: formattedRequisitions.length,
      data: formattedRequisitions,
    });
  } catch (error) {
    console.error("Error fetching block requisitions:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch block requisitions",
      },
      500
    );
  }
};
