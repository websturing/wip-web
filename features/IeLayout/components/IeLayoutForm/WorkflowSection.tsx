'use client';

import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { TimeStudy } from '../../types';
import { ProcessTable } from './ProcessTable';

interface WorkflowSectionProps {
    section: string;
    sectionRows: TimeStudy[];
    sectionIndices: number[];
    draggedSection: string | null;
    draggedProcessIdx: number | null;
    onDragSectionStart: (e: React.DragEvent, section: string) => void;
    onDragSectionOver: (e: React.DragEvent, section: string) => void;
    onDragSectionEnd: () => void;
    onProcessDragStart: (e: React.DragEvent, idx: number) => void;
    onProcessDragOver: (e: React.DragEvent, idx: number) => void;
    onProcessDragEnd: () => void;
    addOperation: (section: string) => void;
    removeSection: (section: string) => void;
    updateDetail: (idx: number, field: keyof TimeStudy, value: string | number) => void;
    removeOperation: (idx: number) => void;
}

export const WorkflowSection = ({
    section,
    sectionRows,
    sectionIndices,
    draggedSection,
    draggedProcessIdx,
    onDragSectionStart,
    onDragSectionOver,
    onDragSectionEnd,
    onProcessDragStart,
    onProcessDragOver,
    onProcessDragEnd,
    addOperation,
    removeSection,
    updateDetail,
    removeOperation
}: WorkflowSectionProps) => {
    const isActive = sectionRows.length > 0;

    const formatPrec = (val: number = 0) => parseFloat(val.toFixed(3)).toString();
    const formatInt = (val: number = 0) => Math.round(val).toLocaleString();

    return (
        <div
            draggable
            onDragStart={(e) => onDragSectionStart(e, section)}
            onDragOver={(e) => onDragSectionOver(e, section)}
            onDragEnd={onDragSectionEnd}
            className={cn(
                "transition-all duration-500",
                !isActive && "opacity-60",
                draggedSection === section && "scale-[0.98] opacity-50 border-2 border-dashed border-blue-400 rounded-[2.5rem]"
            )}
        >
            <div className={cn(
                "flex items-center justify-between mb-4 px-2",
                draggedSection === section && "opacity-0"
            )}>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-5 py-2 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
                        <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors">
                            <Icon icon="solar:hamburger-menu-bold" className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black text-zinc-900 tracking-[0.1em]">{section}</span>
                        <div className="w-px h-3 bg-zinc-100"></div>
                        <button
                            onClick={() => removeSection(section)}
                            className="text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-tighter"
                        >
                            Remove Section
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => addOperation(section)}
                    className="h-8 px-4 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-zinc-200 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Icon icon="solar:add-circle-bold" className="w-3.5 h-3.5" />
                    Add Process
                </button>
            </div>

            <div className={cn(
                "rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-xl shadow-zinc-200/40 relative group",
                draggedSection === section && "opacity-0"
            )}>
                <ProcessTable
                    sectionRows={sectionRows}
                    sectionIndices={sectionIndices}
                    draggedProcessIdx={draggedProcessIdx}
                    onProcessDragStart={onProcessDragStart}
                    onProcessDragOver={onProcessDragOver}
                    onProcessDragEnd={onProcessDragEnd}
                    updateDetail={updateDetail}
                    removeOperation={removeOperation}
                    formatPrec={formatPrec}
                    formatInt={formatInt}
                />

                {sectionRows.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-zinc-300 bg-zinc-50/30">
                        <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-10 h-10 mb-2 opacity-5" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic opacity-40">Drop items here or use button above</span>
                    </div>
                )}
            </div>
        </div>
    );
};
