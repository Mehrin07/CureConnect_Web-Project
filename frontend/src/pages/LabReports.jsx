import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          "/lab-reports/mine"
        );

        setReports(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load your lab reports."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h2>My Lab Reports</h2>

          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-2 mb-0">
            Loading your lab reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h2 className="mb-4">
          My Lab Reports
        </h2>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!error &&
          reports.length === 0 && (
            <div className="alert alert-secondary">
              No finalized lab reports are available
              yet.
            </div>
          )}

        {!error &&
          reports.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Test Name</th>
                    <th>Verifier 1</th>
                    <th>Verifier 2</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td>
                        {report.testName}
                      </td>

                      <td>
                        {report.verifier1?.name ||
                          "N/A"}
                      </td>

                      <td>
                        {report.verifier2?.name ||
                          "N/A"}
                      </td>

                      <td>
                        <span className="badge text-bg-success">
                          {report.status}
                        </span>
                      </td>

                      <td>
                        {report.createdAt
                          ? new Date(
                              report.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}