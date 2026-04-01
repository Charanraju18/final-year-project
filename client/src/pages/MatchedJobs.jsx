import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../configs/api";

const MatchedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMatched = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await api.get("/api/jobs/matched", {
        headers: { Authorization: token },
      });
      setJobs(data.jobs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatched();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Matched Jobs
          </h1>
          <p className="text-sm text-slate-500">
            Jobs sorted by your ATS match score (based on your latest resume)
          </p>
        </div>
        <Link
          to="/app/jobs"
          className="text-sm px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-all"
        >
          Back to Jobs
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-slate-600">
          No matched jobs found. Make sure you have a resume with skills added.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {job.title}
                  </h3>
                  <p className="text-sm text-slate-500">{job.company}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 ring-1 ring-green-200">
                  {job.ats?.score ?? 0}% match
                </span>
              </div>

              <div className="mt-3 text-sm text-slate-600">
                <p>
                  <span className="text-slate-500">Location:</span>{" "}
                  {job.location || "—"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(job.ats?.matchedSkills || []).slice(0, 6).map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <Link
                  to={`/app/jobs/${job._id}`}
                  className="inline-flex items-center justify-center w-full text-sm px-4 py-2 rounded-lg bg-linear-to-br from-green-100 to-green-200 text-green-700 ring-1 ring-green-300 hover:ring-green-400 transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchedJobs;
