import { Hono } from "hono";

import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  toggleBookStatus,
  addCommentToBook,
} from "../controllers";
import { isState } from "../middlewares";

const books = new Hono();

books.get("/", getAllBooks);
books.get("/search", searchBooks);
books.get("/:id", getBookById);
books.post("/", createBook);
books.put("/:id", updateBook);
books.patch("/:id/toggle-status", toggleBookStatus);
books.patch("/:id/add-comment", addCommentToBook);
books.delete("/:id", deleteBook);

export default books;
