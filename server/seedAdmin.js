import "dotenv/config";
import connectDb from "./configs/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

const run = async () => {
  await connectDb();

  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await User.create({
    name: "Admin",
    email: "admin@platform.com",
    password: hashedPassword,
    role: "admin",
    recruiterStatus: "none",
  });

  console.log("Admin user created:");
  console.log("  Email:", admin.email);
  console.log("  Password: admin123");
  console.log("  Role:", admin.role);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
