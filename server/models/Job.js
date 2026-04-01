import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: "" },
    salary: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    requiredSkills: [{ type: String, default: [] }],

    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", JobSchema);

export default Job;
