'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/admin');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans text-orange-400">
      {/* Minimalist background pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#eff6ff_0%,_transparent_70%)] opacity-40 animate-pulse duration-[4000ms]"></div>

      <div className="flex flex-col items-center gap-12 relative z-10">
        {/* Logo with Blinking Border Animation */}
        <div className="relative">
          {/* Blinking border effect around the container */}
          <div className="absolute -inset-1.5 bg-blue-500/20 rounded-[2.1rem] blur-[2px] animate-pulse-fast"></div>

          <div className="relative w-24 h-24 bg-zinc-900 rounded-[2.1rem] flex items-center justify-center p-6 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2)] border-2 border-blue-500/30 animate-in zoom-in duration-700">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 7.5V16.5M21 7.5L12 3L3 7.5M21 7.5L12 12M12 12L3 7.5M12 12V21M3 7.5V16.5M3 16.5L12 21M12 21L21 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.5 9.75L12 12L16.5 9.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter lowercase">
            wip<span className="text-blue-500">.</span>
          </h2>

          {/* Loading Indicator */}
          <div className="flex items-center gap-3 px-6 py-3 bg-zinc-50 rounded-full border border-zinc-100 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
            <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">initialising</span>
          </div>
        </div>
      </div>

      <style jsx>{`
                @keyframes pulse-fast {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                .animate-pulse-fast {
                    animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
    </div>
  );
}

