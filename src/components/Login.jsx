import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./user/AuthContext.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // user or admin
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call backend -> if success then:
    login(email, password, role);

    if (role === "admin") navigate("/admin");
    else navigate("/user");
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Login as</label>
          <select
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User / Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        New user?{" "}
        <Link to="/signup" className="text-slate-900 font-medium underline">
          Sign up here
        </Link>
      </p>
    </div>
  );
}

export default Login;
