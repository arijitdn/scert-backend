import type { Context } from "hono";

import { db } from "../config";

export const getAllStock = async (c: Context) => {
  try {
    const typeParam = c.req.query("type");
    const userIdParam = c.req.query("userId");

    let whereClause: any = {};

    if (typeParam) {
      whereClause.type = typeParam;
    }

    if (userIdParam) {
      whereClause.userId = userIdParam;
    }

    const stock = await db.stock.findMany({
      where: whereClause,
      include: {
        book: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      total: stock.length,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch stock",
      },
      500
    );
  }
};

export const getStockById = async (c: Context) => {
  try {
    const stockId = c.req.param("id");

    const stock = await db.stock.findUnique({
      where: {
        id: stockId,
      },
      include: {
        book: true,
      },
    });

    if (!stock) {
      return c.json(
        {
          success: false,
          error: "Stock item not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching stock item:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch stock item",
      },
      500
    );
  }
};

export const createStock = async (c: Context) => {
  try {
    const { bookId, userId, type, quantity } = await c.req.json();

    if (!bookId || !userId || !type || quantity === undefined) {
      return c.json(
        {
          success: false,
          error: "All fields are required",
        },
        400
      );
    }

    const stock = await db.stock.create({
      data: {
        bookId,
        userId,
        type,
        quantity: parseInt(quantity),
      },
      include: {
        book: true,
      },
    });

    return c.json({
      success: true,
      message: "Stock created successfully",
      data: stock,
    });
  } catch (error) {
    console.error("Error creating stock:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create stock",
      },
      500
    );
  }
};

export const updateStock = async (c: Context) => {
  try {
    const stockId = c.req.param("id");
    const { quantity } = await c.req.json();

    if (quantity === undefined) {
      return c.json(
        {
          success: false,
          error: "Quantity is required",
        },
        400
      );
    }

    const stock = await db.stock.update({
      where: {
        id: stockId,
      },
      data: {
        quantity: parseInt(quantity),
      },
      include: {
        book: true,
      },
    });

    return c.json({
      success: true,
      message: "Stock updated successfully",
      data: stock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update stock",
      },
      500
    );
  }
};

export const deleteStock = async (c: Context) => {
  try {
    const stockId = c.req.param("id");

    await db.stock.delete({
      where: {
        id: stockId,
      },
    });

    return c.json({
      success: true,
      message: "Stock deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete stock",
      },
      500
    );
  }
};

export const getStateStock = async (c: Context) => {
  try {
    const stock = await db.stock.findMany({
      where: {
        type: "STATE",
      },
      include: {
        book: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      total: stock.length,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching state stock:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch state stock",
      },
      500
    );
  }
};

export const getStockBySchool = async (c: Context) => {
  try {
    const schoolUdise = c.req.param("schoolUdise");

    const stock = await db.stock.findMany({
      where: {
        userId: schoolUdise,
        type: "SCHOOL",
      },
      include: {
        book: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      total: stock.length,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching school stock:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch school stock",
      },
      500
    );
  }
};
