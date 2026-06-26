'use client';

import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';

interface Option {
    id: string | number;
    label: string;
    colorClass?: string;
}

interface SelectProps {
    options: Option[];
    value: any; // string | number | (string | number)[]
    onChange: (val: any) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    error?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    creatable?: boolean;
    isMulti?: boolean;
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
    size = 'md',
    creatable = false,
    isMulti = false
}: SelectProps) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const isSelected = (optId: string | number) => {
        if (isMulti && Array.isArray(value)) {
            return value.includes(optId);
        }
        return value === optId;
    };

    let displayValue = placeholder;
    if (isMulti && Array.isArray(value)) {
        const selectedLabels = options.filter(opt => value.includes(opt.id)).map(o => o.label);
        if (selectedLabels.length > 0) {
            displayValue = selectedLabels.join(', ');
        }
    } else {
        const selectedOption = options.find(opt => opt.id === value);
        if (selectedOption) displayValue = selectedOption.label;
        else if (creatable && value) displayValue = value;
    }

    const hasSelection = isMulti ? Array.isArray(value) && value.length > 0 : value !== undefined && value !== null && value !== '';

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
                            hasSelection || (creatable && value) ? "text-zinc-900" : "text-zinc-400"
                        )}>
                            {displayValue}
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
                                            const optId = filteredOptions[0].id;
                                            if (isMulti) {
                                                const currentVal = Array.isArray(value) ? value : [];
                                                const newVal = currentVal.includes(optId) 
                                                    ? currentVal.filter(v => v !== optId)
                                                    : [...currentVal, optId];
                                                onChange(newVal);
                                            } else {
                                                onChange(optId);
                                                setOpen(false);
                                                setSearchTerm('');
                                            }
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                            {filteredOptions.length === 0 && !creatable ? (
                                <div className="py-8 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                    No results found
                                </div>
                            ) : (
                                <>
                                    {filteredOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => {
                                                if (isMulti) {
                                                    const currentVal = Array.isArray(value) ? value : [];
                                                    const newVal = currentVal.includes(option.id) 
                                                        ? currentVal.filter(v => v !== option.id)
                                                        : [...currentVal, option.id];
                                                    onChange(newVal);
                                                } else {
                                                    onChange(option.id);
                                                    setOpen(false);
                                                    setSearchTerm('');
                                                }
                                            }}
                                            className={cn(
                                                "w-full px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all flex items-center justify-between group",
                                                isSelected(option.id)
                                                    ? "bg-blue-50 text-blue-600"
                                                    : (option.colorClass || "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900")
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isMulti && (
                                                    <div className={cn(
                                                        "w-4 h-4 border rounded flex items-center justify-center transition-colors",
                                                        isSelected(option.id) ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-300"
                                                    )}>
                                                        {isSelected(option.id) && <Icon icon="solar:check-read-bold" className="w-3 h-3" />}
                                                    </div>
                                                )}
                                                <span className="truncate">{option.label}</span>
                                            </div>
                                            {!isMulti && isSelected(option.id) && (
                                                <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                                            )}
                                        </button>
                                    ))}
                                    {creatable && searchTerm && !options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase()) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onChange(searchTerm);
                                                setOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all flex items-center justify-between hover:bg-zinc-50 hover:text-zinc-900 text-zinc-600"
                                        >
                                            <span>Create "{searchTerm}"</span>
                                            <Icon icon="solar:add-circle-bold" className="w-4 h-4 text-blue-500" />
                                        </button>
                                    )}
                                    {creatable && filteredOptions.length === 0 && !searchTerm && (
                                        <div className="py-8 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                            Type to create...
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
};
