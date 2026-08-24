import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Billing() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  const [items, setItems] = useState([
    {
      name: "Consultation Fee",
      amount: 0,
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [bill, setBill] = useState(null);

  const [loadingPatients, setLoadingPatients] = useState(true);

  const [creatingBill, setCreatingBill] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ============================================================
  // LOAD PATIENTS
  // ============================================================

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);

        const res = await api.get("/patients");

        setPatients(res.data);
      } catch (err) {
        console.error("Failed to load patients:", err);

        alert(
          err.response?.data?.message ||
            "Unable to load patients."
        );
      } finally {
        setLoadingPatients(false);
      }
    };

    // Only doctor/admin should load patients
    if (
      user?.role === "doctor" ||
      user?.role === "admin"
    ) {
      loadPatients();
    } else {
      setLoadingPatients(false);
    }
  }, []);

  // ============================================================
  // UPDATE ITEM
  // ============================================================

  const updateItem = (index, field, value) => {
    const next = [...items];

    next[index][field] =
      field === "amount" ? Number(value) : value;

    setItems(next);
  };

  // ============================================================
  // ADD ITEM
  // ============================================================

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        amount: 0,
      },
    ]);
  };

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const removeItem = (index) => {
    if (items.length === 1) {
      alert("At least one bill item is required.");
      return;
    }

    setItems(items.filter((_, i) => i !== index));
  };

  // ============================================================
  // GENERATE BILL
  // ============================================================

  const generateInvoice = async () => {
    try {
      // ------------------------------------------
      // Validate patient
      // ------------------------------------------

      if (!selectedPatient) {
        alert("Please select a patient first.");
        return;
      }

      // ------------------------------------------
      // Validate items
      // ------------------------------------------

      for (const item of items) {
        if (!item.name || item.name.trim() === "") {
          alert(
            "Please enter a name for every bill item."
          );
          return;
        }

        if (
          Number.isNaN(item.amount) ||
          item.amount < 0
        ) {
          alert(
            "Please enter a valid amount for every item."
          );
          return;
        }
      }

      setCreatingBill(true);

      // ------------------------------------------
      // Send bill to backend
      // ------------------------------------------

      const res = await api.post("/bills", {
        patientId: selectedPatient,
        items,
        paymentMethod,
      });

      // Backend returns:
      // {
      //   message,
      //   bill
      // }

      setBill(res.data.bill);

      alert("Bill created successfully.");
    } catch (err) {
      console.error("Generate bill error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to create bill."
      );
    } finally {
      setCreatingBill(false);
    }
  };

  // ============================================================
  // ACCESS CONTROL
  // ============================================================

  if (
    !user ||
    (user.role !== "doctor" &&
      user.role !== "admin")
  ) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-5">
                <div
                  className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "70px",
                    height: "70px",
                    fontSize: "30px",
                  }}
                >
                  🔒
                </div>

                <h2 className="fw-bold mb-3">
                  Billing Access Restricted
                </h2>

                <p className="text-muted mb-0">
                  Only doctors and administrators can
                  create bills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // CALCULATE PREVIEW
  // ============================================================

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const tax = Math.round(subtotal * 0.05);

  const total = subtotal + tax;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-9">

          {/* ======================================================
              PAGE HEADER
          ====================================================== */}

          <div className="text-center mb-4">
            <div
              className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "70px",
                height: "70px",
                fontSize: "32px",
              }}
            >
              💳
            </div>

            <h2 className="fw-bold text-primary mb-2">
              Create Patient Bill
            </h2>

            <p className="text-muted mb-0">
              Select a patient and enter the services
              or charges for the bill.
            </p>
          </div>

          <div className="card border-0 shadow-lg">
            <div className="card-body p-4 p-md-5">

              {/* ======================================================
                  SELECT PATIENT
              ====================================================== */}

              <div className="mb-4">
                <label
                  htmlFor="patient"
                  className="form-label fw-semibold"
                >
                  Select Patient
                </label>

                <select
                  id="patient"
                  className="form-select form-select-lg"
                  value={selectedPatient}
                  onChange={(e) =>
                    setSelectedPatient(e.target.value)
                  }
                  disabled={loadingPatients}
                >
                  <option value="">
                    {loadingPatients
                      ? "Loading patients..."
                      : "Select a patient"}
                  </option>

                  {patients.map((patient) => (
                    <option
                      key={patient._id}
                      value={patient._id}
                    >
                      {patient.name} — {patient.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* ======================================================
                  BILL ITEMS
              ====================================================== */}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1">
                    Bill Items
                  </h4>

                  <small className="text-muted">
                    Add services, consultations, tests,
                    or other charges.
                  </small>
                </div>

                <span className="badge bg-primary rounded-pill">
                  {items.length}{" "}
                  {items.length === 1
                    ? "Item"
                    : "Items"}
                </span>
              </div>

              <div className="mb-4">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="card border bg-light mb-3"
                  >
                    <div className="card-body">
                      <div className="row g-3 align-items-end">

                        {/* Item Name */}

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">
                            Service / Item
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            placeholder="Item / Service name"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(
                                i,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* Amount */}

                        <div className="col-12 col-md-4">
                          <label className="form-label fw-semibold">
                            Amount (Tk)
                          </label>

                          <div className="input-group">
                            <span className="input-group-text">
                              Tk
                            </span>

                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              placeholder="Amount"
                              value={item.amount}
                              onChange={(e) =>
                                updateItem(
                                  i,
                                  "amount",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Remove */}

                        <div className="col-12 col-md-2">
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() =>
                              removeItem(i)
                            }
                          >
                            Remove
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addItem}
                >
                  + Add Item
                </button>
              </div>

              {/* ======================================================
                  PAYMENT METHOD
              ====================================================== */}

              <div className="mb-4">
                <label
                  htmlFor="paymentMethod"
                  className="form-label fw-semibold"
                >
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                >
                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Insurance">
                    Insurance
                  </option>
                </select>
              </div>

              {/* ======================================================
                  BILL SUMMARY
              ====================================================== */}

              <div className="card border-primary border-opacity-25 bg-primary bg-opacity-10 mb-4">
                <div className="card-body p-4">

                  <h4 className="fw-bold text-primary mb-4">
                    Bill Summary
                  </h4>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">
                      Subtotal
                    </span>

                    <strong>
                      Tk {subtotal.toFixed(2)}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">
                      Tax (5%)
                    </span>

                    <strong>
                      Tk {tax.toFixed(2)}
                    </strong>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-5">
                      Total
                    </span>

                    <span className="fw-bold fs-4 text-primary">
                      Tk {total.toFixed(2)}
                    </span>
                  </div>

                </div>
              </div>

              {/* ======================================================
                  CREATE BILL BUTTON
              ====================================================== */}

              <div className="d-grid">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={generateInvoice}
                  disabled={creatingBill}
                >
                  {creatingBill ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>

                      Creating Bill...
                    </>
                  ) : (
                    <>
                      🧾 Generate Bill
                    </>
                  )}
                </button>
              </div>

              {/* ======================================================
                  CREATED BILL
              ====================================================== */}

              {bill && (
                <div className="card border-success mt-4">
                  <div className="card-header bg-success text-white">
                    <h4 className="mb-0">
                      ✓ Bill Created Successfully
                    </h4>
                  </div>

                  <div className="card-body">

                    <div className="row g-3">

                      <div className="col-12">
                        <div className="bg-light rounded p-3">
                          <small className="text-muted d-block">
                            Bill ID
                          </small>

                          <strong className="text-break">
                            {bill._id}
                          </strong>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3">
                          <small className="text-muted d-block">
                            Subtotal
                          </small>

                          <strong>
                            Tk {bill.subtotal}
                          </strong>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3">
                          <small className="text-muted d-block">
                            Tax
                          </small>

                          <strong>
                            Tk {bill.tax}
                          </strong>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3">
                          <small className="text-muted d-block">
                            Total
                          </small>

                          <strong className="text-success fs-5">
                            Tk {bill.total}
                          </strong>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3">
                          <small className="text-muted d-block">
                            Payment Method
                          </small>

                          <strong>
                            {bill.paymentMethod}
                          </strong>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="d-flex align-items-center gap-2">
                          <strong>
                            Status:
                          </strong>

                          <span className="badge bg-success">
                            {bill.status}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}