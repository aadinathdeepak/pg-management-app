import { useState, useEffect } from "react";
import axios from "axios";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/rooms")
      .then((res) => setRooms(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Room Inventory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="card bg-base-100 shadow-xl border border-base-200"
          >
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title text-2xl">Room {room.roomNumber}</h2>
                <div className="badge badge-secondary">₹{room.price}</div>
              </div>

              <div className="my-2">
                <div className="text-sm font-bold opacity-70">Capacity</div>
                <progress
                  className="progress progress-primary w-56"
                  value={room.occupants.length}
                  max={room.capacity}
                ></progress>
                <div className="text-xs text-right">
                  {room.occupants.length}/{room.capacity} Filled
                </div>
              </div>

              <div className="divider my-0"></div>

              <div className="text-sm font-bold opacity-70 mb-2">
                Occupants:
              </div>
              {room.occupants.length === 0 ? (
                <span className="text-xs text-gray-400">Empty</span>
              ) : (
                <ul className="space-y-1">
                  {room.occupants.map((occ) => (
                    <li
                      key={occ._id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-6">
                          <span>{occ.name[0]}</span>
                        </div>
                      </div>
                      {occ.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
