import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function AdminFeedback() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/complaints");

      setComplaints(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-4">
        Loading feedback...
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          Patient Feedback
        </h2>

        <button
          className="btn btn-outline-primary"
          onClick={loadComplaints}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="alert alert-secondary">
          No feedback has been submitted yet.
        </div>
      ) : (
        <div className="row g-4">
          {complaints.map((complaint) => (
            <div
              className="col-md-6"
              key={complaint._id}
            >
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">
                      {complaint.category}
                    </h5>

    
                  </div>

                  <p>
                    <strong>
                      Reference Number:
                    </strong>{" "}
                    {complaint.refNumber}
                  </p>

                  <p>
                    <strong>
                      Department:
                    </strong>{" "}
                    {complaint.department ||
                      "Not specified"}
                  </p>

                  <p>
                    <strong>
                      Feedback:
                    </strong>
                  </p>

                  <p className="text-secondary">
                    {complaint.description}
                  </p>

                  <p>
                    <strong>
                      Submitted By:
                    </strong>{" "}
                    {complaint.anonymous
                      ? "Anonymous"
                      : complaint.submittedBy?.name ||
                        "Unknown User"}
                  </p>

                  {!complaint.anonymous &&
                    complaint.submittedBy?.email && (
                      <p>
                        <strong>Email:</strong>{" "}
                        {complaint.submittedBy.email}
                      </p>
                    )}

                  <p className="text-muted mb-0">
                    <strong>
                      Submitted:
                    </strong>{" "}
                    {new Date(
                      complaint.createdAt
                    ).toLocaleString()}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}