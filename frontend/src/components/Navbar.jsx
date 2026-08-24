import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        <Link
          to="/"
          className="navbar-brand fw-bold text-primary"
        >
          CureConnect
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="mainNavbar"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/doctors">
                Find a Doctor
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/blood-bank">
                Blood Bank
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/complaint">
                Feedback
              </Link>
            </li>

            {user?.role === "patient" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-profile">
                    My Profile
                  </Link>
                </li>

                
              </>
            )}

            {(user?.role === "doctor" ||
              user?.role === "admin") && (
              <>
                

                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/lab-verification"
                  >
                    Lab Reports
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/billing">
                    Billing
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex">
            {!user ? (
              <Link
                to="/login"
                className="btn btn-primary"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={logout}
              >
                Logout ({user.name})
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}