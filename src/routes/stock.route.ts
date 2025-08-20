import { Hono } from "hono";

import {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getStateStock,
  getStockBySchool,
} from "../controllers";
import { isState } from "../middlewares";

const stock = new Hono();

stock.get("/", getAllStock);
stock.get("/state", getStateStock);
stock.get("/:id", getStockById);
stock.post("/", createStock);
stock.put("/:id", updateStock);
stock.delete("/:id", deleteStock);
stock.get("/school/:schoolId", getStockBySchool);

export default stock;
