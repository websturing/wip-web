import { cn } from "@/lib/utils"
import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.3)]',
            secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md',
            danger: 'bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600/30',
            ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-[10px] rounded-lg',
            md: 'px-5 py-2.5 text-[12px] rounded-xl font-black uppercase tracking-widest',
            lg: 'px-8 py-3 text-[14px] rounded-2xl font-black uppercase tracking-widest',
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer antialiased",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
