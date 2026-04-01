import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { Bell } from "lucide-react";
import { logout } from "../app/features/authSlice";
import api from "../configs/api";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/api/notifications", {
        headers: { Authorization: token },
      });
      setNotifications(data.notifications || []);
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.put(
        "/api/notifications/read-all",
        {},
        { headers: { Authorization: token } },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Poll notifications every 30s for candidates
  useEffect(() => {
    if (user && user.role === "candidate") {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const logoutUser = () => {
    navigate("/");
    dispatch(logout());
  };

  const linkBase =
    "px-3 py-1.5 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all";
  const linkActive = "bg-slate-100 border-slate-200";

  const navLink = (to, label, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
    >
      {label}
    </NavLink>
  );

  return (
    <div className="shadow bg-white">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all">
        <Link to="/">
          <img src="/logo.svg" alt="logo" className="h-11 w-auto" />
        </Link>

        {user && (
          <div className="flex items-center gap-1.5 text-sm">
            {/* Candidate-only links */}
            {user.role === "candidate" && (
              <>
                {navLink("/app", "Dashboard", true)}
                {navLink("/app/jobs", "Jobs")}
                {navLink("/app/jobs/matched", "Matched")}
                {navLink("/app/applications", "Applications")}
              </>
            )}

            {/* Recruiter-only links */}
            {user.role === "recruiter" && (
              <>
                {navLink("/app/recruiter", "Recruiter Dashboard", true)}
                {navLink("/app/jobs", "Browse Jobs")}
              </>
            )}

            {/* Admin-only links */}
            {user.role === "admin" && (
              <>{navLink("/app/admin", "Admin Panel", true)}</>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          {/* Notification bell — candidates only */}
          {user?.role === "candidate" && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifs((prev) => !prev);
                  if (!showNotifs && unreadCount > 0) markAllRead();
                }}
                className="relative p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Bell className="size-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      Notifications
                    </p>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500 text-center">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`px-3 py-2.5 border-b border-slate-50 last:border-0 ${
                          !n.isRead ? "bg-indigo-50/50" : ""
                        }`}
                      >
                        <p className="text-sm text-slate-700">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <p className="max-sm:hidden">
            Hi, {user?.name}
            {user?.role !== "candidate" && (
              <span className="ml-1 text-xs text-slate-400">({user.role})</span>
            )}
          </p>
          <button
            onClick={logoutUser}
            className="bg-white hover:bg-slate-50 border border-gray-300 px-7 py-1.5 rounded-full active:scale-95 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
