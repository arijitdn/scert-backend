import { Hono } from "hono";

import {
  getAllRequisitions,
  getRequisitionById,
  createRequisition,
  updateRequisition,
  deleteRequisition,
  getRequisitionsBySchool,
  getRequisitionsByBlock,
  getRequisitionsByDistrict,
  getPendingBlockRequisitions,
  getPendingDistrictRequisitions,
  getPendingStateRequisitions,
  getRequisitionTimeline,
  getReceivedBooksBySchool,
  getReceivedBooksByBlock,
  getReceivedBooksByDistrict,
  getReceivedBooksForState,
  updateReceivedQuantity,
  getReceivedBooksStats,
  approveRequisitionByBlock,
  rejectRequisitionByBlock,
  approveRequisitionByDistrict,
  rejectRequisitionByDistrict,
  approveRequisitionByState,
  rejectRequisitionByState,
} from "../controllers";
import { isState } from "../middlewares";

const requisitions = new Hono();

// Basic CRUD operations
requisitions.get("/", getAllRequisitions);
requisitions.get("/:id", getRequisitionById);
requisitions.get("/:id/timeline", getRequisitionTimeline);
requisitions.post("/", createRequisition);
requisitions.put("/:id", updateRequisition);
requisitions.delete("/:id", deleteRequisition);

// Get requisitions by level
requisitions.get("/school/:schoolId", getRequisitionsBySchool);
requisitions.get("/block/:blockCode", getRequisitionsByBlock);
requisitions.get("/district/:district", getRequisitionsByDistrict);

// Get pending requisitions by level
requisitions.get("/pending/block/:blockCode", getPendingBlockRequisitions);
requisitions.get("/pending/district/:district", getPendingDistrictRequisitions);
requisitions.get("/pending/state", getPendingStateRequisitions);

// Get received books by level
requisitions.get("/received/school/:schoolId", getReceivedBooksBySchool);
requisitions.get("/received/block/:blockCode", getReceivedBooksByBlock);
requisitions.get("/received/district/:district", getReceivedBooksByDistrict);
requisitions.get("/received/state", getReceivedBooksForState);

// Get received books statistics
requisitions.get("/stats/received", getReceivedBooksStats);

// Update received quantity
requisitions.put("/:id/received", updateReceivedQuantity);

// Block level approval endpoints
requisitions.post("/:id/approve/block", approveRequisitionByBlock);
requisitions.post("/:id/reject/block", rejectRequisitionByBlock);

// District level approval endpoints
requisitions.post("/:id/approve/district", approveRequisitionByDistrict);
requisitions.post("/:id/reject/district", rejectRequisitionByDistrict);

// State level approval endpoints
requisitions.post("/:id/approve/state", approveRequisitionByState);
requisitions.post("/:id/reject/state", rejectRequisitionByState);

export default requisitions;
