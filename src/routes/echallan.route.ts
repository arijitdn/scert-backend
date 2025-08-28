import { Hono } from "hono";
import {
  getAllEChallans,
  getEChallanById,
  createEChallan,
  updateEChallanStatus,
  deleteEChallan,
} from "../controllers";

const echallanRoutes = new Hono();

// Get all e-challans
echallanRoutes.get("/", getAllEChallans);

// Get e-challan by ID
echallanRoutes.get("/:id", getEChallanById);

// Create new e-challan
echallanRoutes.post("/", createEChallan);

// Update e-challan status
echallanRoutes.put("/:id/status", updateEChallanStatus);

// Delete e-challan
echallanRoutes.delete("/:id", deleteEChallan);

export { echallanRoutes };
export default echallanRoutes;
