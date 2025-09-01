import { Hono } from "hono";

import {
  getRequisitionWindows,
  getRequisitionWindowByType,
  createOrUpdateRequisitionWindow,
  deleteRequisitionWindow,
  checkRequisitionWindowStatus,
} from "../controllers";

const requisitionWindowRoute = new Hono();

// GET /requisition-windows - Get all active requisition windows
requisitionWindowRoute.get("/", getRequisitionWindows);

// GET /requisition-windows/type/:type - Get requisition window for specific type
requisitionWindowRoute.get("/type/:type", getRequisitionWindowByType);

// GET /requisition-windows/status/:type - Check if requisition window is open for type
requisitionWindowRoute.get("/status/:type", checkRequisitionWindowStatus);

// POST /requisition-windows - Create or update a requisition window
requisitionWindowRoute.post("/", createOrUpdateRequisitionWindow);

// DELETE /requisition-windows/:id - Deactivate a requisition window
requisitionWindowRoute.delete("/:id", deleteRequisitionWindow);

export { requisitionWindowRoute };
