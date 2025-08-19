import { Hono } from "hono";

import { getAllDistricts, getDistrictById } from "../controllers";
import { isState } from "../middlewares";

const districts = new Hono();

districts.get("/", getAllDistricts);
districts.get("/:id", getDistrictById);

export default districts;
