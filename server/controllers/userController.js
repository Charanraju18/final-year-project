import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";
import nodemailer from "nodemailer";

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

// controller for user registration.
// POST: /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, requestRecruiter, companyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    const userData = {
      name,
      email,
      password, // pre-save hook will hash it
    };

    if (requestRecruiter) {
      if (!companyName) {
        return res
          .status(400)
          .json({ message: "Company name is required for recruiter signup." });
      }
      userData.role = "recruiter";
      userData.recruiterStatus = "pending";
      userData.companyName = companyName;
    } else {
      userData.role = "candidate";
      userData.recruiterStatus = "none";
    }

    const newUser = await User.create(userData);

    const token = generateToken(newUser._id);
    newUser.password = undefined; // Exclude password from response

    const message = requestRecruiter
      ? "Recruiter account created. Awaiting admin approval."
      : "User created successfully";

    return res.status(201).json({ message, token, user: newUser });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// controller for user login.
// POST: /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.comparePassword(password)) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user._id);
    user.password = undefined; // Exclude password from response

    return res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// controller to get user by id.
// GET: /api/users/data
export const getUserById = async (req, res) => {
  try {
    const userId = req.userId;

    // check if user exists.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // return user
    user.password = undefined; // Exclude password from response
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// controller for getting user resumes.
// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
  try {
    const userId = req.userId;
    const resumes = await Resume.find({ userId });
    return res.status(200).json({ resumes });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// controller for forgot password.
// POST: /api/users/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always return the same message regardless of whether user exists (security)
    const successMsg =
      "If an account exists with that email, a reset link has been sent.";

    if (!user) {
      return res.status(200).json({ message: successMsg });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to user
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save without re-running full validators (only token fields changed)
    await user.save({ validateModifiedOnly: true });

    // Build reset URL (frontend route)
    const clientUrl = (
      process.env.CLIENT_URL || "http://localhost:5173"
    ).trim();
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send email — wrapped in its own try/catch so failures don't crash the endpoint
    try {
      const emailUser = (process.env.EMAIL_USER || "").trim();
      const emailPass = (process.env.EMAIL_PASS || "").trim();

      if (!emailUser || !emailPass) {
        console.error(
          "Forgot password: EMAIL_USER or EMAIL_PASS not set in .env",
        );
        // Still return success to the client (security: don't reveal config issues)
        return res.status(200).json({ message: successMsg });
      }

      const transporter = nodemailer.createTransport({
        service: (process.env.EMAIL_SERVICE || "gmail").trim(),
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"AI Resume Builder" <${emailUser}>`,
        to: user.email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #111827;">Reset Your Password</h2>
            <p style="color: #4b5563;">You requested a password reset. Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background-color: #22c55e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
            <p style="color: #6b7280; font-size: 13px;">This link will expire in 15 minutes.</p>
            <p style="color: #6b7280; font-size: 13px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailErr) {
      // Log the real error but don't crash the endpoint
      console.error("Forgot password — email sending failed:", emailErr);
    }

    return res.status(200).json({ message: successMsg });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

// controller for reset password.
// POST: /api/users/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required." });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
