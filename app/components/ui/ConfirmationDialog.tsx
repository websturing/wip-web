'use client';

import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

// Note: Using Radix UI as the foundation, ensuring compatibility with the project's design system.
// Reka UI is often used as a set of primitives or as the core for these components.

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        className={cn(
            'fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300',
            className
        )}
        {...props}
        ref={ref}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-6 border border-zinc-100 bg-white p-10 shadow-2xl duration-500 animate-in fade-in zoom-in-95 rounded-[3rem] outline-none',
                className
            )}
            {...props}
        />
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    isLoading?: boolean;
}

export const ConfirmationDialog = ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    isLoading = false,
}: ConfirmationDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <div className="flex flex-col items-center text-center">
                    <div className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-xl text-white",
                        variant === 'destructive' ? "bg-red-500 shadow-red-100" : "bg-zinc-900 shadow-zinc-200"
                    )}>
                        <Icon
                            icon={variant === 'destructive' ? "solar:danger-bold-duotone" : "solar:info-square-bold-duotone"}
                            className="w-10 h-10"
                        />
                    </div>

                    <DialogPrimitive.Title className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-3">
                        {title}
                    </DialogPrimitive.Title>

                    <DialogPrimitive.Description className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed max-w-[280px]">
                        {description}
                    </DialogPrimitive.Description>
                </div>

                <div className="flex gap-4 mt-10">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-16 rounded-[1.5rem] bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 font-black text-[10px] uppercase tracking-widest text-zinc-500 transition-all active:scale-95"
                    >
                        {cancelLabel}
                    </button>

                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 h-16 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2",
                            variant === 'destructive' ? "bg-red-500 hover:bg-red-600 text-white shadow-red-100" : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-200"
                        )}
                    >
                        {isLoading && <Icon icon="solar:refresh-line-duotone" className="w-4 h-4 animate-spin" />}
                        <span>{isLoading ? 'Processing...' : confirmLabel}</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
