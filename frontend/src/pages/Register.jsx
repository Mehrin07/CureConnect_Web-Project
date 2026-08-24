import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nationalId: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);

      setSuccess(true);
      setMessage(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setSuccess(false);

      setMessage(
        err.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <h2 className="text-center mb-4">
              Create an Account
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
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
                  Phone
                </label>

                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  National ID
                </label>

                <input
                  className="form-control"
                  name="nationalId"
                  value={form.nationalId}
                  onChange={handleChange}
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

              {message && (
                <div
                  className={`alert ${
                    success
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Register
              </button>
            </form>

            <p className="text-center mt-4 mb-0">
              Already have an account?{" "}
              <Link to="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}