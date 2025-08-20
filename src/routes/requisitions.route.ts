import { Hono } from "hono";

import {
  getAllRequisitions,
  getRequisitionById,
  createRequisition,
  updateRequisition,
  deleteRequisition,
  getRequisitionsBySchool,
  getRequisitionsByBlock,
} from "../controllers";
import { isState } from "../middlewares";

const requisitions = new Hono();

requisitions.get("/", getAllRequisitions);
requisitions.get("/:id", getRequisitionById);
requisitions.post("/", createRequisition);
requisitions.put("/:id", updateRequisition);
requisitions.delete("/:id", deleteRequisition);
requisitions.get("/school/:schoolId", getRequisitionsBySchool);
requisitions.get("/block/:blockCode", getRequisitionsByBlock);

export default requisitions;
