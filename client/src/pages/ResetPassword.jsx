import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../configs/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/api/users/reset-password/${token}`, {
        password,
      });
      toast.success(data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="sm:w-[400px] w-full text-center border border-gray-300/60 rounded-2xl px-8 py-10 bg-white">
        <h1 className="text-gray-900 text-2xl font-semibold">Reset Password</h1>
        <p className="text-gray-500 text-sm mt-2">Enter your new password.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <Lock size={14} color="#6B7280" />
            <input
              type="password"
              placeholder="New Password"
              className="border-none outline-none ring-0 flex-1 pr-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <Lock size={14} color="#6B7280" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="border-none outline-none ring-0 flex-1 pr-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <Link
            to="/login"
            className="inline-block text-gray-500 hover:text-green-500 text-sm mt-2"
          >
            ← Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
