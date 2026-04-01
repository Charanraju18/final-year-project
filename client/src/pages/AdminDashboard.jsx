import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ShieldCheck, ShieldX, Clock, Users } from "lucide-react";
import api from "../configs/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const { data } = await api.get("/api/admin/recruiter-requests", {
        headers: { Authorization: token },
      });
      setRequests(data.requests || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const { data } = await api.post(
        `/api/admin/approve-recruiter/${userId}`,
        {},
        { headers: { Authorization: token } },
      );
      toast.success(data.message);
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleReject = async (userId) => {
    try {
      const { data } = await api.post(
        `/api/admin/reject-recruiter/${userId}`,
        {},
        { headers: { Authorization: token } },
      );
      toast.success(data.message);
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-indigo-100">
            <Users className="size-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">
          Manage recruiter approval requests
        </p>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Clock className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No pending requests</p>
          <p className="text-sm text-slate-400 mt-1">
            All recruiter requests have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {requests.length} pending request{requests.length !== 1 && "s"}
          </p>
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold text-sm shrink-0">
                  {req.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{req.name}</p>
                  <p className="text-sm text-slate-500">{req.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Company:{" "}
                    <span className="text-slate-600 font-medium">
                      {req.companyName || "Not specified"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  onClick={() => handleApprove(req._id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-green-100 text-green-700 ring-1 ring-green-200 hover:ring-green-400 transition-all"
                >
                  <ShieldCheck className="size-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-red-100 text-red-700 ring-1 ring-red-200 hover:ring-red-400 transition-all"
                >
                  <ShieldX className="size-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
