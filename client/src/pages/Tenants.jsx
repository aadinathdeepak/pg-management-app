import { useState, useEffect } from "react";
import axios from "axios";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);

  const fetchTenants = () => {
    axios
      .get("http://localhost:5000/api/tenants")
      .then((res) => setTenants(res.data));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const markPaid = async (tenantId, month) => {
    await axios.post("http://localhost:5000/api/tenants/pay", {
      tenantId,
      month,
    });
    fetchTenants();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Tenant Directory</h2>
      <div className="overflow-x-auto bg-base-100 shadow-xl rounded-xl">
        <table className="table w-full">
          <thead className="bg-base-200">
            <tr>
              <th>Name / Contact</th>
              <th>Room</th>
              <th>Rent History</th>
              <th>Total Due</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t._id} className="hover">
                <td>
                  <div className="font-bold text-lg">{t.name}</div>
                  <div className="text-sm opacity-50">{t.phone}</div>
                </td>
                <td>
                  <span className="badge badge-ghost font-bold">
                    {t.room?.roomNumber || "N/A"}
                  </span>
                </td>
                <td className="flex gap-2 flex-wrap">
                  {t.rentHistory.map((h, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        h.status === "Pending" && markPaid(t._id, h.month)
                      }
                      className={`badge badge-lg cursor-pointer transition-all ${
                        h.status === "Paid"
                          ? "badge-success text-white"
                          : "badge-error text-white animate-pulse"
                      }`}
                    >
                      {h.month}
                    </button>
                  ))}
                </td>
                <td className="text-error font-mono font-bold text-lg">
                  ₹{t.totalDues}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
