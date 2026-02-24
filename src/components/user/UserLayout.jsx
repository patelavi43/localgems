import UserNavbar from "./UserNavbar.jsx";

function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <UserNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default UserLayout;
