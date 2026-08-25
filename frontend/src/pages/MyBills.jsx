import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    const fetchMyBills = async () => {
      try {
        setLoading(true);
        setError("");

        // Make sure a patient is logged in
        if (!user || user.role !== "patient") {
          setError("Please log in as a patient to view your bills.");
          setLoading(false);
          return;
        }

        const response = await api.get("/bills/mine");

        setBills(response.data);
      } catch (err) {
        console.error("Failed to load bills:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your bills. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyBills();
  }, []);

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <h4 className="fw-semibold">My Bills</h4>

            <p className="text-muted mb-0">
              Loading your bills...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================
  if (error) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div
              className="alert alert-danger d-inline-block mb-3"
              role="alert"
            >
              {error}
            </div>

            <h4 className="fw-semibold">My Bills</h4>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO BILLS
  // ============================================================
  if (bills.length === 0) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <h2 className="fw-bold text-primary mb-3">
              My Bills
            </h2>

            <p className="text-muted mb-0">
              You do not have any bills yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DISPLAY BILLS
  // ============================================================
  return (
    <div className="container py-4">
      {/* PAGE HEADER */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <h2 className="fw-bold text-primary mb-2">
            My Bills
          </h2>

          <p className="mb-2">
            Hello, <strong>{user?.name}</strong>.
          </p>

          <p className="text-muted mb-0">
            Below are all the bills associated with your account.
          </p>
        </div>
      </div>

      {/* BILLS */}
      {bills.map((bill) => (
        <div
          className="card shadow-sm border-0 mb-4"
          key={bill._id}
        >
          <div className="card-body p-4">
            {/* ==================================================
                BILL HEADER
            ================================================== */}

            <div className="row align-items-center g-3">
              <div className="col-md-8">
                <h3 className="fw-bold mb-3">
                  Hospital Bill
                </h3>

                <p className="mb-2">
                  <strong>Bill ID:</strong>{" "}
                  <span className="text-muted">
                    {bill._id}
                  </span>
                </p>

                <p className="mb-0">
                  <strong>Date:</strong>{" "}
                  {new Date(
                    bill.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* STATUS */}
              <div className="col-md-4 text-md-end">
                <span
                  className={`badge rounded-pill px-3 py-2 fs-6 ${
                    bill.status === "Paid"
                      ? "text-bg-success"
                      : "text-bg-warning"
                  }`}
                >
                  {bill.status}
                </span>
              </div>
            </div>

            <hr className="my-4" />

            {/* ==================================================
                BILL ITEMS
            ================================================== */}

            <h4 className="fw-semibold mb-3">
              Bill Items
            </h4>

            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>Item / Service</th>
                    <th className="text-end">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bill.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>

                      <td className="text-end fw-semibold">
                        Tk{" "}
                        {Number(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ==================================================
                BILL TOTAL
            ================================================== */}

            <div className="row justify-content-end mt-4">
              <div className="col-md-6 col-lg-4">
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>

                    <strong>
                      Tk{" "}
                      {Number(
                        bill.subtotal
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (5%):</span>

                    <strong>
                      Tk{" "}
                      {Number(
                        bill.tax
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mt-2">
                    <strong className="fs-5">
                      Total:
                    </strong>

                    <strong className="fs-5 text-primary">
                      Tk{" "}
                      {Number(
                        bill.total
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                PAYMENT METHOD
            ================================================== */}

            <div className="mt-4">
              <h5 className="fw-semibold mb-2">
                Payment Method
              </h5>

              <div className="alert alert-info mb-0">
                {bill.paymentMethod}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}