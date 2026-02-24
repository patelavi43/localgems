const bgUrl =
  "https://images.unsplash.com/photo-1526481280695-3c687fd543c0?auto=format&fit=crop&w=1600&q=80";

function PublicLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/90 rounded shadow-lg p-6">{children}</div>
    </div>
  );
}

export default PublicLayout;
