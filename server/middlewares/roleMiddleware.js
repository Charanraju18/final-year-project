import User from "../models/User.js";

// Middleware: require admin role
export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Middleware: require recruiter role (any status)
export const requireRecruiter = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter access required." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Middleware: require approved recruiter
export const requireApprovedRecruiter = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter access required." });
    }
    if (user.recruiterStatus !== "approved") {
      return res.status(403).json({ message: "Recruiter not approved yet." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
