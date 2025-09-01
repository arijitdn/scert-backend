import type { Context } from "hono";
import { db } from "../config";

export const getDistrictWiseReport = async (c: Context) => {
  try {
    const districtParam = c.req.query("district");

    // Get all districts or filter by specific district
    let whereClause: any = {};
    if (districtParam && districtParam !== "all") {
      whereClause.district = districtParam;
    }

    // Fetch district-wise data
    const districts = await db.block.findMany({
      where: whereClause,
      select: {
        district: true,
        schools: {
          select: {
            id: true,
            category: true,
            type: true,
            ClassEnrollment: {
              select: {
                students: true,
              },
            },
            Requisition: {
              select: {
                quantity: true,
                received: true,
                status: true,
              },
            },
          },
        },
      },
      distinct: ["district"],
    });

    const reportData = await Promise.all(
      districts.map(async (districtBlock) => {
        // Get all schools for this district
        const allSchools = await db.school.findMany({
          where: {
            district: districtBlock.district,
          },
          include: {
            ClassEnrollment: true,
            Requisition: true,
          },
        });

        // Calculate statistics
        const totalSchools = allSchools.length;
        const primarySchools = allSchools.filter(
          (s) => s.category === "PRIMARY" || s.type === "PRIMARY"
        ).length;
        const upperPrimarySchools = allSchools.filter(
          (s) => s.category === "UPPER_PRIMARY" || s.type === "UPPER_PRIMARY"
        ).length;
        const secondarySchools = allSchools.filter(
          (s) => s.category === "SECONDARY" || s.type === "SECONDARY"
        ).length;
        const higherSecondarySchools = allSchools.filter(
          (s) =>
            s.category === "HIGHER_SECONDARY" || s.type === "HIGHER_SECONDARY"
        ).length;

        const totalEnrollment = allSchools.reduce(
          (sum, school) =>
            sum +
            school.ClassEnrollment.reduce(
              (schoolSum, enrollment) => schoolSum + enrollment.students,
              0
            ),
          0
        );

        const booksRequisitioned = allSchools.reduce(
          (sum, school) =>
            sum +
            school.Requisition.reduce(
              (schoolSum, req) => schoolSum + req.quantity,
              0
            ),
          0
        );

        const booksReceived = allSchools.reduce(
          (sum, school) =>
            sum +
            school.Requisition.reduce(
              (schoolSum, req) => schoolSum + req.received,
              0
            ),
          0
        );

        const fulfillmentRate =
          booksRequisitioned > 0
            ? (booksReceived / booksRequisitioned) * 100
            : 0;

        const pendingRequisitions = allSchools.reduce(
          (sum, school) =>
            sum +
            school.Requisition.filter((req) =>
              req.status.includes("PENDING")
            ).reduce(
              (schoolSum, req) => schoolSum + (req.quantity - req.received),
              0
            ),
          0
        );

        return {
          district: districtBlock.district
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          totalSchools,
          primarySchools,
          upperPrimarySchools,
          secondarySchools,
          higherSecondarySchools,
          totalEnrollment,
          booksRequisitioned,
          booksReceived,
          fulfillmentRate: Number(fulfillmentRate.toFixed(1)),
          pendingRequisitions,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      })
    );

    return c.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching district-wise report:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch district-wise report",
      },
      500
    );
  }
};

export const getISWiseReport = async (c: Context) => {
  try {
    const districtParam = c.req.query("district");

    // Get all blocks (IS) or filter by district
    let whereClause: any = {};
    if (districtParam && districtParam !== "all") {
      whereClause.district = districtParam;
    }

    const blocks = await db.block.findMany({
      where: whereClause,
      include: {
        schools: {
          include: {
            ClassEnrollment: true,
            Requisition: true,
          },
        },
      },
    });

    const isWiseData = blocks.map((block) => {
      const totalSchools = block.schools.length;

      const totalEnrollment = block.schools.reduce(
        (sum, school) =>
          sum +
          school.ClassEnrollment.reduce(
            (schoolSum, enrollment) => schoolSum + enrollment.students,
            0
          ),
        0
      );

      const booksDistributed = block.schools.reduce(
        (sum, school) =>
          sum +
          school.Requisition.reduce(
            (schoolSum, req) => schoolSum + req.received,
            0
          ),
        0
      );

      const totalRequisitioned = block.schools.reduce(
        (sum, school) =>
          sum +
          school.Requisition.reduce(
            (schoolSum, req) => schoolSum + req.quantity,
            0
          ),
        0
      );

      const pendingRequests = block.schools.reduce(
        (sum, school) =>
          sum +
          school.Requisition.filter((req) => req.status.includes("PENDING"))
            .length,
        0
      );

      const completionRate =
        totalRequisitioned > 0
          ? (booksDistributed / totalRequisitioned) * 100
          : 0;

      // Get latest activity date
      const latestActivity = block.schools.reduce((latest, school) => {
        const schoolLatest = school.Requisition.reduce((schoolLatest, req) => {
          const reqDate = new Date(req.updatedAt);
          return reqDate > schoolLatest ? reqDate : schoolLatest;
        }, new Date(0));
        return schoolLatest > latest ? schoolLatest : latest;
      }, new Date(0));

      return {
        isName: block.name,
        district: block.district
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        totalSchools,
        booksDistributed,
        studentsEnrolled: totalEnrollment,
        pendingRequests,
        completionRate: Number(completionRate.toFixed(1)),
        lastActivity: latestActivity.toISOString().split("T")[0],
      };
    });

    return c.json({
      success: true,
      data: isWiseData,
    });
  } catch (error) {
    console.error("Error fetching IS-wise report:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch IS-wise report",
      },
      500
    );
  }
};

export const getDetailedDistrictWiseReport = async (c: Context) => {
  try {
    const districtParam = c.req.query("district");

    // Get all districts or filter by specific district
    let whereClause: any = {};
    if (districtParam && districtParam !== "all") {
      // Convert URL-encoded district name to enum format
      const districtEnum = districtParam.replace(/\+/g, "_").toUpperCase();
      whereClause.district = districtEnum;
    }

    // Fetch detailed district-wise data
    const blocks = await db.block.findMany({
      where: whereClause,
      include: {
        schools: {
          include: {
            ClassEnrollment: true,
            Requisition: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    });

    const reportData: any[] = [];
    let slNo = 1;

    for (const block of blocks) {
      for (const school of block.schools) {
        for (const enrollment of school.ClassEnrollment) {
          // Group requisitions by book for this class
          const requisitionsByBook = school.Requisition.filter(
            (req) => req.book.class === enrollment.class
          );

          if (requisitionsByBook.length > 0) {
            for (const requisition of requisitionsByBook) {
              const availableStock =
                requisition.quantity - requisition.received;

              reportData.push({
                slNo: slNo++,
                districtName: block.district
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
                isName: block.name,
                class: enrollment.class,
                enrollment: enrollment.students,
                bookName: requisition.book.title,
                requirement: requisition.quantity,
                dispatched: requisition.received,
                availableStock: availableStock > 0 ? availableStock : 0,
              });
            }
          } else {
            // If no requisitions, show enrollment data with empty book info
            reportData.push({
              slNo: slNo++,
              districtName: block.district
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              isName: block.name,
              class: enrollment.class,
              enrollment: enrollment.students,
              bookName: "No books requisitioned",
              requirement: 0,
              dispatched: 0,
              availableStock: 0,
            });
          }
        }
      }
    }

    return c.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching detailed district-wise report:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch detailed district-wise report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};

export const getDetailedISWiseReport = async (c: Context) => {
  try {
    const districtParam = c.req.query("district");

    // Get all blocks (IS) or filter by district
    let whereClause: any = {};
    if (districtParam && districtParam !== "all") {
      // Convert URL-encoded district name to enum format
      const districtEnum = districtParam.replace(/\+/g, "_").toUpperCase();
      whereClause.district = districtEnum;
    }

    const blocks = await db.block.findMany({
      where: whereClause,
      include: {
        schools: {
          include: {
            ClassEnrollment: true,
            Requisition: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    });

    const reportData: any[] = [];
    let slNo = 1;

    for (const block of blocks) {
      for (const school of block.schools) {
        for (const enrollment of school.ClassEnrollment) {
          // Group requisitions by book for this class
          const requisitionsByBook = school.Requisition.filter(
            (req) => req.book.class === enrollment.class
          );

          if (requisitionsByBook.length > 0) {
            for (const requisition of requisitionsByBook) {
              const availableStock =
                requisition.quantity - requisition.received;

              reportData.push({
                slNo: slNo++,
                districtName: block.district
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
                isName: block.name,
                schoolName: school.name,
                class: enrollment.class,
                enrollment: enrollment.students,
                bookName: requisition.book.title,
                requirement: requisition.quantity,
                dispatched: requisition.received,
                availableStock: availableStock > 0 ? availableStock : 0,
              });
            }
          } else {
            // If no requisitions, show enrollment data with empty book info
            reportData.push({
              slNo: slNo++,
              districtName: block.district
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              isName: block.name,
              schoolName: school.name,
              class: enrollment.class,
              enrollment: enrollment.students,
              bookName: "No books requisitioned",
              requirement: 0,
              dispatched: 0,
              availableStock: 0,
            });
          }
        }
      }
    }

    return c.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching detailed IS-wise report:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch detailed IS-wise report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};

export const getReportSummary = async (c: Context) => {
  try {
    // Get overall statistics
    const totalSchools = await db.school.count();
    const totalBlocks = await db.block.count();

    const enrollmentData = await db.classEnrollment.aggregate({
      _sum: {
        students: true,
      },
    });

    const requisitionData = await db.requisition.aggregate({
      _sum: {
        quantity: true,
        received: true,
      },
    });

    const pendingRequisitions = await db.requisition.count({
      where: {
        status: {
          in: [
            "PENDING_BLOCK_APPROVAL",
            "PENDING_DISTRICT_APPROVAL",
            "PENDING_STATE_APPROVAL",
          ],
        },
      },
    });

    const summary = {
      totalSchools,
      totalBlocks,
      totalEnrollment: enrollmentData._sum.students || 0,
      totalBooksRequisitioned: requisitionData._sum.quantity || 0,
      totalBooksDistributed: requisitionData._sum.received || 0,
      pendingRequisitions,
      overallFulfillmentRate: requisitionData._sum.quantity
        ? (
            ((requisitionData._sum.received || 0) /
              requisitionData._sum.quantity) *
            100
          ).toFixed(1)
        : "0.0",
    };

    return c.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching report summary:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch report summary",
      },
      500
    );
  }
};
