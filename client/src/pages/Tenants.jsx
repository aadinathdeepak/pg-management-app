import { useState, useEffect } from "react";
import axios from "axios";
import RentGrid from "../components/RentGrid";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // NULL = Add Mode, ID = Edit Mode

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    roomNumber: "",
    joinDate: new Date().toISOString().split("T")[0],
    depositAmount: "",
    rentAmount: "",
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      const tRes = await axios.get("http://localhost:5000/api/tenants");
      const rRes = await axios.get("http://localhost:5000/api/rooms");
      setTenants(tRes.data);
      setRooms(rRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---

  const handleEdit = (tenant) => {
    setEditId(tenant._id);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      roomNumber: tenant.room?.roomNumber || "",
      joinDate: new Date(tenant.joinDate).toISOString().split("T")[0],
      depositAmount: tenant.depositAmount,
      rentAmount: tenant.rentAmount,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setFormData({
      name: "",
      phone: "",
      roomNumber: rooms[0]?.roomNumber || "",
      joinDate: new Date().toISOString().split("T")[0],
      depositAmount: "",
      rentAmount: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tenants/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting tenant");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/tenants/${editId}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/tenants/add", formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Operation failed. Check console.");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    // CHANGE 1: 'w-full' instead of 'max-w-[1600px]' to use full screen width
    <div className="p-6 w-full min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6 border-b border-base-300 pb-4">
        <div>
          <h2 className="text-3xl font-bold">Tenants</h2>
          <p className="text-sm opacity-60 mt-1">
            Manage occupants and payments
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAdd} className="btn btn-primary btn-sm">
            + Add Tenant
          </button>
          <div className="badge badge-neutral badge-lg font-mono opacity-80 h-8">
            {new Date().getFullYear()} Cycle
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-base-100 p-6 rounded-xl shadow-2xl w-full max-w-md border border-base-300">
            <h3 className="font-bold text-lg mb-4">
              {editId ? "Edit Tenant" : "Add New Tenant"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                className="input input-bordered w-full"
                onChange={handleChange}
                value={formData.name}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                required
                className="input input-bordered w-full"
                onChange={handleChange}
                value={formData.phone}
              />
              <div className="flex gap-2">
                <select
                  name="roomNumber"
                  className="select select-bordered w-1/2"
                  onChange={handleChange}
                  value={formData.roomNumber}
                  required
                  disabled={!!editId}
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
                <input
                  type="number"
                  name="depositAmount"
                  placeholder="Deposit"
                  required
                  className="input input-bordered w-1/2"
                  onChange={handleChange}
                  value={formData.depositAmount}
                />
                <input
                  type="number"
                  name="rentAmount"
                  placeholder="Rent"
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
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      {/* CHANGE 2: Removed overflow-x-auto constraint logic by ensuring parent is huge */}
      <div className="rounded-lg border border-base-300 bg-base-100 shadow-sm w-full">
        <table className="table w-full table-auto">
          <thead className="bg-base-200 text-base-content/70 uppercase text-xs tracking-wider font-semibold">
            <tr>
              <th className="py-4 pl-6 text-left">Tenant Name</th>
              <th className="text-center">Room</th>
              <th className="text-center px-2">Rent Status (Jan - Dec)</th>
              <th className="text-right">Deposit</th>
              <th className="text-right">Dues</th>
              <th className="text-right pr-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-base-200">
            {tenants.map((t) => (
              <tr key={t._id} className="group">
                {/* 1. Name */}
                <td className="py-5 pl-6 w-1/5">
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

                {/* 2. Room */}
                <td className="text-center w-[100px]">
                  <div className="badge badge-outline font-mono text-xs opacity-80">
                    {t.room?.roomNumber || "N/A"}
                  </div>
                </td>

                {/* 3. Grid (No wrap) */}
                <td className="whitespace-nowrap px-4">
                  <div className="flex justify-center">
                    <RentGrid tenant={t} onUpdate={fetchData} />
                  </div>
                </td>

                {/* 4. Deposit */}
                <td className="text-right font-mono text-sm opacity-80 w-[120px]">
                  ₹{t.depositAmount?.toLocaleString() || 0}
                </td>

                {/* 5. Dues */}
                <td className="text-right font-mono w-[120px]">
                  {t.totalDues > 0 ? (
                    <span className="text-rose-500 font-bold">
                      ₹{t.totalDues.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-bold text-xs uppercase tracking-wide">
                      Paid
                    </span>
                  )}
                </td>

                {/* 6. Actions */}
                <td className="text-right pr-6 w-[100px]">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="btn btn-square btn-xs btn-ghost text-info"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="btn btn-square btn-xs btn-ghost text-error"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
