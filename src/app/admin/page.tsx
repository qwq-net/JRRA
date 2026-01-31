export default async function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p>Welcome, Administrator. Selecting a menu from the sidebar.</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Quick Links</h2>
          <div className="space-y-2">
            <a href="/admin/events" className="block text-blue-600 hover:underline">
              Manage Events &raquo;
            </a>
            <a href="/admin/users" className="block text-blue-600 hover:underline">
              Manage Users &raquo;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
