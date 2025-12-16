const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },

  // NEW: Essential for calculating "N/A" months
  joinDate: { type: Date, required: true, default: Date.now },

  rentAmount: { type: Number, required: true },
  totalDues: { type: Number, default: 0 },
  depositAmount: { type: Number, required: true, default: 0 },

  rentHistory: [
    {
      month: String, // e.g. "Jan 2024"
      amount: Number,
      status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
      paymentDate: Date,
    },
  ],
});

module.exports = mongoose.model("Tenant", TenantSchema);
