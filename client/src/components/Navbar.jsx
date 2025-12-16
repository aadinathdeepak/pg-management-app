import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path ? "btn-active btn-primary" : "btn-ghost";

  return (
    <div className="navbar bg-base-100 shadow-md px-4 mb-4 rounded-box mt-2 mx-2 w-auto">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          🏠 PG Manager
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link to="/rooms" className={`btn btn-sm ${isActive("/rooms")}`}>
              Rooms
            </Link>
          </li>
          <li>
            <Link
              to="/tenants"
              className={`btn btn-sm ${isActive("/tenants")}`}
            >
              Tenants
            </Link>
          </li>
          <li>
            <Link
              to="/complaints"
              className={`btn btn-sm ${isActive("/complaints")}`}
            >
              Complaints
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
