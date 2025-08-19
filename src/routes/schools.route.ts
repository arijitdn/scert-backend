import { Hono } from "hono";

import { getAllSchools, getSchoolById, getSchoolByUdise } from "../controllers";
import { isState } from "../middlewares";

const schools = new Hono();

schools.get("/", getAllSchools);
schools.get("/:id", getSchoolById);
schools.get("/udise/:udise", getSchoolByUdise);

export default schools;
