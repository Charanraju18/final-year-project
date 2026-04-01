import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import api from "../configs/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/users/forgot-password", { email });
      toast.success(data.message);
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="sm:w-[400px] w-full text-center border border-gray-300/60 rounded-2xl px-8 py-10 bg-white">
        <h1 className="text-gray-900 text-2xl font-semibold">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="mt-8 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
              If an account exists with that email, a password reset link has
              been sent. Please check your inbox (and spam folder).
            </div>
            <Link
              to="/login"
              className="inline-block text-green-500 hover:underline text-sm"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex items-center w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <Mail size={14} color="#6B7280" />
              <input
                type="email"
                placeholder="Enter your email"
                className="border-none outline-none ring-0 flex-1 pr-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <Link
              to="/login"
              className="inline-block text-gray-500 hover:text-green-500 text-sm mt-2"
            >
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
