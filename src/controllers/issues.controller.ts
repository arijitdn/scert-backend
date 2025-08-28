import type { Context } from "hono";
import { db } from "../config";

// Get all issues with optional filtering
export const getAllIssues = async (c: Context) => {
  try {
    const schoolIdParam = c.req.query("schoolId");
    const statusParam = c.req.query("status");
    const levelParam = c.req.query("level");
    const priorityParam = c.req.query("priority");

    let whereClause: any = {};

    if (schoolIdParam) {
      whereClause.schoolId = schoolIdParam;
    }

    if (statusParam) {
      whereClause.status = statusParam;
    }

    if (levelParam) {
      whereClause.currentLevel = levelParam;
    }

    if (priorityParam) {
      whereClause.priority = priorityParam;
    }

    const issues = await db.issue.findMany({
      where: whereClause,
      include: {
        school: {
          include: {
            Block: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    const formattedIssues = issues.map((issue) => ({
      ...issue,
      school: {
        ...issue.school,
        udise: issue.school.udise.toString(),
      },
    }));

    return c.json({
      success: true,
      total: formattedIssues.length,
      data: formattedIssues,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching issues",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};

// Get a single issue by ID
export const getIssueById = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    if (!issue) {
      return c.json(
        {
          success: false,
          message: "Issue not found",
        },
        404
      );
    }

    const formattedIssue = {
      ...issue,
      school: {
        ...issue.school,
        udise: issue.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      data: formattedIssue,
    });
  } catch (error) {
    console.error("Error fetching issue:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching issue",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};

// Create a new issue (from school level)
export const createIssue = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { title, description, priority, schoolId, raisedBy } = body;

    // Validation
    if (!title || !description || !schoolId || !raisedBy) {
      return c.json(
        {
          success: false,
          message: "Title, description, schoolId, and raisedBy are required",
        },
        400
      );
    }

    // Check if school exists
    const school = await db.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return c.json(
        {
          success: false,
          message: "School not found",
        },
        404
      );
    }

    // Generate unique issue ID
    const issueCount = await db.issue.count();
    const issueId = `ISS${(issueCount + 1).toString().padStart(6, "0")}`;

    const issue = await db.issue.create({
      data: {
        issueId,
        title,
        description,
        priority: priority || "MEDIUM",
        schoolId,
        raisedBy,
      },
      include: {
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    const formattedIssue = {
      ...issue,
      school: {
        ...issue.school,
        udise: issue.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      message: "Issue created successfully",
      data: formattedIssue,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    return c.json(
      {
        success: false,
        message: "Error creating issue",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};

// Review issue at block level
export const reviewIssueAtBlock = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { action, remarks } = body;

    if (!action || !["escalate", "resolve", "reject"].includes(action)) {
      return c.json(
        {
          success: false,
          message: "Invalid action. Must be 'escalate', 'resolve', or 'reject'",
        },
        400
      );
    }

    const issue = await db.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return c.json(
        {
          success: false,
          message: "Issue not found",
        },
        404
      );
    }

    if (issue.status !== "PENDING_BLOCK_REVIEW") {
      return c.json(
        {
          success: false,
          message: "Issue is not pending block review",
        },
        400
      );
    }

    let updateData: any = {
      remarksByBlock: remarks,
      reviewedByBlockAt: new Date(),
    };

    if (action === "escalate") {
      updateData.status = "PENDING_DISTRICT_REVIEW";
      updateData.currentLevel = "DISTRICT";
    } else if (action === "resolve") {
      updateData.status = "RESOLVED";
      updateData.resolvedAt = new Date();
    } else if (action === "reject") {
      updateData.status = "REJECTED_BY_BLOCK";
      updateData.rejectedAt = new Date();
    }

    const updatedIssue = await db.issue.update({
      where: { id },
      data: updateData,
      include: {
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    const formattedIssue = {
      ...updatedIssue,
      school: {
        ...updatedIssue.school,
        udise: updatedIssue.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      message: `Issue ${action}${
        action.endsWith("e") ? "d" : "ed"
      } successfully`,
      data: formattedIssue,
    });
  } catch (error) {
    console.error("Error reviewing issue at block level:", error);
    return c.json(
      {
        success: false,
        message: "Error reviewing issue",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};

// Review issue at district level
export const reviewIssueAtDistrict = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { action, remarks } = body;

    if (!action || !["escalate", "resolve", "reject"].includes(action)) {
      return c.json(
        {
          success: false,
          message: "Invalid action. Must be 'escalate', 'resolve', or 'reject'",
        },
        400
      );
    }

    const issue = await db.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return c.json(
        {
          success: false,
          message: "Issue not found",
        },
        404
      );
    }

    if (issue.status !== "PENDING_DISTRICT_REVIEW") {
      return c.json(
        {
          success: false,
          message: "Issue is not pending district review",
        },
        400
      );
    }

    let updateData: any = {
      remarksByDistrict: remarks,
      reviewedByDistrictAt: new Date(),
    };

    if (action === "escalate") {
      updateData.status = "PENDING_STATE_REVIEW";
      updateData.currentLevel = "STATE";
    } else if (action === "resolve") {
      updateData.status = "RESOLVED";
      updateData.resolvedAt = new Date();
    } else if (action === "reject") {
      updateData.status = "REJECTED_BY_DISTRICT";
      updateData.rejectedAt = new Date();
    }

    const updatedIssue = await db.issue.update({
      where: { id },
      data: updateData,
      include: {
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    const formattedIssue = {
      ...updatedIssue,
      school: {
        ...updatedIssue.school,
        udise: updatedIssue.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      message: `Issue ${action}${
        action.endsWith("e") ? "d" : "ed"
      } successfully`,
      data: formattedIssue,
    });
  } catch (error) {
    console.error("Error reviewing issue at district level:", error);
    return c.json(
      {
        success: false,
        message: "Error reviewing issue",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};

// Review issue at state level
export const reviewIssueAtState = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { action, remarks } = body;

    if (!action || !["resolve", "reject"].includes(action)) {
      return c.json(
        {
          success: false,
          message: "Invalid action. Must be 'resolve' or 'reject'",
        },
        400
      );
    }

    const issue = await db.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return c.json(
        {
          success: false,
          message: "Issue not found",
        },
        404
      );
    }

    if (issue.status !== "PENDING_STATE_REVIEW") {
      return c.json(
        {
          success: false,
          message: "Issue is not pending state review",
        },
        400
      );
    }

    let updateData: any = {
      remarksByState: remarks,
      reviewedByStateAt: new Date(),
    };

    if (action === "resolve") {
      updateData.status = "RESOLVED";
      updateData.resolvedAt = new Date();
    } else if (action === "reject") {
      updateData.status = "REJECTED_BY_STATE";
      updateData.rejectedAt = new Date();
    }

    const updatedIssue = await db.issue.update({
      where: { id },
      data: updateData,
      include: {
        school: {
          include: {
            Block: true,
          },
        },
      },
    });

    const formattedIssue = {
      ...updatedIssue,
      school: {
        ...updatedIssue.school,
        udise: updatedIssue.school.udise.toString(),
      },
    };

    return c.json({
      success: true,
      message: `Issue ${action}${
        action.endsWith("e") ? "d" : "ed"
      } successfully`,
      data: formattedIssue,
    });
  } catch (error) {
    console.error("Error reviewing issue at state level:", error);
    return c.json(
      {
        success: false,
        message: "Error reviewing issue",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};

// Get issues summary/statistics
export const getIssuesSummary = async (c: Context) => {
  try {
    const levelParam = c.req.query("level");

    let whereClause: any = {};

    if (levelParam && levelParam !== "STATE") {
      whereClause.currentLevel = levelParam;
    }

    const [
      totalIssues,
      pendingBlock,
      pendingDistrict,
      pendingState,
      resolved,
      rejected,
      highPriority,
      criticalPriority,
    ] = await Promise.all([
      db.issue.count({ where: whereClause }),
      db.issue.count({
        where: {
          ...whereClause,
          status: "PENDING_BLOCK_REVIEW",
        },
      }),
      db.issue.count({
        where: {
          ...whereClause,
          status: "PENDING_DISTRICT_REVIEW",
        },
      }),
      db.issue.count({
        where: {
          ...whereClause,
          status: "PENDING_STATE_REVIEW",
        },
      }),
      db.issue.count({
        where: {
          ...whereClause,
          status: "RESOLVED",
        },
      }),
      db.issue.count({
        where: {
          ...whereClause,
          status: {
            in: [
              "REJECTED_BY_BLOCK",
              "REJECTED_BY_DISTRICT",
              "REJECTED_BY_STATE",
            ],
          },
        },
      }),
      db.issue.count({
        where: {
          ...whereClause,
          priority: "HIGH",
        },
      }),
      db.issue.count({
        where: {
          ...whereClause,
          priority: "CRITICAL",
        },
      }),
    ]);

    return c.json({
      success: true,
      data: {
        totalIssues,
        pendingBlock,
        pendingDistrict,
        pendingState,
        resolved,
        rejected,
        highPriority,
        criticalPriority,
      },
    });
  } catch (error) {
    console.error("Error fetching issues summary:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching issues summary",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};
