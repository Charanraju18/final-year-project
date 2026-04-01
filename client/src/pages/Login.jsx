import { Building2, Lock, Mail, User2Icon } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../app/features/authSlice";
import toast from "react-hot-toast";
import api from "../configs/api.js";
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const urlState = query.get("state");

  const [state, setState] = React.useState(urlState || "login");
  const [isRecruiter, setIsRecruiter] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (state === "register" && isRecruiter) {
        payload.requestRecruiter = true;
      }
      const { data } = await api.post(`/api/users/${state}`, payload);
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      toast.success(data.message);

      // Role-based redirect after login/register
      const role = data.user?.role;
      if (role === "admin") {
        navigate("/app/admin");
      } else if (role === "recruiter") {
        navigate("/app/recruiter");
      } else {
        navigate("/app");
      }
    } catch (error) {
      toast(error?.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white"
      >
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">
          {state === "login" ? "Login" : "Sign up"}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Please {state} in to continue
        </p>
        {state !== "login" && (
          <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <User2Icon size={16} color="#6B7280" />
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="border-none outline-none ring-0"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Mail size={13} color="#6B7280" />
          <input
            type="email"
            name="email"
            placeholder="Email id"
            className="border-none outline-none ring-0"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Lock size={13} color="#6B7280" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border-none outline-none ring-0"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mt-4 text-left text-green-500">
          <Link to="/forgot-password" className="text-sm hover:underline">
            Forgot password?
          </Link>
        </div>

        {state !== "login" && (
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none justify-center">
              <input
                type="checkbox"
                checked={isRecruiter}
                onChange={(e) => setIsRecruiter(e.target.checked)}
                className="accent-green-500"
              />
              I'm signing up as a recruiter
            </label>

            {isRecruiter && (
              <div className="flex items-center mt-3 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <Building2 size={14} color="#6B7280" />
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  className="border-none outline-none ring-0"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>
        )}
        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity"
        >
          {state === "login" ? "Login" : "Sign up"}
        </button>
        <p
          onClick={() =>
            setState((prev) => (prev === "login" ? "register" : "login"))
          }
          className="text-gray-500 text-sm mt-3 mb-11"
        >
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <span className="text-green-500 hover:underline cursor-pointer">
            click here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
