import { useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [formData, setFormData] = useState({
    roomNumber: "101",
    issueType: "WiFi",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/complaints", {
        ...formData,
        isResolved: false,
        dateRaised: new Date(),
      });
      alert("Complaint Raised Successfully!");
      setFormData({ ...formData, description: "" });
    } catch (err) {
      alert("Error raising complaint");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8 flex justify-center">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl h-fit">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Raise a Complaint</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">Room Number</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">Issue Type</label>
              <select
                className="select select-bordered"
                value={formData.issueType}
                onChange={(e) =>
                  setFormData({ ...formData, issueType: e.target.value })
                }
              >
                <option>WiFi</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Food</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">Description</label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Describe the issue..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              ></textarea>
            </div>

            <button className="btn btn-primary mt-4">Submit Complaint</button>
          </form>
        </div>
      </div>
    </div>
  );
}
