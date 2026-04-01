import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { requireApprovedRecruiter } from "../middlewares/roleMiddleware.js";
import {
  createJob,
  getAllJobs,
  getJobById,
  applyToJob,
  getMatchedJobs,
  getRecruiterJobs,
} from "../controllers/jobController.js";

const jobRouter = express.Router();

jobRouter.post("/create", protect, requireApprovedRecruiter, createJob);
jobRouter.get("/", getAllJobs);
jobRouter.get("/matched", protect, getMatchedJobs);
jobRouter.get(
  "/recruiter",
  protect,
  requireApprovedRecruiter,
  getRecruiterJobs,
);
jobRouter.get("/:jobId", getJobById);
jobRouter.post("/apply", protect, applyToJob);

export default jobRouter;
