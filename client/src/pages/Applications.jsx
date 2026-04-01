import React, { useEffect, useState } from "react";
import api from "../configs/api";

const statusBadge = (status) => {
  switch (status) {
    case "shortlisted":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "rejected":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await api.get("/api/applications", {
        headers: { Authorization: token },
      });
      setApplications(data.applications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Applications</h1>
        <p className="text-sm text-slate-500">Track the jobs you applied to</p>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-slate-600">
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="text-lg font-semibold text-slate-800">
                  {app.jobId?.title || "Untitled Job"}
                </p>
                <p className="text-sm text-slate-500">{app.jobId?.company}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Resume: {app.resumeId?.title || "Untitled"}
                </p>
                <p className="text-xs text-slate-400">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 ring-1 ring-green-200 font-medium">
                  ATS: {app.atsScore}%
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge(app.status)}`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
