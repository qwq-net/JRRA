import { LogoutButton } from '@/features/auth/ui/logout-button';
import { auth } from '@/shared/config/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Events', href: '/admin/events' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-xl font-bold text-red-600">Admin Panel</h1>
          <p className="mt-1 text-xs text-gray-500">Japan Ranranru Racing</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="truncat text-sm font-medium">{session.user.name}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
