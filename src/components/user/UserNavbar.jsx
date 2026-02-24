import { Link } from "react-router-dom";

function UserNavbar() {
  return (
    <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <Link to="/home" className="font-semibold text-lg">
        LocalGems
      </Link>

      <div className="space-x-4 text-sm">
        <Link to="/home" className="hover:underline">
          Home
        </Link>
        <Link to="/user" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/bookings" className="hover:underline">
          My Bookings
        </Link>
        <Link to="/profile" className="hover:underline">
          Profile
        </Link>
      </div>
    </nav>
  );
}

export default UserNavbar;
