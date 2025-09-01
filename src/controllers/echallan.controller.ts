import type { Context } from "hono";
import { db } from "../config";

export const getAllEChallans = async (c: Context) => {
  try {
    const typeParam = c.req.query("type");
    const statusParam = c.req.query("status");

    let whereClause: any = {};

    if (typeParam) {
      whereClause.destinationType = typeParam;
    }

    if (statusParam) {
      whereClause.status = statusParam;
    }

    const echallans = await db.eChallan.findMany({
      where: whereClause,
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      total: echallans.length,
      data: echallans,
    });
  } catch (error) {
    console.error("Error fetching e-challans:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch e-challans",
      },
      500
    );
  }
};

export const getEChallanById = async (c: Context) => {
  try {
    const id = c.req.param("id");

    const echallan = await db.eChallan.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!echallan) {
      return c.json(
        {
          success: false,
          error: "E-challan not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: echallan,
    });
  } catch (error) {
    console.error("Error fetching e-challan:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch e-challan",
      },
      500
    );
  }
};

export const createEChallan = async (c: Context) => {
  try {
    const {
      challanNo,
      destinationType,
      destinationName,
      destinationId,
      requisitionId,
      academicYear,
      vehicleNo,
      agency,
      books,
    } = await c.req.json();

    // Generate unique challan ID
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const timestamp = currentDate.getTime().toString().slice(-6);

    const challanId = `ECH-${year}${month}${day}-${timestamp}`;

    // Calculate totals
    const totalBooks = books.length;
    const totalBookQuantity = books.reduce(
      (sum: number, book: any) => sum + (parseInt(book.noOfBooks) || 0),
      0
    );
    const totalBoxes = books.reduce(
      (sum: number, book: any) => sum + (parseInt(book.noOfBoxes) || 0),
      0
    );
    const totalPackets = books.reduce(
      (sum: number, book: any) => sum + (parseInt(book.noOfPackets) || 0),
      0
    );
    const totalLooseBoxes = books.reduce(
      (sum: number, book: any) => sum + (parseInt(book.noOfLooseBoxes) || 0),
      0
    );

    // Create e-challan with books
    const echallan = await db.eChallan.create({
      data: {
        challanId,
        challanNo,
        destinationType,
        destinationName,
        destinationId,
        requisitionId,
        academicYear,
        vehicleNo,
        agency,
        totalBooks,
        totalBoxes,
        totalPackets,
        totalLooseBoxes,
        books: {
          create: books.map((book: any) => ({
            bookId: book.bookId,
            className: book.className,
            subject: book.subject,
            bookName: book.bookName,
            noOfBooks: parseInt(book.noOfBooks) || 0,
            noOfBoxes: parseInt(book.noOfBoxes) || 0,
            noOfPackets: parseInt(book.noOfPackets) || 0,
            noOfLooseBoxes: parseInt(book.noOfLooseBoxes) || 0,
            totalQuantity:
              (parseInt(book.noOfBoxes) || 0) +
              (parseInt(book.noOfPackets) || 0) +
              (parseInt(book.noOfLooseBoxes) || 0),
          })),
        },
      },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "E-challan created successfully",
      data: echallan,
    });
  } catch (error) {
    console.error("Error creating e-challan:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create e-challan",
      },
      500
    );
  }
};

export const updateEChallanStatus = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const { status, deliveredAt } = await c.req.json();

    const updateData: any = { status };

    if (status === "DELIVERED" && deliveredAt) {
      updateData.deliveredAt = new Date(deliveredAt);
    }

    const echallan = await db.eChallan.update({
      where: { id },
      data: updateData,
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "E-challan status updated successfully",
      data: echallan,
    });
  } catch (error) {
    console.error("Error updating e-challan status:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update e-challan status",
      },
      500
    );
  }
};

export const deleteEChallan = async (c: Context) => {
  try {
    const id = c.req.param("id");

    // Delete e-challan books first
    await db.eChallanBook.deleteMany({
      where: { eChallanId: id },
    });

    // Delete e-challan
    await db.eChallan.delete({
      where: { id },
    });

    return c.json({
      success: true,
      message: "E-challan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting e-challan:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete e-challan",
      },
      500
    );
  }
};
