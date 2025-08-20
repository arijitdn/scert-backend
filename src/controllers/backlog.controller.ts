import type { Context } from "hono";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllBacklogEntries = async (c: Context) => {
  try {
    const { type, userId } = c.req.query();

    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const backlogEntries = await prisma.backlogEntry.findMany({
      where,
      include: {
        book: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      total: backlogEntries.length,
      data: backlogEntries,
    });
  } catch (error) {
    console.error("Error fetching backlog entries:", error);
    return c.json({ error: "Failed to fetch backlog entries" }, 500);
  }
};

export const getBacklogEntryById = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const backlogEntry = await prisma.backlogEntry.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });

    if (!backlogEntry) {
      return c.json({ error: "Backlog entry not found" }, 404);
    }

    return c.json(backlogEntry);
  } catch (error) {
    console.error("Error fetching backlog entry:", error);
    return c.json({ error: "Failed to fetch backlog entry" }, 500);
  }
};

export const createBacklogEntry = async (c: Context) => {
  try {
    const { bookId, type, userId, quantity } = await c.req.json();

    if (!bookId || !type || !userId || quantity === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if entry already exists for this combination
    const existingEntry = await prisma.backlogEntry.findFirst({
      where: {
        bookId,
        type,
        userId,
      },
    });

    if (existingEntry) {
      // Update existing entry
      const updatedEntry = await prisma.backlogEntry.update({
        where: { id: existingEntry.id },
        data: { quantity },
        include: {
          book: true,
        },
      });
      return c.json(updatedEntry);
    } else {
      // Create new entry
      const newEntry = await prisma.backlogEntry.create({
        data: {
          bookId,
          type,
          userId,
          quantity,
        },
        include: {
          book: true,
        },
      });
      return c.json(newEntry, 201);
    }
  } catch (error) {
    console.error("Error creating backlog entry:", error);
    return c.json({ error: "Failed to create backlog entry" }, 500);
  }
};

export const updateBacklogEntry = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { bookId, type, userId, quantity } = await c.req.json();

    const updatedEntry = await prisma.backlogEntry.update({
      where: { id },
      data: {
        ...(bookId && { bookId }),
        ...(type && { type }),
        ...(userId && { userId }),
        ...(quantity !== undefined && { quantity }),
      },
      include: {
        book: true,
      },
    });

    return c.json(updatedEntry);
  } catch (error) {
    console.error("Error updating backlog entry:", error);
    return c.json({ error: "Failed to update backlog entry" }, 500);
  }
};

export const deleteBacklogEntry = async (c: Context) => {
  try {
    const { id } = c.req.param();

    await prisma.backlogEntry.delete({
      where: { id },
    });

    return c.json({ message: "Backlog entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting backlog entry:", error);
    return c.json({ error: "Failed to delete backlog entry" }, 500);
  }
};

export const getBacklogEntriesByType = async (c: Context) => {
  try {
    const { type } = c.req.param();
    const { userId } = c.req.query();

    const where: any = { type };
    if (userId) where.userId = userId;

    const backlogEntries = await prisma.backlogEntry.findMany({
      where,
      include: {
        book: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      total: backlogEntries.length,
      data: backlogEntries,
    });
  } catch (error) {
    console.error("Error fetching backlog entries by type:", error);
    return c.json({ error: "Failed to fetch backlog entries" }, 500);
  }
};
