import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function MyProfile() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
    emergencyContactName: "",
  });

  // ==========================================
  // LOAD PATIENT PROFILE
  // ==========================================

  useEffect(() => {
    if (!user) {
      setError("Please log in as a patient to view your profile.");
      return;
    }

    api
      .get(`/qr/${user.id}`)
      .then((res) => {
        setData(res.data);

        const patient = res.data.patient;

        setForm({
          name: patient.name || "",
          phone: patient.phone || "",
          dateOfBirth: patient.dateOfBirth
            ? patient.dateOfBirth.substring(0, 10)
            : "",
          gender: patient.gender || "",
          address: patient.address || "",
          bloodGroup: patient.bloodGroup || "",
          allergies: patient.allergies || "",
          emergencyContact: patient.emergencyContact || "",
          emergencyContactName: patient.emergencyContactName || "",
        });
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Could not load your profile."
        );
      });
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  async function handleSave() {
    if (!user) {
      setError("Please log in again.");
      return;
    }

    // Name validation
    const namePattern = /^[A-Za-z\s]+$/;

    if (!namePattern.test(form.name.trim())) {
      setError("Name can contain letters and spaces only.");
      return;
    }

    // Emergency contact name validation
    if (
      form.emergencyContactName.trim() &&
      !namePattern.test(form.emergencyContactName.trim())
    ) {
      setError(
        "Emergency Contact Name can contain letters and spaces only."
      );
      return;
    }

    // Phone validation
    const phonePattern = /^01[3-9]\d{8}$/;

    if (!phonePattern.test(form.phone.trim())) {
      setError("Please enter a valid Bangladesh phone number.");
      return;
    }

    // Emergency contact number validation
    if (
      form.emergencyContact.trim() &&
      !phonePattern.test(form.emergencyContact.trim())
    ) {
      setError("Please enter a valid emergency contact number.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.put(`/patients/${user.id}`, form);

      // Update displayed patient data
      setData((prev) => ({
        ...prev,
        patient: {
          ...prev.patient,
          ...res.data.patient,
        },
      }));

      // Update localStorage name
      const updatedUser = {
        ...user,
        name: res.data.patient.name,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditing(false);
      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // CANCEL EDITING
  // ==========================================

  function handleCancel() {
    const patient = data.patient;

    setForm({
      name: patient.name || "",
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth
        ? patient.dateOfBirth.substring(0, 10)
        : "",
      gender: patient.gender || "",
      address: patient.address || "",
      bloodGroup: patient.bloodGroup || "",
      allergies: patient.allergies || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyContactName: patient.emergencyContactName || "",
    });

    setEditing(false);
    setError("");
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !data) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (!data) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="text-secondary mb-0">
          Loading profile...
        </p>
      </div>
    );
  }

  const patient = data.patient;

  // ==========================================
  // PROFILE PAGE
  // ==========================================

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container">

        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>
            <h1 className="fw-bold text-dark mb-2">
              My Profile
            </h1>

            <p className="text-secondary mb-0">
              View and update your personal and medical information
            </p>
          </div>

          {!editing && (
            <button
              className="btn btn-primary px-4 fw-semibold"
              onClick={() => {
                setEditing(true);
                setSuccess("");
                setError("");
              }}
            >
              <i className="bi bi-pencil-square me-2"></i>
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}

            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess("")}
            ></button>
          </div>
        )}

        {/* Error Message */}
        {error && data && (
          <div className="alert alert-danger shadow-sm">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Patient Header Card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">

            <div className="d-flex align-items-center gap-3">

              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: "70px",
                  height: "70px",
                  fontSize: "28px",
                }}
              >
                {patient.name
                  ? patient.name.charAt(0).toUpperCase()
                  : "P"}
              </div>

              <div>
                <h2 className="fw-bold mb-1">
                  {patient.name || "Not set"}
                </h2>

                <span className="badge bg-primary-subtle text-primary px-3 py-2">
                  Patient
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* Personal Information */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">

            <h2 className="h4 fw-bold text-dark mb-4">
              <i className="bi bi-person-circle text-primary me-2"></i>
              Personal Information
            </h2>

            <div className="row g-3">

              {editing ? (
                <>
                  <InputItem
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Email"
                    value={patient.email}
                    col="col-12 col-md-6"
                  />

                  <InputItem
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Give any valid Bangladeshi number"
                    col="col-12 col-md-6"
                  />

                  <InputItem
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    col="col-12 col-md-6"
                  />

                  <SelectItem
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={["Male", "Female", "Other"]}
                    col="col-12 col-md-6"
                  />

                  <InputItem
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    col="col-12 col-md-6"
                  />
                </>
              ) : (
                <>
                  <InfoItem
                    label="Name"
                    value={patient.name}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Email"
                    value={patient.email}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Phone"
                    value={patient.phone}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Date of Birth"
                    value={formatDate(patient.dateOfBirth)}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Gender"
                    value={patient.gender}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Address"
                    value={patient.address}
                    col="col-12 col-md-6"
                  />
                </>
              )}

            </div>

          </div>
        </div>

        {/* Medical Information */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">

            <h2 className="h4 fw-bold text-dark mb-4">
              <i className="bi bi-prescription2 text-primary me-2"></i>
              Medical Information
            </h2>

            <div className="row g-3">

              {editing ? (
                <>
                  <SelectItem
                    label="Blood Group"
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    options={[
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                    ]}
                    col="col-12 col-md-6"
                  />

                  <InputItem
                    label="Allergies"
                    name="allergies"
                    value={form.allergies}
                    onChange={handleChange}
                    placeholder="Example: Penicillin"
                    col="col-12 col-md-6"
                  />
                </>
              ) : (
                <>
                  <InfoItem
                    label="Blood Group"
                    value={patient.bloodGroup}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Allergies"
                    value={patient.allergies}
                    col="col-12 col-md-6"
                  />
                </>
              )}

            </div>

          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">

            <h2 className="h4 fw-bold text-dark mb-4">
              <i className="bi bi-telephone-fill text-success me-2"></i>
              Emergency Contact
            </h2>

            <div className="row g-3">

              {editing ? (
                <>
                  <InputItem
                    label="Contact Number"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Example: 01612345678"
                    col="col-12 col-md-6"
                  />

                  <InputItem
                    label="Emergency Contact Name"
                    name="emergencyContactName"
                    value={form.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Example: Rahim Abdullah"
                    col="col-12 col-md-6"
                  />
                </>
              ) : (
                <>
                  <InfoItem
                    label="Contact Number"
                    value={patient.emergencyContact}
                    col="col-12 col-md-6"
                  />

                  <InfoItem
                    label="Emergency Contact Name"
                    value={patient.emergencyContactName}
                    col="col-12 col-md-6"
                  />
                </>
              )}

            </div>

          </div>
        </div>

        {/* Save / Cancel Buttons */}
        {editing && (
          <div className="d-flex justify-content-end gap-2 mb-4">

            <button
              className="btn btn-outline-secondary px-4 fw-semibold"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="btn btn-success px-4 fw-semibold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Save Changes
                </>
              )}
            </button>

          </div>
        )}

        {/* QR Code */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">

            <div className="row align-items-center g-4">

              <div className="col-12 col-md">

                <h2 className="h4 fw-bold text-dark mb-3">
                  <i className="bi bi-qr-code text-primary me-2"></i>
                  Patient QR Code
                </h2>

                <p className="text-secondary mb-0">
                  Hospital staff can scan this QR code
                  to quickly access your medical information.
                </p>

              </div>

              <div className="col-12 col-md-auto">

                <div
                  className="border rounded-3 bg-white d-flex align-items-center justify-content-center p-2"
                  style={{
                    width: "190px",
                    height: "190px",
                  }}
                >
                  {data.qrCode ? (
                    <img
                      src={data.qrCode}
                      alt="Patient QR Code"
                      className="img-fluid"
                      style={{
                        width: "180px",
                        height: "180px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <p className="text-secondary text-center small mb-0">
                      QR Code not available
                    </p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ==========================================
   INFORMATION ITEM
========================================== */

function InfoItem({ label, value, col = "col-12 col-md-6" }) {
  return (
    <div className={col}>
      <div className="bg-light rounded-3 p-3 h-100">

        <div className="text-secondary small fw-semibold mb-2">
          {label}
        </div>

        <div className="text-dark fw-medium">
          {value || "Not set"}
        </div>

      </div>
    </div>
  );
}

/* ==========================================
   INPUT ITEM
========================================== */

function InputItem({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  col = "col-12 col-md-6",
}) {
  function handleInputChange(e) {
    let value = e.target.value;

    // Name fields: letters and spaces only
    if (
      name === "name" ||
      name === "emergencyContactName"
    ) {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    // Phone fields: numbers only
    if (
      name === "phone" ||
      name === "emergencyContact"
    ) {
      value = value.replace(/\D/g, "");
    }

    onChange({
      target: {
        name,
        value,
      },
    });
  }

  return (
    <div className={col}>
      <div className="bg-light rounded-3 p-3 h-100">

        <label className="form-label text-secondary small fw-semibold">
          {label}
        </label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="form-control"
        />

      </div>
    </div>
  );
}

/* ==========================================
   SELECT ITEM
========================================== */

function SelectItem({
  label,
  name,
  value,
  onChange,
  options,
  col = "col-12 col-md-6",
}) {
  return (
    <div className={col}>
      <div className="bg-light rounded-3 p-3 h-100">

        <label className="form-label text-secondary small fw-semibold">
          {label}
        </label>

        <select
          name={name}
          value={value}
          onChange={onChange}
          className="form-select"
        >
          <option value="">
            Select {label}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}

/* ==========================================
   DATE FORMATTER
========================================== */

function formatDate(date) {
  if (!date) {
    return "Not set";
  }

  const formattedDate = new Date(date);

  if (isNaN(formattedDate.getTime())) {
    return date;
  }

  return formattedDate.toLocaleDateString("en-GB");
}