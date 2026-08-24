import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/axios.js";

export default function QRScanner() {
  const scannerRef = useRef(null);
  const scanHandledRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ==========================================================
  // START CAMERA
  // ==========================================================

  const startScanner = async () => {
    setError("");
    setPatient(null);
    scanHandledRef.current = false;

    if (!user) {
      setError("Please log in first.");
      return;
    }

    if (user.role !== "doctor" && user.role !== "admin") {
      setError("Only doctors and admins can scan patient QR codes.");
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");

      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },

        // QR SUCCESS
        async (decodedText) => {
          if (scanHandledRef.current) {
            return;
          }

          scanHandledRef.current = true;

          await handleQRCode(decodedText);
        },

        // QR SCAN FAILURE
        () => {
          // Intentionally empty.
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Scanner start error:", err);

      setError(
        "Could not access the camera. Please allow camera permission and try again."
      );
    }
  };

  // ==========================================================
  // STOP CAMERA
  // ==========================================================

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();

        // Html5Qrcode scanning state = 2
        if (state === 2) {
          await scannerRef.current.stop();
        }

        await scannerRef.current.clear();

        scannerRef.current = null;
      }
    } catch (err) {
      console.error("Scanner stop error:", err);
    }

    setScanning(false);
  };

  // ==========================================================
  // PROCESS SCANNED QR
  // ==========================================================

  const handleQRCode = async (qrId) => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Stop camera after successful scan.
      await stopScanner();

      // Send QR ID to backend.
      const response = await api.get(
        `/qr/scan/${encodeURIComponent(qrId)}`
      );

      setPatient(response.data.patient);
    } catch (err) {
      console.error("Patient lookup error:", err);

      setPatient(null);

      setError(
        err.response?.data?.message ||
          "Could not find patient information."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CLEAN UP CAMERA
  // ==========================================================

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, []);

  // ==========================================================
  // ACCESS CONTROL
  // ==========================================================

  if (
    !user ||
    (user.role !== "doctor" && user.role !== "admin")
  ) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="fw-bold text-dark">
              Patient QR Scanner
            </h2>

            <div className="alert alert-danger mt-3 mb-0">
              Only doctors and admins can access the patient QR
              scanner.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-vh-100 bg-light py-4 py-md-5">
      <div className="container">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "52px",
                  height: "52px",
                }}
              >
                <span className="fs-4">▣</span>
              </div>

              <div>
                <h1 className="h2 fw-bold text-dark mb-1">
                  Patient QR Scanner
                </h1>

                <p className="text-muted mb-0">
                  Securely retrieve patient information by
                  scanning their CureConnect QR code.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show shadow-sm"
            role="alert"
          >
            <strong>Error:</strong> {error}

            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
              aria-label="Close"
            />
          </div>
        )}

        {/* ====================================================
            SCANNER
        ==================================================== */}

        {!patient && (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4 p-md-5 text-center">
              <div className="mb-4">
                <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                  QR CODE SCANNER
                </span>
              </div>

              <h2 className="h4 fw-bold text-dark mb-2">
                Scan Patient QR Code
              </h2>

              <p className="text-muted mb-4">
                Point the camera at the patient's QR code.
                The scanner will automatically detect it.
              </p>

              {/* Camera appears here */}
              <div
                id="qr-reader"
                className="mx-auto mb-4"
                style={{
                  maxWidth: "500px",
                  width: "100%",
                }}
              />

              {/* Start button */}
              {!scanning && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg px-4 shadow-sm"
                  onClick={startScanner}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="me-2">📷</span>
                      Start Camera
                    </>
                  )}
                </button>
              )}

              {/* Stop button */}
              {scanning && (
                <button
                  type="button"
                  className="btn btn-danger btn-lg px-4 shadow-sm"
                  onClick={stopScanner}
                >
                  <span className="me-2">■</span>
                  Stop Scanner
                </button>
              )}

              <div className="mt-4 text-muted small">
                <span className="me-2">🔒</span>
                Only authorized doctors and admins can use
                this scanner.
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            PATIENT INFORMATION
        ==================================================== */}

        {patient && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              {/* Patient header */}
              <div className="d-flex align-items-center gap-3 pb-4 mb-4 border-bottom">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: "70px",
                    height: "70px",
                    fontSize: "28px",
                    flexShrink: 0,
                  }}
                >
                  {patient.name
                    ? patient.name.charAt(0).toUpperCase()
                    : "P"}
                </div>

                <div>
                  <h2 className="h3 fw-bold text-dark mb-1">
                    {patient.name || "Unknown Patient"}
                  </h2>

                  <p className="text-muted mb-0">
                    <span className="badge bg-success-subtle text-success">
                      CureConnect Patient
                    </span>
                  </p>
                </div>
              </div>

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <div className="mb-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="bg-primary rounded"
                    style={{
                      width: "5px",
                      height: "25px",
                    }}
                  />

                  <h3 className="h5 fw-bold text-dark mb-0">
                    Personal Information
                  </h3>
                </div>

                <div className="row g-3">
                  <InfoItem
                    label="Full Name"
                    value={patient.name}
                    icon="👤"
                  />

                  <InfoItem
                    label="Email"
                    value={patient.email}
                    icon="✉️"
                  />

                  <InfoItem
                    label="Phone"
                    value={patient.phone}
                    icon="📞"
                  />

                  <InfoItem
                    label="National ID"
                    value={patient.nationalId}
                    icon="🪪"
                  />
                </div>
              </div>

              {/* =================================================
                  MEDICAL INFORMATION
              ================================================= */}

              <div className="mb-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="bg-danger rounded"
                    style={{
                      width: "5px",
                      height: "25px",
                    }}
                  />

                  <h3 className="h5 fw-bold text-dark mb-0">
                    Medical Information
                  </h3>
                </div>

                <div className="row g-3">
                  <InfoItem
                    label="Blood Group"
                    value={patient.bloodGroup}
                    icon="🩸"
                  />

                  <InfoItem
                    label="Allergies"
                    value={patient.allergies}
                    icon="⚠️"
                  />
                </div>
              </div>

              {/* =================================================
                  EMERGENCY INFORMATION
              ================================================= */}

              <div className="mb-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="bg-warning rounded"
                    style={{
                      width: "5px",
                      height: "25px",
                    }}
                  />

                  <h3 className="h5 fw-bold text-dark mb-0">
                    Emergency Contact
                  </h3>
                </div>

                <div className="row g-3">
                  <InfoItem
                    label="Emergency Contact"
                    value={patient.emergencyContact}
                    icon="🚨"
                  />
                </div>
              </div>

              {/* =================================================
                  QR ID
              ================================================= */}

              <div className="alert alert-primary border-0 rounded-3 mb-4">
                <div className="d-flex align-items-start gap-2">
                  <span className="fs-5">🔐</span>

                  <div>
                    <strong>Patient QR ID</strong>

                    <div className="mt-1 text-break">
                      {patient.qrId || "Not available"}
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SCAN ANOTHER
              ================================================= */}

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={() => {
                    setPatient(null);
                    setError("");
                    scanHandledRef.current = false;
                  }}
                >
                  <span className="me-2">📷</span>
                  Scan Another Patient
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// INFORMATION ITEM
// ==========================================================

function InfoItem({ label, value, icon }) {
  return (
    <div className="col-12 col-md-6">
      <div className="bg-light rounded-3 p-3 h-100 border">
        <div className="d-flex align-items-center gap-2 mb-2">
          {icon && <span>{icon}</span>}

          <p className="text-muted small fw-semibold mb-0">
            {label}
          </p>
        </div>

        <p className="text-dark fw-medium mb-0 text-break">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}