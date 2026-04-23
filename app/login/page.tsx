import { LoginForm } from '@/features/Auth/components/LoginForm';

export const metadata = {
    title: 'Login - WIP GLA',
    description: 'Sign in to access your dashboard.',
};

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements - Optimized for 1080p */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Expansive Mesh Gradients for High Res Depth */}
                <div className="absolute -top-[10%] -left-[5%] w-[60%] h-[60%] bg-blue-50/50 rounded-full blur-[140px] animate-pulse duration-[10s]"></div>
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-50/40 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-zinc-50/60 rounded-full blur-[130px]"></div>

                {/* Dynamic SVG Wave Background */}
                <svg className="absolute bottom-0 left-0 w-full h-[60%] opacity-[0.04] transition-all" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 400C200 350 400 450 600 400C800 350 1000 450 1200 400C1300 375 1400 400 1440 400V800H0V400Z" fill="url(#wave-gradient)" />
                    <defs>
                        <linearGradient id="wave-gradient" x1="720" y1="400" x2="720" y2="800" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#0a0a0a" />
                            <stop offset="1" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Layered Glass Shapes for 1080p Depth */}
                <div className="absolute -bottom-[15%] -left-[10%] w-[120%] h-[50%] bg-gradient-to-t from-white via-white/40 to-transparent backdrop-blur-[1px] rounded-[100%] border-t border-zinc-100/30 transform rotate-[-3deg]"></div>
                <div className="absolute -bottom-[20%] right-[-5%] w-[110%] h-[40%] bg-white/30 rounded-[100%] border-t border-zinc-50/50 transform rotate-[2deg]"></div>

                {/* High Density Texture Grid */}
                <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#d1d5db 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }}></div>

                {/* Large Scale Floating Icons */}
                <div className="absolute top-[10%] left-[10%] w-32 h-32 border-[2px] border-zinc-100/50 rounded-[2rem] transform rotate-12 opacity-40"></div>
                <div className="absolute bottom-[15%] right-[10%] w-48 h-48 bg-zinc-50/80 rounded-full border border-zinc-100/50 blur-[1px]"></div>

                {/* Typographic Texture */}
                <div className="absolute top-[20%] left-[5%] text-zinc-50 text-[10rem] font-black select-none pointer-events-none opacity-20">G</div>
                <div className="absolute bottom-[5%] right-[5%] text-zinc-50 text-[8rem] font-black select-none pointer-events-none opacity-20">A</div>

                {/* Subtle Floating "+" Items */}
                <div className="absolute top-[15%] right-[25%] text-zinc-200 text-6xl font-thin select-none">+</div>
                <div className="absolute bottom-[30%] left-[20%] text-zinc-200 text-4xl font-thin select-none">+</div>
            </div>

            <div className="relative z-10 w-full flex justify-center animate-page-in">
                <LoginForm />
            </div>
        </main>
    );
}
