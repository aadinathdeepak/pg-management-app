import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Rooms from "./pages/Rooms";
import Tenants from "./pages/Tenants";
import Complaints from "./pages/Complaints";

function App() {
  return (
    // <BrowserRouter> MUST wrap everything, including Navbar
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 font-sans">
        <Navbar /> {/* Navbar is INSIDE the Router */}
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/rooms" />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/complaints" element={<Complaints />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
