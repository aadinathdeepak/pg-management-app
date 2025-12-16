const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  roomNumber: String,
  issueType: { type: String, required: true }, // e.g. "WiFi", "Water"
  description: String,
  isResolved: { type: Boolean, default: false },
  dateRaised: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
