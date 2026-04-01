import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";

// GET /api/applications
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.userId;

    const applications = await Application.find({ userId })
      .populate("jobId")
      .populate("resumeId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// GET /api/applications/job/:jobId (recruiter — must own the job)
export const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    // Verify the recruiter owns this job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    if (String(job.recruiterId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "You can only view applicants for your own jobs." });
    }

    const applications = await Application.find({ jobId })
      .populate("userId", "name email")
      .populate("resumeId", "title skills")
      .sort({ atsScore: -1, createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// PUT /api/applications/:applicationId/status (recruiter — must own the job)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!["shortlisted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'shortlisted' or 'rejected'." });
    }

    const application = await Application.findById(applicationId).populate(
      "jobId",
      "title company recruiterId",
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Verify recruiter owns the job
    if (String(application.jobId.recruiterId) !== String(userId)) {
      return res
        .status(403)
        .json({
          message: "You can only update applications for your own jobs.",
        });
    }

    application.status = status;
    await application.save();

    // Create notification for candidate
    const statusLabel =
      status === "shortlisted" ? "shortlisted for" : "rejected from";
    await Notification.create({
      userId: application.userId,
      message: `You have been ${statusLabel} ${application.jobId.title} at ${application.jobId.company}.`,
      jobId: application.jobId._id,
    });

    return res
      .status(200)
      .json({ message: `Application ${status} successfully.`, application });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
