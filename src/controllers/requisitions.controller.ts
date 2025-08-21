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
        status: "PENDING_BLOCK_APPROVAL",
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
    const {
      quantity,
      received,
      status,
      remarksByBlock,
      remarksByDistrict,
      remarksByState,
    } = await c.req.json();

    const updateData: any = {};

    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (received !== undefined) updateData.received = parseInt(received);
    if (status !== undefined) updateData.status = status;
    if (remarksByBlock !== undefined)
      updateData.remarksByBlock = remarksByBlock;
    if (remarksByDistrict !== undefined)
      updateData.remarksByDistrict = remarksByDistrict;
    if (remarksByState !== undefined)
      updateData.remarksByState = remarksByState;

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

// Block Level Approval Functions
export const approveRequisitionByBlock = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { remarks } = await c.req.json();

    // First check if requisition exists and is in the correct state
    const existingRequisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!existingRequisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    if (existingRequisition.status !== "PENDING_BLOCK_APPROVAL") {
      return c.json(
        {
          success: false,
          error: "Requisition is not pending block approval",
        },
        400
      );
    }

    const requisition = await db.requisition.update({
      where: {
        id: requisitionId,
      },
      data: {
        status: "PENDING_DISTRICT_APPROVAL",
        remarksByBlock: remarks,
        approvedByBlockAt: new Date(),
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
      message: "Requisition approved by block and forwarded to district",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error approving requisition by block:", error);
    return c.json(
      {
        success: false,
        error: "Failed to approve requisition",
      },
      500
    );
  }
};

export const rejectRequisitionByBlock = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { remarks } = await c.req.json();

    if (!remarks) {
      return c.json(
        {
          success: false,
          error: "Remarks are required for rejection",
        },
        400
      );
    }

    const existingRequisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!existingRequisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    if (existingRequisition.status !== "PENDING_BLOCK_APPROVAL") {
      return c.json(
        {
          success: false,
          error: "Requisition is not pending block approval",
        },
        400
      );
    }

    const requisition = await db.requisition.update({
      where: {
        id: requisitionId,
      },
      data: {
        status: "REJECTED_BY_BLOCK",
        remarksByBlock: remarks,
        rejectedAt: new Date(),
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
      message: "Requisition rejected by block",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error rejecting requisition by block:", error);
    return c.json(
      {
        success: false,
        error: "Failed to reject requisition",
      },
      500
    );
  }
};

// District Level Approval Functions
export const approveRequisitionByDistrict = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { remarks } = await c.req.json();

    const existingRequisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!existingRequisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    if (existingRequisition.status !== "PENDING_DISTRICT_APPROVAL") {
      return c.json(
        {
          success: false,
          error: "Requisition is not pending district approval",
        },
        400
      );
    }

    const requisition = await db.requisition.update({
      where: {
        id: requisitionId,
      },
      data: {
        status: "PENDING_STATE_APPROVAL",
        remarksByDistrict: remarks,
        approvedByDistrictAt: new Date(),
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
      message: "Requisition approved by district and forwarded to state",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error approving requisition by district:", error);
    return c.json(
      {
        success: false,
        error: "Failed to approve requisition",
      },
      500
    );
  }
};

export const rejectRequisitionByDistrict = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { remarks } = await c.req.json();

    if (!remarks) {
      return c.json(
        {
          success: false,
          error: "Remarks are required for rejection",
        },
        400
      );
    }

    const existingRequisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!existingRequisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    if (existingRequisition.status !== "PENDING_DISTRICT_APPROVAL") {
      return c.json(
        {
          success: false,
          error: "Requisition is not pending district approval",
        },
        400
      );
    }

    const requisition = await db.requisition.update({
      where: {
        id: requisitionId,
      },
      data: {
        status: "REJECTED_BY_DISTRICT",
        remarksByDistrict: remarks,
        rejectedAt: new Date(),
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
      message: "Requisition rejected by district",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error rejecting requisition by district:", error);
    return c.json(
      {
        success: false,
        error: "Failed to reject requisition",
      },
      500
    );
  }
};

// State Level Approval Functions
export const approveRequisitionByState = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { remarks } = await c.req.json();

    const existingRequisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!existingRequisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    if (existingRequisition.status !== "PENDING_STATE_APPROVAL") {
      return c.json(
        {
          success: false,
          error: "Requisition is not pending state approval",
        },
        400
      );
    }

    const requisition = await db.requisition.update({
      where: {
        id: requisitionId,
      },
      data: {
        status: "APPROVED",
        remarksByState: remarks,
        approvedByStateAt: new Date(),
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
      message: "Requisition approved by state",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error approving requisition by state:", error);
    return c.json(
      {
        success: false,
        error: "Failed to approve requisition",
      },
      500
    );
  }
};

export const rejectRequisitionByState = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { remarks } = await c.req.json();

    if (!remarks) {
      return c.json(
        {
          success: false,
          error: "Remarks are required for rejection",
        },
        400
      );
    }

    const existingRequisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!existingRequisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    if (existingRequisition.status !== "PENDING_STATE_APPROVAL") {
      return c.json(
        {
          success: false,
          error: "Requisition is not pending state approval",
        },
        400
      );
    }

    const requisition = await db.requisition.update({
      where: {
        id: requisitionId,
      },
      data: {
        status: "REJECTED_BY_STATE",
        remarksByState: remarks,
        rejectedAt: new Date(),
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
      message: "Requisition rejected by state",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error rejecting requisition by state:", error);
    return c.json(
      {
        success: false,
        error: "Failed to reject requisition",
      },
      500
    );
  }
};

// Helper function to get requisitions by district
export const getRequisitionsByDistrict = async (c: Context) => {
  try {
    const district = c.req.param("district");

    const requisitions = await db.requisition.findMany({
      where: {
        school: {
          district: district,
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
    console.error("Error fetching district requisitions:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch district requisitions",
      },
      500
    );
  }
};

// Get requisitions pending at block level
export const getPendingBlockRequisitions = async (c: Context) => {
  try {
    const blockCode = c.req.param("blockCode");

    const requisitions = await db.requisition.findMany({
      where: {
        status: "PENDING_BLOCK_APPROVAL",
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
    console.error("Error fetching pending block requisitions:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch pending block requisitions",
      },
      500
    );
  }
};

// Get requisitions pending at district level
export const getPendingDistrictRequisitions = async (c: Context) => {
  try {
    const district = c.req.param("district");

    const requisitions = await db.requisition.findMany({
      where: {
        status: "PENDING_DISTRICT_APPROVAL",
        school: {
          district: district,
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
    console.error("Error fetching pending district requisitions:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch pending district requisitions",
      },
      500
    );
  }
};

// Get requisitions pending at state level
export const getPendingStateRequisitions = async (c: Context) => {
  try {
    const requisitions = await db.requisition.findMany({
      where: {
        status: "PENDING_STATE_APPROVAL",
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
    console.error("Error fetching pending state requisitions:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch pending state requisitions",
      },
      500
    );
  }
};

// Get requisition approval history and timeline
export const getRequisitionTimeline = async (c: Context) => {
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

    // Build timeline based on status and approval dates
    const timeline: Array<{
      stage: string;
      status: "completed" | "approved" | "rejected" | "pending" | "waiting";
      timestamp: Date | null;
      remarks: string | null;
    }> = [
      {
        stage: "School Submission",
        status: "completed",
        timestamp: requisition.createdAt,
        remarks: null,
      },
    ];

    // Block stage
    if (requisition.approvedByBlockAt) {
      timeline.push({
        stage: "Block Approval",
        status: "approved",
        timestamp: requisition.approvedByBlockAt,
        remarks: requisition.remarksByBlock,
      });
    } else if (requisition.status === "REJECTED_BY_BLOCK") {
      timeline.push({
        stage: "Block Approval",
        status: "rejected",
        timestamp: requisition.rejectedAt,
        remarks: requisition.remarksByBlock,
      });
    } else if (requisition.status === "PENDING_BLOCK_APPROVAL") {
      timeline.push({
        stage: "Block Approval",
        status: "pending",
        timestamp: null,
        remarks: null,
      });
    }

    // District stage
    if (requisition.approvedByDistrictAt) {
      timeline.push({
        stage: "District Approval",
        status: "approved",
        timestamp: requisition.approvedByDistrictAt,
        remarks: requisition.remarksByDistrict,
      });
    } else if (requisition.status === "REJECTED_BY_DISTRICT") {
      timeline.push({
        stage: "District Approval",
        status: "rejected",
        timestamp: requisition.rejectedAt,
        remarks: requisition.remarksByDistrict,
      });
    } else if (requisition.status === "PENDING_DISTRICT_APPROVAL") {
      timeline.push({
        stage: "District Approval",
        status: "pending",
        timestamp: null,
        remarks: null,
      });
    } else if (requisition.approvedByBlockAt) {
      timeline.push({
        stage: "District Approval",
        status: "waiting",
        timestamp: null,
        remarks: null,
      });
    }

    // State stage
    if (requisition.approvedByStateAt) {
      timeline.push({
        stage: "State Approval",
        status: "approved",
        timestamp: requisition.approvedByStateAt,
        remarks: requisition.remarksByState,
      });
    } else if (requisition.status === "REJECTED_BY_STATE") {
      timeline.push({
        stage: "State Approval",
        status: "rejected",
        timestamp: requisition.rejectedAt,
        remarks: requisition.remarksByState,
      });
    } else if (requisition.status === "PENDING_STATE_APPROVAL") {
      timeline.push({
        stage: "State Approval",
        status: "pending",
        timestamp: null,
        remarks: null,
      });
    } else if (requisition.approvedByDistrictAt) {
      timeline.push({
        stage: "State Approval",
        status: "waiting",
        timestamp: null,
        remarks: null,
      });
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
      data: {
        requisition: formattedRequisition,
        timeline: timeline,
      },
    });
  } catch (error) {
    console.error("Error fetching requisition timeline:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch requisition timeline",
      },
      500
    );
  }
};

// Get received books summary for schools
export const getReceivedBooksBySchool = async (c: Context) => {
  try {
    const schoolId = c.req.param("schoolId");

    const requisitions = await db.requisition.findMany({
      where: {
        schoolId: schoolId,
        received: {
          gt: 0, // Only include requisitions with received books
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
        updatedAt: "desc",
      },
    });

    const formattedRequisitions = requisitions.map((req) => ({
      id: req.id,
      reqId: req.reqId,
      bookId: req.bookId,
      bookName: req.book.title,
      class: req.book.class,
      subject: req.book.subject,
      category: req.book.category,
      requisitioned: req.quantity,
      received: req.received,
      remaining: req.quantity - req.received,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
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
    console.error("Error fetching received books by school:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch received books",
      },
      500
    );
  }
};

// Get received books summary for blocks
export const getReceivedBooksByBlock = async (c: Context) => {
  try {
    const blockCode = c.req.param("blockCode");

    const requisitions = await db.requisition.findMany({
      where: {
        school: {
          block_code: parseInt(blockCode),
        },
        received: {
          gt: 0,
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
        updatedAt: "desc",
      },
    });

    const formattedRequisitions = requisitions.map((req) => ({
      id: req.id,
      reqId: req.reqId,
      bookId: req.bookId,
      bookName: req.book.title,
      class: req.book.class,
      subject: req.book.subject,
      category: req.book.category,
      requisitioned: req.quantity,
      received: req.received,
      remaining: req.quantity - req.received,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      school: {
        id: req.school.id,
        name: req.school.name,
        udise: req.school.udise.toString(),
        district: req.school.district,
        block_name: req.school.block_name,
      },
    }));

    return c.json({
      success: true,
      total: formattedRequisitions.length,
      data: formattedRequisitions,
    });
  } catch (error) {
    console.error("Error fetching received books by block:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch received books",
      },
      500
    );
  }
};

// Get received books summary for districts
export const getReceivedBooksByDistrict = async (c: Context) => {
  try {
    const district = c.req.param("district");

    const requisitions = await db.requisition.findMany({
      where: {
        school: {
          district: district,
        },
        received: {
          gt: 0,
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
        updatedAt: "desc",
      },
    });

    const formattedRequisitions = requisitions.map((req) => ({
      id: req.id,
      reqId: req.reqId,
      bookId: req.bookId,
      bookName: req.book.title,
      class: req.book.class,
      subject: req.book.subject,
      category: req.book.category,
      requisitioned: req.quantity,
      received: req.received,
      remaining: req.quantity - req.received,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      school: {
        id: req.school.id,
        name: req.school.name,
        udise: req.school.udise.toString(),
        district: req.school.district,
        block_name: req.school.block_name,
      },
    }));

    return c.json({
      success: true,
      total: formattedRequisitions.length,
      data: formattedRequisitions,
    });
  } catch (error) {
    console.error("Error fetching received books by district:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch received books",
      },
      500
    );
  }
};

// Get state level received books summary
export const getReceivedBooksForState = async (c: Context) => {
  try {
    const requisitions = await db.requisition.findMany({
      where: {
        received: {
          gt: 0,
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
        updatedAt: "desc",
      },
    });

    const formattedRequisitions = requisitions.map((req) => ({
      id: req.id,
      reqId: req.reqId,
      bookId: req.bookId,
      bookName: req.book.title,
      class: req.book.class,
      subject: req.book.subject,
      category: req.book.category,
      requisitioned: req.quantity,
      received: req.received,
      remaining: req.quantity - req.received,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      school: {
        id: req.school.id,
        name: req.school.name,
        udise: req.school.udise.toString(),
        district: req.school.district,
        block_name: req.school.block_name,
      },
    }));

    return c.json({
      success: true,
      total: formattedRequisitions.length,
      data: formattedRequisitions,
    });
  } catch (error) {
    console.error("Error fetching received books for state:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch received books",
      },
      500
    );
  }
};

// Update received quantity for a requisition
export const updateReceivedQuantity = async (c: Context) => {
  try {
    const requisitionId = c.req.param("id");
    const { received, remarks } = await c.req.json();

    if (received === undefined || received < 0) {
      return c.json(
        {
          success: false,
          error: "Valid received quantity is required",
        },
        400
      );
    }

    // Get current requisition
    const existingRequisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!existingRequisition) {
      return c.json(
        {
          success: false,
          error: "Requisition not found",
        },
        404
      );
    }

    // Validate that received quantity doesn't exceed requested quantity
    if (received > existingRequisition.quantity) {
      return c.json(
        {
          success: false,
          error: "Received quantity cannot exceed requested quantity",
        },
        400
      );
    }

    // Update requisition
    const updateData: any = {
      received: parseInt(received.toString()),
    };

    // Update status based on received quantity
    if (received >= existingRequisition.quantity) {
      updateData.status = "COMPLETED";
    } else if (received > 0 && existingRequisition.status === "APPROVED") {
      // Keep as APPROVED if partially received
      updateData.status = "APPROVED";
    }

    // Add remarks if provided
    if (remarks) {
      updateData.remarksByState = remarks; // Assuming state level is updating this
    }

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
      message: "Received quantity updated successfully",
      data: formattedRequisition,
    });
  } catch (error) {
    console.error("Error updating received quantity:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update received quantity",
      },
      500
    );
  }
};

// Get aggregated received books statistics
export const getReceivedBooksStats = async (c: Context) => {
  try {
    const { level, levelId } = c.req.query();

    let whereClause: any = {
      received: {
        gt: 0,
      },
    };

    // Add level-specific filtering
    if (level && levelId) {
      switch (level) {
        case "school":
          whereClause.schoolId = levelId;
          break;
        case "block":
          whereClause.school = {
            block_code: parseInt(levelId),
          };
          break;
        case "district":
          whereClause.school = {
            district: levelId,
          };
          break;
        // state level doesn't need additional filtering
      }
    }

    // Get aggregated stats
    const stats = await db.requisition.aggregate({
      where: whereClause,
      _sum: {
        quantity: true,
        received: true,
      },
      _count: {
        id: true,
      },
    });

    // Get book-wise breakdown
    const bookStats = await db.requisition.groupBy({
      by: ["bookId"],
      where: whereClause,
      _sum: {
        quantity: true,
        received: true,
      },
      _count: {
        id: true,
      },
    });

    // Get book details for the breakdown
    const bookIds = bookStats.map((stat) => stat.bookId);
    const books = await db.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    const bookBreakdown = bookStats.map((stat) => {
      const book = books.find((b) => b.id === stat.bookId);
      return {
        bookId: stat.bookId,
        bookName: book?.title || "Unknown Book",
        class: book?.class || "Unknown",
        subject: book?.subject || "Unknown",
        totalRequisitioned: stat._sum.quantity || 0,
        totalReceived: stat._sum.received || 0,
        requestCount: stat._count.id,
        fulfillmentRate: stat._sum.quantity
          ? (((stat._sum.received || 0) / stat._sum.quantity) * 100).toFixed(2)
          : "0",
      };
    });

    return c.json({
      success: true,
      data: {
        summary: {
          totalRequisitions: stats._count.id,
          totalRequisitioned: stats._sum.quantity || 0,
          totalReceived: stats._sum.received || 0,
          overallFulfillmentRate: stats._sum.quantity
            ? (
                ((stats._sum.received || 0) / stats._sum.quantity) *
                100
              ).toFixed(2)
            : "0",
        },
        bookBreakdown: bookBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching received books stats:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch received books statistics",
      },
      500
    );
  }
};
