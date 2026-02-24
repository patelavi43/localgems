import AdminSidebar from "./AdminSidebar.jsx";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default AdminLayout;
