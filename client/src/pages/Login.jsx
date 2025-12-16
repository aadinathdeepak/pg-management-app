import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    localStorage.setItem("userRole", role); // Save role
    if (role === "admin") navigate("/dashboard");
    else navigate("/user-complaint");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h2 className="text-2xl font-bold mb-4">PG Manager Login</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleLogin("admin")}
              className="btn btn-primary btn-lg"
            >
              Login as Admin
            </button>
            <div className="divider">OR</div>
            <button
              onClick={() => handleLogin("user")}
              className="btn btn-secondary btn-lg"
            >
              Login as Tenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
