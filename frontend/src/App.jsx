import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Doctors from "./pages/Doctors.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import QRScanner from "./pages/QRScanner.jsx";

import LabVerification from "./pages/LabVerification.jsx";
import BloodBank from "./pages/BloodBank.jsx";
import Billing from "./pages/Billing.jsx";
import Complaint from "./pages/Complaint.jsx";
import LabReports from "./pages/LabReports.jsx";

export default function App() {
  return (
    <>
      <Navbar />

      <main className="page-container">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/doctors" element={<Doctors />} />

            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/qr-scanner" element={<QRScanner />} />

            <Route
              path="/lab-verification"
              element={<LabVerification />}
            />

            <Route path="/blood-bank" element={<BloodBank />} />

            <Route path="/billing" element={<Billing />} />

            <Route path="/complaint" element={<Complaint />} />

            <Route path="/lab-reports" element={<LabReports />} />
          </Routes>
        </div>
      </main>
    </>
  );
}