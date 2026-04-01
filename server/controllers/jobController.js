import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import { calculateATSScore } from "../services/atsService.js";

// POST /api/jobs/create (approved recruiter only)
export const createJob = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      title,
      company,
      description,
      location = "",
      salary = "",
      experienceLevel = "",
      requiredSkills = [],
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const job = await Job.create({
      title,
      company,
      description,
      location,
      salary,
      experienceLevel,
      requiredSkills,
      recruiterId: userId,
    });

    return res.status(201).json({ message: "Job created successfully.", job });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// GET /api/jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// GET /api/jobs/:jobId
export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    return res.status(200).json({ job });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// POST /api/jobs/apply
export const applyToJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId, resumeId } = req.body;

    // Only candidates can apply
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "candidate") {
      return res
        .status(403)
        .json({ message: "Only candidates can apply to jobs." });
    }

    if (!jobId || !resumeId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const { score } = calculateATSScore(resume, job);

    const application = await Application.create({
      jobId,
      userId,
      resumeId,
      atsScore: score,
      status: "applied",
    });

    return res
      .status(201)
      .json({
        message: "Application submitted",
        atsScore: application.atsScore,
      });
  } catch (err) {
    // Unique index => already applied
    if (String(err?.code) === "11000") {
      return res
        .status(409)
        .json({ message: "You have already applied to this job." });
    }
    return res.status(400).json({ message: err.message });
  }
};

// GET /api/jobs/matched
export const getMatchedJobs = async (req, res) => {
  try {
    const userId = req.userId;

    // Pick latest updated resume. If none, return empty list.
    const resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 });
    if (!resume) {
      return res.status(200).json({ jobs: [] });
    }

    const jobs = await Job.find({}).sort({ createdAt: -1 });

    const scored = jobs.map((job) => {
      const { score, matchedSkills, missingSkills } = calculateATSScore(
        resume,
        job,
      );
      return {
        job,
        ats: { score, matchedSkills, missingSkills },
      };
    });

    scored.sort((a, b) => b.ats.score - a.ats.score);

    return res.status(200).json({
      jobs: scored.map((x) => ({ ...x.job.toObject(), ats: x.ats })),
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// GET /api/jobs/recruiter — recruiter's own posted jobs
export const getRecruiterJobs = async (req, res) => {
  try {
    const userId = req.userId;
    const jobs = await Job.find({ recruiterId: userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ jobs });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
