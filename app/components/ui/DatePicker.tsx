'use client';

import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { format, parseISO } from 'date-fns';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Icon } from './Icon';

interface DatePickerProps {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
}

export const DatePicker = ({ value, onChange, className, placeholder = 'Select date' }: DatePickerProps) => {
    const [open, setOpen] = React.useState(false);

    // Convert string value (YYYY-MM-DD) to Date object
    const selectedDate = React.useMemo(() => {
        if (!value) return undefined;
        const d = parseISO(value);
        return isNaN(d.getTime()) ? undefined : d;
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
        if (date && onChange) {
            // Format to YYYY-MM-DD for consistency with native inputs
            const formatted = format(date, 'yyyy-MM-dd');
            onChange(formatted);
            setOpen(false);
        }
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    className={cn(
                        "w-full bg-zinc-50 border border-zinc-100 h-12 rounded-2xl px-5 pl-11 text-sm font-bold outline-none focus:border-zinc-900 transition-all font-mono appearance-none items-center flex text-left relative",
                        !value && "text-zinc-400",
                        className
                    )}
                >
                    <Icon icon="solar:calendar-bold-duotone" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    {value ? format(selectedDate!, 'PPP') : placeholder}
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className="z-[100] mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-4 animate-in fade-in zoom-in duration-200 origin-top"
                    sideOffset={5}
                >
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        className="m-0"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-between pt-1 relative items-center mb-4 px-2",
                            caption_label: "text-[10px] font-black uppercase tracking-widest text-zinc-900",
                            nav: "space-x-1 flex items-center",
                            nav_button: cn(
                                "p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all active:scale-90"
                            ),
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-zinc-300 rounded-md w-9 font-black text-[9px] uppercase",
                            row: "flex w-full mt-2",
                            cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                            day: cn(
                                "h-9 w-9 p-0 font-bold text-[10px] rounded-xl transition-all active:scale-90 m-0.5",
                                "hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none"
                            ),
                            day_selected: "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white focus:bg-zinc-900 focus:text-white",
                            day_today: "bg-zinc-100 text-zinc-900",
                            day_outside: "text-zinc-400 opacity-20",
                            day_disabled: "text-zinc-400 opacity-20",
                            day_range_middle: "aria-selected:bg-zinc-100 aria-selected:text-zinc-900",
                            day_hidden: "invisible",
                        }}
                        components={{
                            Chevron: ({ orientation }) => {
                                const icon = orientation === 'left' ? "solar:alt-arrow-left-bold" : "solar:alt-arrow-right-bold";
                                return <Icon icon={icon} className="w-4 h-4" />;
                            }
                        }}
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
