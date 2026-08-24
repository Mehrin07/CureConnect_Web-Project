import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "patient",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <h2 className="text-center mb-4">
              Welcome Back
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  Role
                </label>

                <select
                  className="form-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="patient">
                    Patient
                  </option>

                  <option value="doctor">
                    Doctor
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Login
              </button>
            </form>

            <p className="text-center mt-4 mb-0">
              New patient?{" "}
              <Link to="/register">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}