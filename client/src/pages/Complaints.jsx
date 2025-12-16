import { useState, useEffect } from "react";
import axios from "axios";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'history'

  const fetchComplaints = () => {
    axios
      .get("http://localhost:5000/api/complaints")
      .then((res) => setComplaints(res.data));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const resolve = async (id) => {
    await axios.post("http://localhost:5000/api/complaints/resolve", { id });
    fetchComplaints();
  };

  // Filter the list based on which tab is clicked
  const visibleList = complaints.filter((c) =>
    activeTab === "active" ? !c.isResolved : c.isResolved
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Complaints & Issues</h2>
        {/* TABS COMPONENT */}
        <div role="tablist" className="tabs tabs-boxed">
          <a
            role="tab"
            className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </a>
          <a
            role="tab"
            className={`tab ${activeTab === "history" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </a>
        </div>
      </div>

      <div className="space-y-4">
        {visibleList.map((c) => (
          <div
            key={c._id}
            className={`alert shadow-lg ${
              c.isResolved ? "bg-base-200" : "alert-warning"
            }`}
          >
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                Room {c.roomNumber}: {c.issueType}
              </h3>
              <p>{c.description}</p>
              <div className="text-xs opacity-60 mt-1">
                {new Date(c.dateRaised).toLocaleDateString()}
              </div>
            </div>
            {!c.isResolved && (
              <button
                onClick={() => resolve(c._id)}
                className="btn btn-sm btn-circle btn-ghost bg-white"
              >
                ✓
              </button>
            )}
            {c.isResolved && (
              <span className="badge badge-success text-white">Resolved</span>
            )}
          </div>
        ))}
        {visibleList.length === 0 && (
          <div className="text-center py-10 opacity-50">
            No complaints in this section!
          </div>
        )}
      </div>
    </div>
  );
}
