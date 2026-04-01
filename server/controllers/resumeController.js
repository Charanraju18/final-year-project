import Resume from "../models/Resume.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";

// controller for creating a resume.
// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    // create new resume
    const newResume = await Resume.create({ userId, title });
    // return success message
    return res
      .status(201)
      .json({ message: "Resume created successfully.", resume: newResume });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// controller for deleting a resume.
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    await Resume.findOneAndDelete({ userId, _id: resumeId });
    return res.status(200).json({ message: "Resume deleted successfully." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// get user resume by id.
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    // Ensure array fields are never undefined
    const resumeObj = resume.toObject();
    resumeObj.experience = resumeObj.experience || [];
    resumeObj.education = resumeObj.education || [];
    resumeObj.projects = resumeObj.projects || [];
    resumeObj.skills = resumeObj.skills || [];

    delete resumeObj.__v;
    delete resumeObj.createdAt;
    delete resumeObj.updatedAt;

    return res.status(200).json({ resume: resumeObj });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// get resume by id public (or if accessed via valid application)
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // First try public access
    let resume = await Resume.findOne({ public: true, _id: resumeId });

    // If not public, check if it's associated with any application (recruiter viewing)
    if (!resume) {
      const Application = (await import("../models/Application.js")).default;
      const app = await Application.findOne({ resumeId });
      if (app) {
        resume = await Resume.findById(resumeId);
      }
    }

    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    return res.status(200).json({ resume });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// controleer for updating a resume.
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    let resumeDataCopy;
    if (typeof resumeData === "string") {
      resumeDataCopy = await JSON.parse(resumeData);
    } else {
      resumeDataCopy = structuredClone(resumeData);
    }
    if (image) {
      const imageBufferData = fs.createReadStream(image.path);

      const response = await imagekit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: {
          pre:
            "w-300,h-300,fo-face,z-0.75" +
            (removeBackground ? ",e-bgremove" : ""),
        },
      });

      resumeDataCopy.personal_info.image = response.url;
    }

    const resume = await Resume.findByIdAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true },
    );
    return res
      .status(200)
      .json({ message: "Resume updated successfully.", resume });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
