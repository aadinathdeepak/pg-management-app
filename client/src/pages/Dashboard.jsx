import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    openComplaints: 0,
    pendingRent: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard")
      .then((res) => setStats(res.data));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="stat bg-base-100 shadow-xl rounded-box border border-base-200">
          <div className="stat-title">Total Rooms</div>
          <div className="stat-value text-primary">{stats.totalRooms}</div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box border border-base-200">
          <div className="stat-title">Pending Rent</div>
          <div className="stat-value text-error">
            ₹{stats.pendingRent.toLocaleString()}
          </div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box border border-base-200">
          <div className="stat-title">Open Issues</div>
          <div className="stat-value text-warning">{stats.openComplaints}</div>
        </div>
      </div>
    </div>
  );
}
