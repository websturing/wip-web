'use client';

import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';

interface Option {
    id: string | number;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: string | number;
    onChange: (val: string | number) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    error?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Select = ({
    options = [],
    value,
    onChange,
    placeholder = "Select an option...",
    label,
    className,
    error,
    disabled,
    size = 'md'
}: SelectProps) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    {label}
                </label>
            )}

            <Popover.Root open={open} onOpenChange={disabled ? () => { } : setOpen}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        className={cn(
                            "w-full bg-zinc-50 border border-zinc-100 flex items-center justify-between transition-all outline-none",
                            size === 'sm' ? "h-8 rounded-lg px-2" : "h-12 rounded-xl px-4",
                            "hover:border-zinc-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200",
                            error && "border-red-500 bg-red-50/10 focus:ring-red-500/20 focus:border-red-500",
                            open && !error && "border-blue-200 ring-2 ring-blue-500/20 bg-white",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className={cn(
                            "font-bold truncate",
                            size === 'sm' ? "text-xs" : "text-[13px]",
                            selectedOption ? "text-zinc-900" : "text-zinc-400"
                        )}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        <Icon
                            icon="solar:alt-arrow-down-bold"
                            className={cn("text-zinc-400 transition-transform flex-shrink-0", size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5", open && "rotate-180")}
                        />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        className="z-[100] w-[var(--radix-popover-trigger-width)] bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        sideOffset={8}
                    >
                        <div className="p-2 border-b border-zinc-50">
                            <div className="relative flex items-center">
                                <Icon icon="solar:magnifer-linear" className="absolute left-3 w-4 h-4 text-zinc-400" />
                                <input
                                    className="w-full bg-zinc-50 rounded-xl py-2.5 pl-9 pr-4 text-[13px] font-medium outline-none placeholder:text-zinc-400"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && filteredOptions.length > 0) {
                                            onChange(filteredOptions[0].id);
                                            setOpen(false);
                                            setSearchTerm('');
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="py-8 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                    No results found
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.id);
                                            setOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={cn(
                                            "w-full px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all flex items-center justify-between group",
                                            value === option.id
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                                        )}
                                    >
                                        <span>{option.label}</span>
                                        {value === option.id && (
                                            <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
};
