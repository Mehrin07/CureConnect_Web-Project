import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Home() {
  const [beds, setBeds] = useState([]);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    api
      .get("/beds")
      .then((res) => setBeds(res.data))
      .catch(() => {});
  }, []);

  const labReportsPath =
    user?.role === "patient"
      ? "/lab-reports"
      : user?.role === "doctor" || user?.role === "admin"
      ? "/lab-verification"
      : "/login";

  const labReportsButtonText =
    user?.role === "patient"
      ? "View My Reports"
      : user?.role === "doctor" || user?.role === "admin"
      ? "View Reports"
      : "Log In to View Reports";

  return (
    <div>
      {/* Hero */}
      <section className="card border-0 shadow-sm text-center p-5 mb-4">
        <div className="py-4">
          <h1 className="display-5 fw-bold">
            Your Health, Our Priority
          </h1>

          <p className="lead text-secondary">
            Smart healthcare management with CureConnect.
          </p>

          <Link
            to="/doctors"
            className="btn btn-primary btn-lg"
          >
            Book an Appointment
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="mb-4">
        <h2 className="section-title mb-3">
          Our Services
        </h2>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h4 className="card-title">
                  Smart Appointment Booking
                </h4>

                <p className="card-text text-secondary">
                  Book with available doctors instantly,
                  with no double-booking.
                </p>

                <Link
                  to="/doctors"
                  className="btn btn-primary"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h4 className="card-title">
                  Blood Bank
                </h4>

                <p className="card-text text-secondary">
                  Check live blood group stock availability.
                </p>

                <Link
                  to="/blood-bank"
                  className="btn btn-danger"
                >
                  View Stock
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h4 className="card-title">
                  Lab Reports
                </h4>

                <p className="card-text text-secondary">
                  Verified, double-checked diagnostic reports.
                </p>

                <Link
                  to={labReportsPath}
                  className="btn btn-success"
                >
                  {labReportsButtonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beds */}
      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h4 mb-3">
            Live Bed Availability
          </h2>

          {beds.length === 0 ? (
            <div className="alert alert-secondary mb-0">
              No bed data yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Department</th>
                    <th>Free Beds</th>
                  </tr>
                </thead>

                <tbody>
                  {beds.map((b) => (
                    <tr key={b._id}>
                      <td>{b.department}</td>

                      <td>
                        <span className="badge text-bg-primary">
                          {b.totalBeds - b.occupiedBeds} /{" "}
                          {b.totalBeds}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}