import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import Login from "./Login";
const Layout = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Login />;
  }

  const role = user.role;

  // ── Admin guards ──
  // Admin can ONLY access /app/admin
  if (role === "admin") {
    if (!path.startsWith("/app/admin") && path !== "/app") {
      return <Navigate to="/app/admin" replace />;
    }
    // /app (index) → redirect to /app/admin
    if (path === "/app") {
      return <Navigate to="/app/admin" replace />;
    }
  }

  // ── Recruiter guards ──
  if (role === "recruiter") {
    // Recruiters can access: /app/recruiter, /app/jobs (browse only), /app/jobs/:id
    // Recruiters CANNOT access: /app (dashboard), /app/builder, /app/jobs/matched, /app/applications
    const allowed = ["/app/recruiter", "/app/jobs"];
    const isAllowed =
      allowed.some((p) => path.startsWith(p)) || path === "/app";

    if (!isAllowed) {
      return <Navigate to="/app/recruiter" replace />;
    }
    // /app (index) → redirect to /app/recruiter
    if (path === "/app") {
      return <Navigate to="/app/recruiter" replace />;
    }
    // Block candidate-only routes even under /app/jobs
    if (
      path.startsWith("/app/jobs/matched") ||
      path.startsWith("/app/applications")
    ) {
      return <Navigate to="/app/recruiter" replace />;
    }
    // Block resume builder
    if (path.startsWith("/app/builder")) {
      return <Navigate to="/app/recruiter" replace />;
    }
  }

  // ── Candidate guards ──
  if (role === "candidate") {
    // Candidates CANNOT access admin or recruiter dashboards
    if (path.startsWith("/app/admin")) {
      return <Navigate to="/app" replace />;
    }
    if (path.startsWith("/app/recruiter")) {
      return <Navigate to="/app" replace />;
    }
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
