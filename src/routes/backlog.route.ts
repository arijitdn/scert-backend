import { Hono } from "hono";
import {
  getAllBacklogEntries,
  getBacklogEntryById,
  createBacklogEntry,
  updateBacklogEntry,
  deleteBacklogEntry,
  getBacklogEntriesByType,
} from "../controllers/backlog.controller";

const backlog = new Hono();

// GET /backlog - Get all backlog entries with optional filtering
backlog.get("/", getAllBacklogEntries);

// GET /backlog/:id - Get backlog entry by ID
backlog.get("/:id", getBacklogEntryById);

// POST /backlog - Create new backlog entry
backlog.post("/", createBacklogEntry);

// PUT /backlog/:id - Update backlog entry
backlog.put("/:id", updateBacklogEntry);

// DELETE /backlog/:id - Delete backlog entry
backlog.delete("/:id", deleteBacklogEntry);

// GET /backlog/type/:type - Get backlog entries by type
backlog.get("/type/:type", getBacklogEntriesByType);

export default backlog;
