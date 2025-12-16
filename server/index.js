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

app.post("/api/tenants/toggle-rent", async (req, res) => {
  const { tenantId, month } = req.body;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });

  // Check if we already have a record for this month
  const recordIndex = tenant.rentHistory.findIndex((r) => r.month === month);

  if (recordIndex > -1) {
    // FOUND: Toggle it (Paid <-> Pending)
    const record = tenant.rentHistory[recordIndex];
    if (record.status === "Paid") {
      record.status = "Pending";
      tenant.totalDues += record.amount; // Add debt back
    } else {
      record.status = "Paid";
      tenant.totalDues -= record.amount; // Clear debt
    }
  } else {
    // NOT FOUND: Create it as PAID (Clicking an empty box implies paying)
    tenant.rentHistory.push({
      month: month,
      amount: tenant.rentAmount,
      status: "Paid",
      paymentDate: new Date(),
    });
    // No change to totalDues needed because it wasn't tracked as debt yet
  }

  await tenant.save();
  res.json({ success: true });
});

app.post("/api/tenants/add", async (req, res) => {
  try {
    const { name, phone, roomNumber, joinDate, depositAmount, rentAmount } =
      req.body;

    // 1. Find the Room
    const room = await Room.findOne({ roomNumber });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // 2. Create the Tenant
    const newTenant = await Tenant.create({
      name,
      phone,
      room: room._id, // Link to room ID
      joinDate: new Date(joinDate),
      depositAmount,
      rentAmount,
      totalDues: 0,
      rentHistory: [],
    });

    // 3. Update Room's Occupant List
    room.occupants.push(newTenant._id);
    await room.save();

    res.json(newTenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. DELETE TENANT (Remove from DB + Remove from Room)
app.delete("/api/tenants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the tenant to get their Room ID
    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    // 2. Remove tenant from the Room's occupant list
    await Room.findByIdAndUpdate(tenant.room, {
      $pull: { occupants: id },
    });

    // 3. Delete the tenant
    await Tenant.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. UPDATE TENANT DETAILS
app.put("/api/tenants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Simple update (Note: If changing rooms, more logic is needed.
    // For now, we assume room doesn't change in simple edit).
    const tenant = await Tenant.findByIdAndUpdate(id, updates, { new: true });

    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. SEED ROUTE (Updates DB with the new structure)
app.get("/seed", async (req, res) => {
  try {
    await Room.deleteMany({});
    await Tenant.deleteMany({});
    await Complaint.deleteMany({});

    const r1 = await Room.create({
      roomNumber: "101",
      capacity: 2,
      price: 6000,
    });
    const year = new Date().getFullYear();

    // Tenant 1
    const t1 = await Tenant.create({
      name: "Arjun Kumar",
      phone: "9876543210",
      room: r1._id,
      joinDate: new Date(`${year}-01-01`),
      depositAmount: 15000, // NEW
      rentAmount: 6000,
      totalDues: 0,
      rentHistory: [],
    });

    // Tenant 2
    const t2 = await Tenant.create({
      name: "Vivek Singh",
      phone: "9123456789",
      room: r1._id,
      joinDate: new Date(`${year}-05-01`),
      depositAmount: 12000, // NEW
      rentAmount: 6000,
      totalDues: 0,
      rentHistory: [],
    });

    r1.occupants.push(t1._id, t2._id);
    await r1.save();

    await Complaint.create([
      {
        roomNumber: "101",
        issueType: "WiFi",
        description: "Signal is extremely weak near the window",
        isResolved: false,
        dateRaised: new Date(),
      },
      {
        roomNumber: "101",
        issueType: "Plumbing",
        description: "Bathroom tap is leaking continuously",
        isResolved: false,
        dateRaised: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
      },
      {
        roomNumber: "101",
        issueType: "Electrical",
        description: "Fan regulator is not working properly",
        isResolved: true, // This one is already fixed
        dateRaised: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
      },
    ]);

    res.send("Database Updated with Deposits!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(5000, () => console.log("Server Running on 5000"));
