import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function LabVerification() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  const loadReports = () => {
    api
      .get("/lab-reports")
      .then((res) => setReports(res.data))
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Log in as a doctor/admin to view this page."
        );
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const badgeClass = (status) => {
    if (status === "Finalized") {
      return "text-bg-success";
    }

    if (status === "In Review") {
      return "text-bg-warning";
    }

    return "text-bg-secondary";
  };

  const verify = async (id) => {
    try {
      await api.patch(
        `/lab-reports/${id}/verify`
      );

      loadReports();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not verify report"
      );
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h2 className="mb-4">
          Pending Double Verification
        </h2>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Verifier 1</th>
                <th>Verifier 2</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.patient?.name}
                  </td>

                  <td>{r.testName}</td>

                  <td>
                    {r.verifier1?.name ||
                      "Pending"}
                  </td>

                  <td>
                    {r.verifier2?.name ||
                      "Pending"}
                  </td>

                  <td>
                    <span
                      className={`badge ${badgeClass(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td>
                    {r.status !==
                      "Finalized" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          verify(r._id)
                        }
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="alert alert-info mt-3 mb-0">
          <small>
            <strong>
              Double Report Verification Policy:
            </strong>{" "}
            A report is released to the patient only
            after two authorized professionals confirm
            the result.
          </small>
        </div>
      </div>
    </div>
  );
}