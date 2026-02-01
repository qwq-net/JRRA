import { LogoutButton } from '@/features/auth';

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <h1 className="text-2xl font-black text-gray-900">ログアウト</h1>
      <p className="font-bold text-gray-500">ログアウトしてもよろしいですか？</p>
      <LogoutButton />
    </div>
  );
}
