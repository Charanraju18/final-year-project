import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { requireApprovedRecruiter } from "../middlewares/roleMiddleware.js";
import {
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

const applicationRouter = express.Router();

applicationRouter.get("/", protect, getMyApplications);
applicationRouter.get(
  "/job/:jobId",
  protect,
  requireApprovedRecruiter,
  getApplicantsForJob,
);
applicationRouter.put(
  "/:applicationId/status",
  protect,
  requireApprovedRecruiter,
  updateApplicationStatus,
);

export default applicationRouter;
