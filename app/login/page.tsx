import { LoginForm } from '@/features/Auth/components/LoginForm';

export const metadata = {
    title: 'Login - WIP GLA',
    description: 'Sign in to access your dashboard.',
};

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background blur effects to match image 2 */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]"></div>

            <div className="relative z-10 w-full flex justify-center">
                <LoginForm />
            </div>
        </main>
    );
}
