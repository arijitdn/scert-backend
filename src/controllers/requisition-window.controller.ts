import type { Context } from "hono";
import { ProfileType } from "@prisma/client";
import { db } from "../config";

export const getRequisitionWindows = async (c: Context) => {
  try {
    const windows = await db.requisitionWindow.findMany({
      where: { isActive: true },
      orderBy: { type: "asc" },
    });

    return c.json({
      success: true,
      data: windows,
    });
  } catch (error) {
    console.error("Error fetching requisition windows:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
};

export const getRequisitionWindowByType = async (c: Context) => {
  try {
    const type = c.req.param("type");

    if (!Object.values(ProfileType).includes(type as ProfileType)) {
      return c.json(
        {
          success: false,
          message: "Invalid profile type",
        },
        400
      );
    }

    const window = await db.requisitionWindow.findFirst({
      where: {
        type: type as ProfileType,
        isActive: true,
      },
    });

    return c.json({
      success: true,
      data: window,
    });
  } catch (error) {
    console.error("Error fetching requisition window:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
};

export const createOrUpdateRequisitionWindow = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { type, startDate, endDate } = body;

    if (!type || !startDate || !endDate) {
      return c.json(
        {
          success: false,
          message: "Type, start date, and end date are required",
        },
        400
      );
    }

    if (!Object.values(ProfileType).includes(type)) {
      return c.json(
        {
          success: false,
          message: "Invalid profile type",
        },
        400
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return c.json(
        {
          success: false,
          message: "Start date must be before end date",
        },
        400
      );
    }

    // Use upsert to handle create or update
    const window = await db.requisitionWindow.upsert({
      where: {
        type: type as ProfileType,
      },
      update: {
        startDate: start,
        endDate: end,
        isActive: true,
      },
      create: {
        type: type as ProfileType,
        startDate: start,
        endDate: end,
        isActive: true,
      },
    });

    return c.json(
      {
        success: true,
        data: window,
        message: "Requisition window created successfully",
      },
      201
    );
  } catch (error: any) {
    console.error("Error creating requisition window:", error);

    // Provide more specific error messages
    if (error?.code === "P2002") {
      return c.json(
        {
          success: false,
          message:
            "A requisition window with this type already exists. Please try again.",
        },
        409
      );
    }

    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
};

export const deleteRequisitionWindow = async (c: Context) => {
  try {
    const id = c.req.param("id");

    await db.requisitionWindow.update({
      where: { id },
      data: { isActive: false },
    });

    return c.json({
      success: true,
      message: "Requisition window deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting requisition window:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
};

export const checkRequisitionWindowStatus = async (c: Context) => {
  try {
    const type = c.req.param("type");

    if (!Object.values(ProfileType).includes(type as ProfileType)) {
      return c.json(
        {
          success: false,
          message: "Invalid profile type",
        },
        400
      );
    }

    const window = await db.requisitionWindow.findFirst({
      where: {
        type: type as ProfileType,
        isActive: true,
      },
    });

    if (!window) {
      return c.json({
        success: true,
        data: {
          isOpen: false,
          message: "No requisition window is currently active for this type",
        },
      });
    }

    const now = new Date();
    const isOpen = now >= window.startDate && now <= window.endDate;
    const hasStarted = now >= window.startDate;
    const hasEnded = now > window.endDate;

    return c.json({
      success: true,
      data: {
        isOpen,
        hasStarted,
        hasEnded,
        startDate: window.startDate,
        endDate: window.endDate,
        window,
        message: isOpen
          ? "Requisition window is currently open"
          : hasEnded
          ? "Requisition window has ended"
          : "Requisition window has not started yet",
      },
    });
  } catch (error) {
    console.error("Error checking requisition window status:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
};
