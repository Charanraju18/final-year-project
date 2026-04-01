import User from "../models/User.js";

// GET /api/admin/recruiter-requests
export const getRecruiterRequests = async (req, res) => {
  try {
    const requests = await User.find({
      role: "recruiter",
      recruiterStatus: "pending",
    }).select("-password");

    return res.status(200).json({ requests });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// POST /api/admin/approve-recruiter/:userId
export const approveRecruiter = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "recruiter") {
      return res.status(400).json({ message: "User is not a recruiter." });
    }
    if (user.recruiterStatus === "approved") {
      return res.status(400).json({ message: "Recruiter already approved." });
    }

    user.recruiterStatus = "approved";
    await user.save();

    return res
      .status(200)
      .json({ message: "Recruiter approved successfully." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// POST /api/admin/reject-recruiter/:userId
export const rejectRecruiter = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "recruiter") {
      return res.status(400).json({ message: "User is not a recruiter." });
    }

    user.recruiterStatus = "rejected";
    await user.save();

    return res.status(200).json({ message: "Recruiter rejected." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
