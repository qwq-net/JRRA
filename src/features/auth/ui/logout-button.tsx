import { signOut } from '@/shared/config/auth';
import { Button } from '@/shared/ui';
import { ComponentProps } from 'react';

type LogoutButtonProps = ComponentProps<typeof Button>;

export function LogoutButton({ className, variant = 'ghost', ...props }: LogoutButtonProps) {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }}
    >
      <Button variant={variant} type="submit" className={className} {...props}>
        ログアウト
      </Button>
    </form>
  );
}
