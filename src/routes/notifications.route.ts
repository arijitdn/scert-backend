import { Hono } from "hono";
import notificationsController from "../controllers/notifications.controller";

const notificationsRoute = new Hono();

notificationsRoute.route("/", notificationsController);

export default notificationsRoute;
