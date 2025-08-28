import { Hono } from "hono";
import {
  PrismaClient,
  NotificationType,
  NotificationPriority,
  ProfileType,
} from "@prisma/client";

const prisma = new PrismaClient();

export const notificationsController = new Hono();

// Generate unique notification ID
const generateNotificationId = () => {
  const prefix = "NOT";
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Get all notifications for a user based on their level and ID
notificationsController.get("/", async (c) => {
  try {
    const {
      userLevel,
      userId,
      schoolId,
      blockCode,
      districtCode,
      page = "1",
      limit = "20",
      unreadOnly,
    } = c.req.query();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause based on user level
    let whereClause: any = {
      isActive: true,
      OR: [],
    };

    // Add expiry filter
    whereClause.OR.push({
      expiresAt: {
        gte: new Date(),
      },
    });
    whereClause.OR.push({
      expiresAt: null,
    });

    // Target based on user level
    switch (userLevel?.toUpperCase()) {
      case "SCHOOL":
        whereClause.OR = [
          { targetSchools: true },
          { specificSchoolIds: { has: schoolId } },
        ];
        break;
      case "BLOCK":
        whereClause.OR = [
          { targetBlocks: true },
          { specificBlockCodes: { has: parseInt(blockCode || "0") } },
        ];
        break;
      case "DISTRICT":
        whereClause.OR = [
          { targetDistricts: true },
          { specificDistrictCodes: { has: parseInt(districtCode || "0") } },
        ];
        break;
      case "STATE":
        whereClause.OR = [{ targetStates: true }];
        break;
      default:
        return c.json({ error: "Invalid user level" }, 400);
    }

    // If unreadOnly is true, filter for unread notifications
    if (unreadOnly === "true" && userId) {
      whereClause.NOT = {
        readBy: {
          some: {
            userId: userId,
          },
        },
      };
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        readBy: {
          where: {
            userId: userId || "",
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip: offset,
      take: limitNum,
    });

    const total = await prisma.notification.count({
      where: whereClause,
    });

    // Add isRead field to each notification
    const notificationsWithReadStatus = notifications.map((notification) => ({
      ...notification,
      isRead: notification.readBy.length > 0,
    }));

    return c.json({
      success: true,
      data: {
        notifications: notificationsWithReadStatus,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Create a new notification (only for STATE, DISTRICT, BLOCK levels)
notificationsController.post("/", async (c) => {
  try {
    const {
      title,
      message,
      type = "INFO",
      priority = "MEDIUM",
      sentBy,
      sentFrom,
      targetSchools = false,
      targetBlocks = false,
      targetDistricts = false,
      targetStates = false,
      specificSchoolIds = [],
      specificBlockCodes = [],
      specificDistrictCodes = [],
      expiresAt,
    } = await c.req.json();

    // Validate sender permissions
    const senderLevel = sentFrom?.toUpperCase();
    if (!["STATE", "DISTRICT", "BLOCK"].includes(senderLevel)) {
      return c.json(
        {
          success: false,
          error:
            "Only STATE, DISTRICT, and BLOCK levels can send notifications",
        },
        403
      );
    }

    // Validate targeting - ensure sender can only send to lower levels
    const invalidTargets = [];
    if (senderLevel === "BLOCK") {
      if (targetBlocks || targetDistricts || targetStates) {
        invalidTargets.push("BLOCK level can only send to SCHOOL level");
      }
    } else if (senderLevel === "DISTRICT") {
      if (targetDistricts || targetStates) {
        invalidTargets.push(
          "DISTRICT level can only send to BLOCK and SCHOOL levels"
        );
      }
    }
    // STATE can send to all levels

    if (invalidTargets.length > 0) {
      return c.json(
        {
          success: false,
          error: "Invalid target levels",
          details: invalidTargets,
        },
        400
      );
    }

    if (!title || !message) {
      return c.json(
        {
          success: false,
          error: "Title and message are required",
        },
        400
      );
    }

    const notificationId = generateNotificationId();

    const notification = await prisma.notification.create({
      data: {
        notificationId,
        title,
        message,
        type: type as NotificationType,
        priority: priority as NotificationPriority,
        sentBy,
        sentFrom: sentFrom as ProfileType,
        targetSchools,
        targetBlocks,
        targetDistricts,
        targetStates,
        specificSchoolIds,
        specificBlockCodes,
        specificDistrictCodes,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return c.json({
      success: true,
      data: notification,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Mark notification as read
notificationsController.post("/:id/read", async (c) => {
  try {
    const notificationId = c.req.param("id");
    const { userId, userLevel } = await c.req.json();

    if (!userId || !userLevel) {
      return c.json(
        {
          success: false,
          error: "userId and userLevel are required",
        },
        400
      );
    }

    // Check if notification exists
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return c.json(
        {
          success: false,
          error: "Notification not found",
        },
        404
      );
    }

    // Create or update read record
    await prisma.notificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        notificationId,
        userId,
        userLevel: userLevel as ProfileType,
      },
    });

    return c.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return c.json(
      {
        success: false,
        error: "Failed to mark notification as read",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Get notification statistics for dashboard
notificationsController.get("/stats", async (c) => {
  try {
    const { userLevel, userId, schoolId, blockCode, districtCode } =
      c.req.query();

    // Build where clause based on user level (same logic as above)
    let whereClause: any = {
      isActive: true,
      OR: [],
    };

    switch (userLevel?.toUpperCase()) {
      case "SCHOOL":
        whereClause.OR = [
          { targetSchools: true },
          { specificSchoolIds: { has: schoolId } },
        ];
        break;
      case "BLOCK":
        whereClause.OR = [
          { targetBlocks: true },
          { specificBlockCodes: { has: parseInt(blockCode || "0") } },
        ];
        break;
      case "DISTRICT":
        whereClause.OR = [
          { targetDistricts: true },
          { specificDistrictCodes: { has: parseInt(districtCode || "0") } },
        ];
        break;
      case "STATE":
        whereClause.OR = [{ targetStates: true }];
        break;
      default:
        return c.json({ error: "Invalid user level" }, 400);
    }

    const total = await prisma.notification.count({
      where: whereClause,
    });

    const unread = await prisma.notification.count({
      where: {
        ...whereClause,
        NOT: {
          readBy: {
            some: {
              userId: userId || "",
            },
          },
        },
      },
    });

    const urgent = await prisma.notification.count({
      where: {
        ...whereClause,
        priority: "URGENT",
      },
    });

    return c.json({
      success: true,
      data: {
        total,
        unread,
        read: total - unread,
        urgent,
      },
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch notification statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Update notification (only by sender)
notificationsController.put("/:id", async (c) => {
  try {
    const notificationId = c.req.param("id");
    const { title, message, type, priority, isActive, expiresAt, sentBy } =
      await c.req.json();

    // Check if notification exists and if user is the sender
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return c.json(
        {
          success: false,
          error: "Notification not found",
        },
        404
      );
    }

    if (existingNotification.sentBy !== sentBy) {
      return c.json(
        {
          success: false,
          error: "You can only update notifications you sent",
        },
        403
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        ...(title && { title }),
        ...(message && { message }),
        ...(type && { type: type as NotificationType }),
        ...(priority && { priority: priority as NotificationPriority }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
    });

    return c.json({
      success: true,
      data: updatedNotification,
      message: "Notification updated successfully",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Delete notification (only by sender)
notificationsController.delete("/:id", async (c) => {
  try {
    const notificationId = c.req.param("id");
    const { sentBy } = await c.req.json();

    // Check if notification exists and if user is the sender
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return c.json(
        {
          success: false,
          error: "Notification not found",
        },
        404
      );
    }

    if (existingNotification.sentBy !== sentBy) {
      return c.json(
        {
          success: false,
          error: "You can only delete notifications you sent",
        },
        403
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return c.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default notificationsController;
