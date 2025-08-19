import { Hono } from "hono";

import { getAllSchools } from "../controllers";
import { isState } from "../middlewares";

const schools = new Hono();

schools.get("/", getAllSchools);

export default schools;
