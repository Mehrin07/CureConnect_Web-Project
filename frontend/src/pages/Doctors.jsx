import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [tracker, setTracker] = useState(null);
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    try {
      setError("");

      const res = await api.get("/doctors", {
        params: {
          availableOnly,
        },
      });

      setDoctors(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load doctors:",
        err
      );

      setDoctors([]);

      setError(
        err.response?.data?.message ||
          "Failed to load doctors."
      );
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [availableOnly]);

  const bookAppointment = async (doctorId) => {
    setError("");

    try {
      const res = await api.post(
        "/appointments",
        {
          doctorId,
        }
      );

      setTracker(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Please log in as a patient to book."
      );
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2 className="mb-3 mb-md-0">
          Find a Doctor
        </h2>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="availableOnly"
            checked={availableOnly}
            onChange={(e) =>
              setAvailableOnly(
                e.target.checked
              )
            }
          />

          <label
            className="form-check-label"
            htmlFor="availableOnly"
          >
            Available Now Only
          </label>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row g-4">
        {doctors.map((doc) => {
          const doctorName =
            doc.name ||
            doc.fullName ||
            doc.userId?.fullName ||
            "Unknown Doctor";

          return (
            <div
              className="col-md-6 col-lg-4"
              key={doc._id}
            >
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">
                    {doctorName}
                  </h4>

                  <p className="card-text text-secondary">
                    {doc.specialty ||
                      "Specialty not specified"}
                    {" — "}
                    {doc.department ||
                      "Department not specified"}
                  </p>

                  <span
                    className={`badge ${
                      doc.isAvailable
                        ? "text-bg-success"
                        : "text-bg-danger"
                    }`}
                  >
                    {doc.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>

                  <div className="mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        bookAppointment(
                          doc._id
                        )
                      }
                      disabled={
                        !doc.isAvailable
                      }
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {doctors.length === 0 && !error && (
        <div className="alert alert-secondary mt-4">
          No doctors found.
        </div>
      )}

      {tracker && (
        <div className="card border-success shadow-sm mt-4">
          <div className="card-body">
            <h4>
              Appointment Waiting Tracker
            </h4>

            <p>
              Appointment confirmed — Token #
              {tracker.appointment.tokenNumber}
            </p>

            <p className="mb-0">
              Patients ahead in queue:{" "}
              <strong>
                {tracker.patientsAhead}
              </strong>
              {" | "}
              Estimated wait:{" "}
              <strong>
                {tracker.estimatedWaitMinutes} minutes
              </strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}