import { auth } from '@/shared/config/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect('/mypage');
  }
  redirect('/login');
}
