import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import {
  getRecruiterRequests,
  approveRecruiter,
  rejectRecruiter,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get(
  "/recruiter-requests",
  protect,
  requireAdmin,
  getRecruiterRequests,
);
adminRouter.post(
  "/approve-recruiter/:userId",
  protect,
  requireAdmin,
  approveRecruiter,
);
adminRouter.post(
  "/reject-recruiter/:userId",
  protect,
  requireAdmin,
  rejectRecruiter,
);

export default adminRouter;
