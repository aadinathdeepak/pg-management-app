import { useState, useEffect } from "react";
import axios from "axios";
import RentGrid from "../components/RentGrid";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]); // To populate dropdown
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    roomNumber: "", // Will store "101"
    joinDate: new Date().toISOString().split("T")[0], // Default to Today
    depositAmount: "",
    rentAmount: "",
  });

  // Fetch Data
  const fetchData = async () => {
    const tRes = await axios.get("http://localhost:5000/api/tenants");
    const rRes = await axios.get("http://localhost:5000/api/rooms");
    setTenants(tRes.data);
    setRooms(rRes.data);
    // Set default room if available
    if (rRes.data.length > 0)
      setFormData((prev) => ({ ...prev, roomNumber: rRes.data[0].roomNumber }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/tenants/add", formData);
      setIsModalOpen(false); // Close Modal
      fetchData(); // Refresh List
      // Reset Form (Optional)
      setFormData({
        ...formData,
        name: "",
        phone: "",
        depositAmount: "",
        rentAmount: "",
      });
    } catch (err) {
      alert("Error adding tenant. Check console.");
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8 border-b border-base-300 pb-4">
        <div>
          <h2 className="text-3xl font-bold">Tenants</h2>
          <p className="text-sm opacity-60 mt-1">
            Manage occupants and payments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            + Add Tenant
          </button>
          <div className="badge badge-neutral badge-lg font-mono opacity-80 h-8">
            {new Date().getFullYear()} Cycle
          </div>
        </div>
      </div>

      {/* MODAL (The Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-base-100 p-6 rounded-xl shadow-2xl w-full max-w-md border border-base-300">
            <h3 className="font-bold text-lg mb-4">Add New Tenant</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Name */}
              <input
                type="text"
                name="name"
                placeholder="Tenant Name"
                required
                className="input input-bordered w-full"
                onChange={handleChange}
                value={formData.name}
              />

              {/* Phone */}
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                required
                className="input input-bordered w-full"
                onChange={handleChange}
                value={formData.phone}
              />

              <div className="flex gap-2">
                {/* Room Select */}
                <select
                  name="roomNumber"
                  className="select select-bordered w-1/2"
                  onChange={handleChange}
                  value={formData.roomNumber}
                  required
                >
                  <option disabled value="">
                    Select Room
                  </option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r.roomNumber}>
                      Room {r.roomNumber}
                    </option>
                  ))}
                </select>

                {/* Join Date */}
                <input
                  type="date"
                  name="joinDate"
                  required
                  className="input input-bordered w-1/2"
                  onChange={handleChange}
                  value={formData.joinDate}
                />
              </div>

              <div className="flex gap-2">
                {/* Deposit */}
                <input
                  type="number"
                  name="depositAmount"
                  placeholder="Deposit (₹)"
                  required
                  className="input input-bordered w-1/2"
                  onChange={handleChange}
                  value={formData.depositAmount}
                />

                {/* Rent Amount */}
                <input
                  type="number"
                  name="rentAmount"
                  placeholder="Monthly Rent (₹)"
                  required
                  className="input input-bordered w-1/2"
                  onChange={handleChange}
                  value={formData.rentAmount}
                />
              </div>

              <div className="modal-action mt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <table className="table w-full">
          <thead className="bg-base-200 text-base-content/70 uppercase text-xs tracking-wider font-semibold">
            <tr>
              <th className="py-4 pl-6">Tenant Name</th>
              <th>Room</th>
              <th>Rent Status (Jan - Dec)</th>
              <th className="text-right">Deposit</th>
              <th className="text-right pr-6">Dues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {tenants.map((t) => (
              <tr key={t._id} className="group">
                <td className="py-5 pl-6">
                  <div className="flex items-center gap-4">
                    <div className="avatar placeholder">
                      <div className="bg-neutral-focus text-neutral-content rounded-xl w-10 h-10 flex items-center justify-center bg-base-300">
                        <span className="text-lg font-bold opacity-70">
                          {t.name[0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-base">{t.name}</div>
                      <div className="text-xs opacity-50 font-mono mt-0.5">
                        {t.phone}
                      </div>
                      <div className="text-[10px] opacity-40 uppercase tracking-wide mt-1 font-semibold">
                        Joined: {new Date(t.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="badge badge-outline font-mono text-xs opacity-80">
                    {t.room?.roomNumber || "N/A"}
                  </div>
                </td>
                <td className="whitespace-nowrap min-w-fit px-4">
                  <RentGrid tenant={t} onUpdate={fetchData} />
                </td>
                <td className="text-right font-mono text-sm opacity-80">
                  ₹{t.depositAmount?.toLocaleString() || 0}
                </td>
                <td className="text-right pr-6">
                  {t.totalDues > 0 ? (
                    <span className="text-rose-500 font-bold font-mono">
                      ₹{t.totalDues.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-bold font-mono text-xs uppercase tracking-wide">
                      Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
