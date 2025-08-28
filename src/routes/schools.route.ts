import { Hono } from "hono";

import {
  getAllSchools,
  getSchoolById,
  getSchoolByUdise,
  getSchoolClassEnrollments,
  updateClassEnrollment,
  deleteClassEnrollment,
} from "../controllers";
import { isState } from "../middlewares";

const schools = new Hono();

schools.get("/", getAllSchools);
schools.get("/:id", getSchoolById);
schools.get("/udise/:udise", getSchoolByUdise);
schools.get("/:id/enrollments", getSchoolClassEnrollments);
schools.post("/:id/enrollments", updateClassEnrollment);
schools.delete("/:id/enrollments/:enrollmentId", deleteClassEnrollment);

export default schools;
