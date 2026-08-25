import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/appointments/mine");

      setAppointments(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const cancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/appointments/${appointmentId}`
      );

      // Refresh appointment list
      await loadAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cancel appointment."
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        Loading appointments...
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">
        My Appointments
      </h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="alert alert-secondary">
          You do not have any appointments.
        </div>
      ) : (
        <div className="row g-4">
          {appointments.map((appointment) => (
            <div
              className="col-md-6 col-lg-4"
              key={appointment._id}
            >
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">

                    {appointment.doctor?.name ||
                      "Unknown Doctor"}
                  </h5>

                  <p className="mb-2">
                    <strong>Specialty:</strong>{" "}
                    {appointment.doctor?.specialty ||
                      "Not specified"}
                  </p>

                  <p className="mb-2">
                    <strong>Department:</strong>{" "}
                    {appointment.doctor?.department ||
                      "Not specified"}
                  </p>

                  <p className="mb-2">
                    <strong>Token Number:</strong>{" "}
                    {appointment.tokenNumber}
                  </p>

                  <p className="mb-3">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        appointment.status === "Booked"
                          ? "text-bg-success"
                          : appointment.status === "Completed"
                          ? "text-bg-primary"
                          : "text-bg-danger"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </p>

                  {appointment.status === "Booked" && (
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        cancelAppointment(
                          appointment._id
                        )
                      }
                    >
                      Delete / Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}