import { Hono } from "hono";
import {
  getDistrictWiseReport,
  getISWiseReport,
  getReportSummary,
  getDetailedDistrictWiseReport,
  getDetailedISWiseReport,
} from "../controllers/reports.controller";

const app = new Hono();

app.get("/district-wise", getDistrictWiseReport);
app.get("/is-wise", getISWiseReport);
app.get("/summary", getReportSummary);
app.get("/detailed-district-wise", getDetailedDistrictWiseReport);
app.get("/detailed-is-wise", getDetailedISWiseReport);

export default app;
