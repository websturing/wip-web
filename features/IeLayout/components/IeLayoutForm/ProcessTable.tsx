'use client';

import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { TimeStudy } from '../../types';

interface ProcessTableProps {
    sectionRows: TimeStudy[];
    sectionIndices: number[];
    draggedProcessIdx: number | null;
    onProcessDragStart: (e: React.DragEvent, globalIdx: number) => void;
    onProcessDragOver: (e: React.DragEvent, targetGlobalIdx: number) => void;
    onProcessDragEnd: () => void;
    updateDetail: (index: number, field: keyof TimeStudy, value: string | number) => void;
    removeOperation: (index: number) => void;
    formatPrec: (val?: number) => string;
    formatInt: (val?: number) => string;
}

export const ProcessTable = ({
    sectionRows,
    sectionIndices,
    draggedProcessIdx,
    onProcessDragStart,
    onProcessDragOver,
    onProcessDragEnd,
    updateDetail,
    removeOperation,
    formatPrec,
    formatInt
}: ProcessTableProps) => {
    return (
        <div className="bg-white border-x border-zinc-100/50 overflow-x-hidden">
            <table className="w-full table-fixed border-collapse">
                <thead className="bg-zinc-50 border-y border-zinc-100">
                    <tr className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        <th className="w-[60px] px-4 py-3 text-left">Seq</th>
                        <th className="px-2 py-3 text-left">Process Architecture</th>
                        <th className="w-[55px] px-1 py-3 text-center">Pos</th>
                        <th className="w-[55px] px-1 py-3 text-center">Len</th>
                        <th className="w-[65px] px-1 py-3 text-center">Mc</th>
                        <th className="w-[45px] px-1 py-3 text-center opacity-40 italic">TRN</th>
                        <th className="w-[50px] px-1 py-3 text-center bg-blue-50/10 text-blue-500">MP</th>
                        <th className="w-[60px] px-1 py-3 text-center bg-emerald-50/10 text-emerald-500">STD</th>
                        <th className="w-[60px] px-1 py-3 text-center bg-indigo-50/10 text-indigo-500">T/Hr</th>
                        <th className="w-[55px] px-1 py-3 text-center opacity-40">T/Dy</th>
                        <th className="w-[70px] px-3 py-3 text-right text-zinc-900 pr-4">SMV</th>
                        <th className="w-[45px]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {sectionRows.map((detail, sIdx) => {
                        const globalIdx = sectionIndices[sIdx];
                        const isBeingDragged = draggedProcessIdx === globalIdx;

                        return (
                            <tr
                                key={`${globalIdx}-${sIdx}`}
                                draggable
                                onDragStart={(e) => onProcessDragStart(e, globalIdx)}
                                onDragOver={(e) => onProcessDragOver(e, globalIdx)}
                                onDragEnd={onProcessDragEnd}
                                className={cn(
                                    "hover:bg-zinc-50/50 transition-colors group",
                                    isBeingDragged && "opacity-20 bg-blue-50"
                                )}
                            >
                                <td className="px-4 py-1.5 flex items-center gap-2">
                                    <div className="cursor-grab active:cursor-grabbing text-zinc-200 hover:text-zinc-400 transition-colors">
                                        <Icon icon="solar:round-alt-arrow-down-bold-duotone" className="w-3 h-3 rotate-180" />
                                        <Icon icon="solar:round-alt-arrow-down-bold-duotone" className="w-3 h-3 -mt-1.5" />
                                    </div>
                                    <span className="text-[9px] font-black text-zinc-300">{sIdx + 1}</span>
                                </td>
                                <td className="px-2 py-1.5">
                                    <input
                                        list="ops-datalist"
                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[11px] uppercase tracking-tight p-0 outline-none placeholder:text-zinc-200 overflow-hidden text-ellipsis whitespace-nowrap"
                                        placeholder="DEFINE OPERATION..."
                                        value={detail.operation_name || detail.operation?.name || ''}
                                        onChange={(e) => updateDetail(globalIdx, 'operation_name', e.target.value)}
                                    />
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                    <input
                                        type="number" className="w-full bg-transparent border-none text-center text-[11px] font-black text-zinc-900 p-0"
                                        value={detail.handling_position_value}
                                        onChange={(e) => updateDetail(globalIdx, 'handling_position_value', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                    <input
                                        type="number" className="w-full bg-transparent border-none text-center text-[11px] font-black text-zinc-900 p-0"
                                        value={detail.length}
                                        onChange={(e) => updateDetail(globalIdx, 'length', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                    <input
                                        className="w-full bg-transparent border-none text-center text-[10px] font-black text-zinc-400 uppercase p-0"
                                        value={detail.machine_type}
                                        onChange={(e) => updateDetail(globalIdx, 'machine_type', e.target.value.toUpperCase())}
                                    />
                                </td>
                                <td className="px-1 py-1.5 text-center text-[10px] font-bold text-zinc-300 italic">{formatPrec(detail.machine_turn)}</td>
                                <td className="px-1 py-1.5 text-center bg-blue-50/20">
                                    <input
                                        type="number" step="0.5"
                                        className="w-full bg-transparent border-none text-center text-[11px] font-black text-blue-600 p-0"
                                        value={detail.man_power}
                                        onChange={(e) => updateDetail(globalIdx, 'man_power', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-1 py-1.5 text-center bg-emerald-50/20 font-black text-[11px] text-emerald-600">{formatPrec(detail.std_time)}</td>
                                <td className="px-1 py-1.5 text-center bg-indigo-50/20 font-black text-[11px] text-indigo-600 text-xs">{formatInt(detail.target_hour)}</td>
                                <td className="px-1 py-1.5 text-center text-[10px] font-bold text-zinc-400">{formatInt(detail.target_day)}</td>
                                <td className="px-3 py-1.5 text-right bg-zinc-50/20 font-black text-[11px] text-zinc-900">{formatPrec(detail.smv)}</td>
                                <td className="px-4 py-1.5 text-center">
                                    <button onClick={() => removeOperation(globalIdx)} className="transition-all text-zinc-200 hover:text-red-500">
                                        <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
