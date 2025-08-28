import { Hono } from "hono";
import {
  getAllIssues,
  getIssueById,
  createIssue,
  reviewIssueAtBlock,
  reviewIssueAtDistrict,
  reviewIssueAtState,
  getIssuesSummary,
} from "../controllers/issues.controller";

const issuesRouter = new Hono();

// Get all issues with optional filtering
issuesRouter.get("/", getAllIssues);

// Get issues summary/statistics
issuesRouter.get("/summary", getIssuesSummary);

// Get a single issue by ID
issuesRouter.get("/:id", getIssueById);

// Create a new issue
issuesRouter.post("/", createIssue);

// Review issue at block level
issuesRouter.patch("/:id/review/block", reviewIssueAtBlock);

// Review issue at district level
issuesRouter.patch("/:id/review/district", reviewIssueAtDistrict);

// Review issue at state level
issuesRouter.patch("/:id/review/state", reviewIssueAtState);

export default issuesRouter;
