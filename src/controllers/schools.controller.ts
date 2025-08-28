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
        ClassEnrollment: true,
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

// Get class enrollments for a school
export const getSchoolClassEnrollments = async (c: Context) => {
  try {
    const schoolId = c.req.param("id");

    const enrollments = await db.classEnrollment.findMany({
      where: {
        school_id: schoolId,
      },
      orderBy: {
        class: "asc",
      },
    });

    return c.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching class enrollments:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch class enrollments",
      },
      500
    );
  }
};

// Update or create class enrollment
export const updateClassEnrollment = async (c: Context) => {
  try {
    const schoolId = c.req.param("id");
    const { class: className, students } = await c.req.json();

    if (!className || students === undefined) {
      return c.json(
        {
          success: false,
          error: "Class name and student count are required",
        },
        400
      );
    }

    if (students < 0) {
      return c.json(
        {
          success: false,
          error: "Student count cannot be negative",
        },
        400
      );
    }

    // Check if enrollment already exists for this class
    const existingEnrollment = await db.classEnrollment.findFirst({
      where: {
        school_id: schoolId,
        class: className,
      },
    });

    let enrollment;
    if (existingEnrollment) {
      // Update existing enrollment
      enrollment = await db.classEnrollment.update({
        where: {
          id: existingEnrollment.id,
        },
        data: {
          students: parseInt(students),
        },
      });
    } else {
      // Create new enrollment
      enrollment = await db.classEnrollment.create({
        data: {
          school_id: schoolId,
          class: className,
          students: parseInt(students),
        },
      });
    }

    return c.json({
      success: true,
      data: enrollment,
      message: existingEnrollment
        ? "Enrollment updated successfully"
        : "Enrollment created successfully",
    });
  } catch (error) {
    console.error("Error updating class enrollment:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update class enrollment",
      },
      500
    );
  }
};

// Delete class enrollment
export const deleteClassEnrollment = async (c: Context) => {
  try {
    const schoolId = c.req.param("id");
    const enrollmentId = c.req.param("enrollmentId");

    const enrollment = await db.classEnrollment.findFirst({
      where: {
        id: enrollmentId,
        school_id: schoolId,
      },
    });

    if (!enrollment) {
      return c.json(
        {
          success: false,
          error: "Class enrollment not found",
        },
        404
      );
    }

    await db.classEnrollment.delete({
      where: {
        id: enrollmentId,
      },
    });

    return c.json({
      success: true,
      message: "Class enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class enrollment:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete class enrollment",
      },
      500
    );
  }
};
