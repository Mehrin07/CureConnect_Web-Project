import { useState } from "react";
import api from "../api/axios.js";

export default function Complaint() {
  const [form, setForm] = useState({
    category: "Service",
    department: "",
    description: "",
    anonymous: true,
  });

  const [refNumber, setRefNumber] =
    useState("");

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post(
        "/complaints",
        form
      );

      setRefNumber(
        res.data.refNumber
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not submit complaint"
      );
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="mb-4">
              Submit a Complaint
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  Category
                </label>

                <select
                  className="form-select"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Service</option>
                  <option>Staff</option>
                  <option>Billing</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Department
                </label>

                <input
                  className="form-control"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  name="description"
                  rows="5"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="anonymous"
                  id="anonymous"
                  checked={form.anonymous}
                  onChange={handleChange}
                />

                <label
                  className="form-check-label"
                  htmlFor="anonymous"
                >
                  Submit Anonymously
                </label>
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
              >
                Submit Complaint
              </button>
            </form>

            {refNumber && (
              <div className="alert alert-success mt-4 mb-0">
                Submitted successfully!

                <br />

                Tracking reference number:{" "}
                <strong>
                  {refNumber}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}