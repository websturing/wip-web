'use client';

import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';

interface Option {
    id: string | number;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    value: (string | number)[];
    onChange: (val: (string | number)[]) => void;
    placeholder?: string;
    className?: string;
}

export const MultiSelect = ({
    options = [],
    value = [],
    onChange,
    placeholder = "Select multiple...",
    className
}: MultiSelectProps) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedOptions = options.filter(opt => value.includes(opt.id));

    const toggleOption = (id: string | number) => {
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <div className={cn("space-y-1.5", className)}>
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "w-full bg-zinc-50 border border-zinc-100 min-h-[44px] py-1.5 rounded-xl px-4 flex items-center justify-between transition-all outline-none",
                            "hover:border-zinc-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200",
                            open && "border-blue-200 ring-2 ring-blue-500/20 bg-white"
                        )}
                    >
                        <div className="flex flex-wrap gap-1.5 py-1">
                            {selectedOptions.length > 0 ? (
                                selectedOptions.map(opt => (
                                    <span key={opt.id} className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 group/tag">
                                        {opt.label}
                                        <Icon
                                            icon="solar:close-circle-bold"
                                            className="w-3 h-3 text-white/40 group-hover/tag:text-white cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOption(opt.id);
                                            }}
                                        />
                                    </span>
                                ))
                            ) : (
                                <span className="text-zinc-400 font-bold text-[13px]">{placeholder}</span>
                            )}
                        </div>
                        <Icon
                            icon="solar:alt-arrow-down-bold"
                            className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform flex-shrink-0", open && "rotate-180")}
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
                                    placeholder="Search styles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="py-8 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                    No results found
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => toggleOption(option.id)}
                                        className={cn(
                                            "w-full px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all flex items-center justify-between group",
                                            value.includes(option.id)
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                                        )}
                                    >
                                        <span>{option.label}</span>
                                        {value.includes(option.id) && (
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
