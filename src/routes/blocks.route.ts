import { Hono } from "hono";

import {
  getAllBlocks,
  getBlockById,
  updateBlockPassword,
} from "../controllers";
import { isState } from "../middlewares";

const blocks = new Hono();

blocks.get("/", getAllBlocks);
blocks.get("/:id", getBlockById);
blocks.put("/:id/password", updateBlockPassword);

export default blocks;
