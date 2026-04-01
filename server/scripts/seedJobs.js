import "dotenv/config";
import connectDb from "../configs/db.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const run = async () => {
  await connectDb();

  // Find any recruiter; if none exists, we will create one.
  let recruiter = await User.findOne({ role: "recruiter" });

  if (!recruiter) {
    recruiter = await User.create({
      name: "Recruiter",
      email: "recruiter@example.com",
      password: "password",
      role: "recruiter",
      companyName: "Demo Company",
    });
    console.log("Created recruiter:", recruiter.email);
  } else {
    console.log("Using recruiter:", recruiter.email);
  }

  const jobsToInsert = [
    {
      title: "Frontend Developer",
      company: recruiter.companyName || "Demo Company",
      description:
        "Build and ship UI features using React. Collaborate with designers and backend engineers.",
      location: "Remote",
      salary: "6-10 LPA",
      experienceLevel: "Junior",
      requiredSkills: ["react", "javascript", "html", "css"],
      recruiterId: recruiter._id,
    },
    {
      title: "Backend Developer",
      company: recruiter.companyName || "Demo Company",
      description:
        "Design APIs, work with MongoDB, and build scalable Node.js services.",
      location: "Hyderabad",
      salary: "8-14 LPA",
      experienceLevel: "Mid",
      requiredSkills: ["node.js", "express", "mongodb", "jwt"],
      recruiterId: recruiter._id,
    },
    {
      title: "Full Stack Developer",
      company: recruiter.companyName || "Demo Company",
      description:
        "Work across frontend and backend to deliver features end-to-end.",
      location: "Remote",
      salary: "10-18 LPA",
      experienceLevel: "Mid",
      requiredSkills: ["react", "node", "express", "mongodb"],
      recruiterId: recruiter._id,
    },
  ];

  const existing = await Job.countDocuments();
  if (existing > 0) {
    console.log("Jobs already exist (count:", existing + "). Skipping insert.");
    process.exit(0);
  }

  await Job.insertMany(jobsToInsert);
  console.log("Seeded", jobsToInsert.length, "jobs.");
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
