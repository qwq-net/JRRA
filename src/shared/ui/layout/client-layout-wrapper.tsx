'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { Header } from './header';

import { Footer } from './footer';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminPage = pathname.startsWith('/admin');

  // Header and Footer should be visible on all pages except Admin pages
  const showHeaderFooter = !isAdminPage;

  // BottomNav should only be visible on app pages (logged in context), not on Auth pages or Admin pages
  // Also excluding terms/privacy from BottomNav if desired, but for now let's just exclude Auth/Admin
  const showBottomNav = !isAuthPage && !isAdminPage && !pathname.startsWith('/onboarding');

  return (
    <div className="flex min-h-screen flex-col">
      {showHeaderFooter && <Header />}
      <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
      {showHeaderFooter && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
