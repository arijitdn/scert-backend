import type { Context } from "hono";

import { db } from "../config";

export const getAllBooks = async (c: Context) => {
  try {
    const classParam = c.req.query("class");
    const subjectParam = c.req.query("subject");
    const categoryParam = c.req.query("category");
    const academicYearParam = c.req.query("academic_year");
    const enabledOnlyParam = c.req.query("enabled_only");

    let whereClause: any = {};

    if (classParam) {
      whereClause.class = classParam;
    }

    if (subjectParam) {
      whereClause.subject = subjectParam;
    }

    if (categoryParam) {
      whereClause.category = categoryParam;
    }

    if (academicYearParam) {
      whereClause.academic_year = academicYearParam;
    }

    // Filter by enabled status if requested
    if (enabledOnlyParam === "true") {
      whereClause.is_enabled = true;
    }

    const books = await db.book.findMany({
      where: whereClause,
      orderBy: [{ class: "asc" }, { subject: "asc" }, { title: "asc" }],
    });

    return c.json({
      success: true,
      total: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch books",
      },
      500
    );
  }
};

export const getBookById = async (c: Context) => {
  try {
    const bookId = c.req.param("id");

    const book = await db.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return c.json(
        {
          success: false,
          error: "Book not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch book",
      },
      500
    );
  }
};

export const createBook = async (c: Context) => {
  try {
    const {
      title,
      class: bookClass,
      subject,
      category,
      rate,
      academic_year,
    } = await c.req.json();

    if (
      !title ||
      !bookClass ||
      !subject ||
      !category ||
      !rate ||
      !academic_year
    ) {
      return c.json(
        {
          success: false,
          error: "All fields are required",
        },
        400
      );
    }

    const book = await db.book.create({
      data: {
        title,
        class: bookClass,
        subject,
        category,
        rate: parseFloat(rate),
        academic_year,
      },
    });

    return c.json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error creating book:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create book",
      },
      500
    );
  }
};

export const updateBook = async (c: Context) => {
  try {
    const bookId = c.req.param("id");
    const {
      title,
      class: bookClass,
      subject,
      category,
      rate,
      academic_year,
    } = await c.req.json();

    const book = await db.book.update({
      where: {
        id: bookId,
      },
      data: {
        title,
        class: bookClass,
        subject,
        category,
        rate: rate ? parseFloat(rate) : undefined,
        academic_year,
      },
    });

    return c.json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update book",
      },
      500
    );
  }
};

export const deleteBook = async (c: Context) => {
  try {
    const bookId = c.req.param("id");

    await db.book.delete({
      where: {
        id: bookId,
      },
    });

    return c.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete book",
      },
      500
    );
  }
};

export const searchBooks = async (c: Context) => {
  try {
    const searchQuery = c.req.query("q");

    if (!searchQuery) {
      return c.json(
        {
          success: false,
          error: "Search query is required",
        },
        400
      );
    }

    const books = await db.book.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { subject: { contains: searchQuery, mode: "insensitive" } },
          { category: { contains: searchQuery, mode: "insensitive" } },
          { class: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      orderBy: [{ class: "asc" }, { subject: "asc" }, { title: "asc" }],
    });

    return c.json({
      success: true,
      total: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error searching books:", error);
    return c.json(
      {
        success: false,
        error: "Failed to search books",
      },
      500
    );
  }
};

export const toggleBookStatus = async (c: Context) => {
  try {
    const bookId = c.req.param("id");

    // First get the current book to check its status
    const currentBook = await db.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!currentBook) {
      return c.json(
        {
          success: false,
          error: "Book not found",
        },
        404
      );
    }

    // Toggle the is_enabled status
    const updatedBook = await db.book.update({
      where: {
        id: bookId,
      },
      data: {
        is_enabled: !currentBook.is_enabled,
      },
    });

    return c.json({
      success: true,
      message: `Book ${
        updatedBook.is_enabled ? "enabled" : "disabled"
      } successfully`,
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error toggling book status:", error);
    return c.json(
      {
        success: false,
        error: "Failed to toggle book status",
      },
      500
    );
  }
};

export const addCommentToBook = async (c: Context) => {
  try {
    const bookId = c.req.param("id");
    const { comment } = await c.req.json();

    if (!comment || comment.trim() === "") {
      return c.json(
        {
          success: false,
          error: "Comment is required",
        },
        400
      );
    }

    // First check if the book exists
    const currentBook = await db.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!currentBook) {
      return c.json(
        {
          success: false,
          error: "Book not found",
        },
        404
      );
    }

    // Check if book already has a comment
    if (currentBook.comment) {
      return c.json(
        {
          success: false,
          error:
            "Book already has a comment. Comments cannot be edited or deleted.",
        },
        400
      );
    }

    // Add the comment
    const updatedBook = await db.book.update({
      where: {
        id: bookId,
      },
      data: {
        comment: comment.trim(),
      },
    });

    return c.json({
      success: true,
      message: "Comment added successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Error adding comment to book:", error);
    return c.json(
      {
        success: false,
        error: "Failed to add comment",
      },
      500
    );
  }
};
