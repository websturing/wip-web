import { LoginForm } from '@/features/Auth/components/LoginForm';

export const metadata = {
    title: 'Login - Admin Panel',
    description: 'Sign in to access your dashboard.',
};

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-zinc-50 dark:from-blue-900/10 dark:via-zinc-950">
            <div className="flex flex-col items-center">
                <div className="mb-10 p-2 bg-zinc-900 dark:bg-white rounded-3xl w-16 h-16 flex items-center justify-center shadow-2xl">
                    <span className="text-white dark:text-zinc-900 font-black text-xl italic tracking-tighter">
                        GL
                    </span>
                </div>
                <LoginForm />
            </div>
        </main>
    );
}
