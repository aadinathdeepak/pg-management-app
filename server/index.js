require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Models
const Room = require("./models/Room");
const Tenant = require("./models/Tenant");
const Complaint = require("./models/Complaint");

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// --- API ROUTES ---

// 1. Dashboard Stats
app.get("/api/dashboard", async (req, res) => {
  const totalRooms = await Room.countDocuments();
  const complaints = await Complaint.countDocuments({ isResolved: false });

  // Calculate total money owed by summing up everyone's 'totalDues'
  const tenants = await Tenant.find();
  const pendingRent = tenants.reduce((sum, t) => sum + (t.totalDues || 0), 0);

  res.json({ totalRooms, openComplaints: complaints, pendingRent });
});

// 2. Get Lists
app.get("/api/tenants", async (req, res) => {
  // Populate 'room' so we can show Room Number instead of just ID
  const tenants = await Tenant.find().populate("room");
  res.json(tenants);
});

app.get("/api/complaints", async (req, res) => {
  const complaints = await Complaint.find();
  res.json(complaints);
});

app.get("/api/rooms", async (req, res) => {
  // Populate occupants so we see WHO is inside each room
  const rooms = await Room.find().populate("occupants");
  res.json(rooms);
});

// 3. Mark Complaint Resolved
app.post("/api/complaints/resolve", async (req, res) => {
  const { id } = req.body;
  await Complaint.findByIdAndUpdate(id, { isResolved: true });
  res.json({ success: true });
});

// 4. Mark Rent as Paid (New Feature for Month-wise tracking)
app.post("/api/tenants/pay", async (req, res) => {
  const { tenantId, month } = req.body;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });

  // Find the specific month in history and mark it paid
  const record = tenant.rentHistory.find((r) => r.month === month);
  if (record && record.status === "Pending") {
    record.status = "Paid";
    record.paymentDate = new Date();
    tenant.totalDues -= record.amount; // Reduce debt
    await tenant.save();
  }

  res.json({ success: true });
});

// 5. SEED ROUTE (Updates DB with the new structure)
app.get("/seed", async (req, res) => {
  try {
    await Room.deleteMany({});
    await Tenant.deleteMany({});
    await Complaint.deleteMany({});

    // Create Rooms
    const r1 = await Room.create({
      roomNumber: "101",
      capacity: 2,
      price: 6000,
    });
    const r2 = await Room.create({
      roomNumber: "102",
      capacity: 3,
      price: 4500,
    });

    // Create Tenants with Rent History
    const t1 = await Tenant.create({
      name: "Arjun Kumar",
      phone: "9876543210",
      room: r1._id,
      rentAmount: 6000,
      totalDues: 0, // All paid
      rentHistory: [
        {
          month: "Nov 2024",
          amount: 6000,
          status: "Paid",
          paymentDate: new Date(),
        },
        {
          month: "Dec 2024",
          amount: 6000,
          status: "Paid",
          paymentDate: new Date(),
        },
      ],
    });

    const t2 = await Tenant.create({
      name: "Vivek Singh",
      phone: "9123456789",
      room: r1._id,
      rentAmount: 6000,
      totalDues: 6000, // Owes for December
      rentHistory: [
        {
          month: "Nov 2024",
          amount: 6000,
          status: "Paid",
          paymentDate: new Date(),
        },
        { month: "Dec 2024", amount: 6000, status: "Pending" }, // This creates the Red Flag
      ],
    });

    r1.occupants.push(t1._id, t2._id);
    await r1.save();

    await Complaint.create({
      roomNumber: "101",
      issueType: "WiFi",
      description: "Signal weak",
      isResolved: false,
    });

    res.send("Database Seeded with Month-Wise Tracking!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(5000, () => console.log("Server Running on 5000"));
