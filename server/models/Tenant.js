const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },

  // Financials
  rentAmount: { type: Number, required: true }, // How much they pay per month
  totalDues: { type: Number, default: 0 }, // Total accummulated debt (e.g., 5000)

  // The Month-Wise Tracker
  rentHistory: [
    {
      month: { type: String, required: true }, // e.g., "Dec 2024"
      amount: Number,
      status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
      paymentDate: Date, // Optional: Record when they actually paid
    },
  ],
});

module.exports = mongoose.model("Tenant", TenantSchema);
