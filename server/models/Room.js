const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  // We keep the list of IDs to know who is inside
  occupants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  ],
});

module.exports = mongoose.model("Room", RoomSchema);
