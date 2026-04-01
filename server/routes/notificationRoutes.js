import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protect, getMyNotifications);
notificationRouter.put("/:notificationId/read", protect, markAsRead);
notificationRouter.put("/read-all", protect, markAllAsRead);

export default notificationRouter;
