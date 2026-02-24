import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-6">LocalGems Admin</h2>

      <nav className="flex-1 space-y-2 text-sm">
        <Link to="/admin" className="block hover:bg-slate-800 px-3 py-2 rounded">
          Dashboard
        </Link>
        <Link
          to="/admin/users"
          className="block hover:bg-slate-800 px-3 py-2 rounded"
        >
          All Users
        </Link>
        <Link
          to="/admin/talents"
          className="block hover:bg-slate-800 px-3 py-2 rounded"
        >
          Talent Providers
        </Link>
        <Link
          to="/admin/bookings"
          className="block hover:bg-slate-800 px-3 py-2 rounded"
        >
          Bookings & Reviews
        </Link>
        <Link
          to="/admin/analytics"
          className="block hover:bg-slate-800 px-3 py-2 rounded"
        >
          Analytics
        </Link>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
