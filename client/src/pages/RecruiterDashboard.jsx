import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  DollarSign,
  PlusCircle,
  XIcon,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../configs/api";
import toast from "react-hot-toast";

const RecruiterDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applicants, setApplicants] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    experienceLevel: "",
    requiredSkills: "",
  });

  const loadMyJobs = async () => {
    try {
      const { data } = await api.get("/api/jobs/recruiter", {
        headers: { Authorization: token },
      });
      setJobs(data.jobs || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        company: user?.companyName || "My Company",
        description: form.description,
        location: form.location,
        salary: form.salary,
        experienceLevel: form.experienceLevel,
        requiredSkills: form.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const { data } = await api.post("/api/jobs/create", payload, {
        headers: { Authorization: token },
      });
      toast.success(data.message);
      setJobs((prev) => [data.job, ...prev]);
      setForm({
        title: "",
        description: "",
        location: "",
        salary: "",
        experienceLevel: "",
        requiredSkills: "",
      });
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    loadMyJobs();
  }, []);

  const toggleApplicants = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    if (!applicants[jobId]) {
      try {
        const { data } = await api.get(`/api/applications/job/${jobId}`, {
          headers: { Authorization: token },
        });
        setApplicants((prev) => ({
          ...prev,
          [jobId]: data.applications || [],
        }));
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message);
      }
    }
  };

  const updateStatus = async (applicationId, status, jobId) => {
    try {
      const { data } = await api.put(
        `/api/applications/${applicationId}/status`,
        { status },
        { headers: { Authorization: token } },
      );
      toast.success(data.message);
      // Refresh applicants for this job
      const { data: refreshed } = await api.get(
        `/api/applications/job/${jobId}`,
        { headers: { Authorization: token } },
      );
      setApplicants((prev) => ({
        ...prev,
        [jobId]: refreshed.applications || [],
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  // If recruiter is not yet approved
  if (user?.recruiterStatus === "pending") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-3 rounded-full bg-amber-100 w-fit mx-auto mb-4">
          <Clock className="size-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Approval Pending
        </h2>
        <p className="text-slate-500">
          Your recruiter account is awaiting admin approval. You'll be able to
          post jobs once approved.
        </p>
      </div>
    );
  }

  if (user?.recruiterStatus === "rejected") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-3 rounded-full bg-red-100 w-fit mx-auto mb-4">
          <XIcon className="size-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Request Rejected
        </h2>
        <p className="text-slate-500">
          Your recruiter request has been rejected. Please contact support for
          more details.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-purple-100">
              <Briefcase className="size-5 text-purple-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Recruiter Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            Post jobs and manage your listings
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          <PlusCircle className="size-4" />
          Post Job
        </button>
      </div>

      {/* Post Job Modal */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4"
          >
            <XIcon
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              onClick={() => setShowForm(false)}
            />
            <h2 className="text-lg font-semibold text-slate-800">
              Post a New Job
            </h2>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Job Title *"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-purple-500 outline-none"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Job Description *"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-purple-500 outline-none resize-none"
              required
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location (e.g. Remote, Hyderabad)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-purple-500 outline-none"
            />
            <input
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="Salary (e.g. 6-10 LPA)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-purple-500 outline-none"
            />
            <input
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={handleChange}
              placeholder="Experience Level (e.g. Junior, Mid, Senior)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-purple-500 outline-none"
            />
            <input
              name="requiredSkills"
              value={form.requiredSkills}
              onChange={handleChange}
              placeholder="Required Skills (comma-separated, e.g. react, node)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-purple-500 outline-none"
            />
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Create Job
            </button>
          </form>
        </div>
      )}

      {/* My Posted Jobs */}
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        My Posted Jobs
      </h2>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Briefcase className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No jobs posted yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Click "Post Job" to create your first listing.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{job.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3" /> {job.salary}
                      </span>
                    )}
                  </div>
                  {job.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requiredSkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-600 ring-1 ring-purple-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-3">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleApplicants(job._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 hover:ring-indigo-400 transition-all shrink-0"
                >
                  <Users className="size-3.5" />
                  Applicants
                  {expandedJobId === job._id ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </button>
              </div>

              {/* Applicants list */}
              {expandedJobId === job._id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {!applicants[job._id] ? (
                    <p className="text-sm text-slate-500">
                      Loading applicants...
                    </p>
                  ) : applicants[job._id].length === 0 ? (
                    <p className="text-sm text-slate-500">No applicants yet.</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 font-medium">
                        {applicants[job._id].length} applicant
                        {applicants[job._id].length !== 1 && "s"}
                      </p>
                      {applicants[job._id].map((app, idx) => (
                        <div
                          key={app._id}
                          className="bg-slate-50 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {app.userId?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {app.userId?.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 ring-1 ring-green-200 font-medium">
                                ATS: {app.atsScore}%
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                                  app.status === "shortlisted"
                                    ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                                    : app.status === "rejected"
                                      ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 ml-11">
                            {app.resumeId?._id && (
                              <Link
                                to={`/view/${app.resumeId._id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200 hover:ring-blue-400 transition-all"
                              >
                                <ExternalLink className="size-3" />
                                View Resume
                              </Link>
                            )}
                            {app.status === "applied" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateStatus(
                                      app._id,
                                      "shortlisted",
                                      job._id,
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 ring-1 ring-green-200 hover:ring-green-400 transition-all"
                                >
                                  <CheckCircle className="size-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    updateStatus(app._id, "rejected", job._id)
                                  }
                                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-200 hover:ring-red-400 transition-all"
                                >
                                  <XCircle className="size-3" />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
