import { LoginButton } from '@/features/auth';
import { auth } from '@/shared/config/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/mypage');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LoginButton />
    </div>
  );
}
