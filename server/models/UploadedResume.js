import mongoose from "mongoose";

const UploadedResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
  },
  { timestamps: true },
);

const UploadedResume = mongoose.model("UploadedResume", UploadedResumeSchema);

export default UploadedResume;
