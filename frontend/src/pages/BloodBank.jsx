import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function BloodBank() {
  const [stock, setStock] = useState([]);

  useEffect(() => {
    api
      .get("/blood-bank")
      .then((res) => setStock(res.data))
      .catch(() => {});
  }, []);

  const statusFor = (units) => {
    if (units <= 5) {
      return {
        label: "Low Stock",
        className: "text-bg-danger",
      };
    }

    if (units <= 15) {
      return {
        label: "Moderate",
        className: "text-bg-warning",
      };
    }

    return {
      label: "Sufficient",
      className: "text-bg-success",
    };
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h2 className="mb-4">
          Blood Bank Stock
        </h2>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Blood Group</th>
                <th>Units Available</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {stock.map((s) => {
                const status = statusFor(
                  s.unitsAvailable
                );

                return (
                  <tr key={s._id}>
                    <td>
                      <strong>
                        {s.bloodGroup}
                      </strong>
                    </td>

                    <td>
                      {s.unitsAvailable}
                    </td>

                    <td>
                      <span
                        className={`badge ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {stock.length === 0 && (
          <div className="alert alert-secondary mb-0">
            No blood stock data available.
          </div>
        )}
      </div>
    </div>
  );
}