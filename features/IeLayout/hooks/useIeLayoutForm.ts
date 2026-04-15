'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IeLayoutService } from '../services/IeLayoutService';
import { IeLayout, Operation, TimeStudy } from '../types';

const MACHINE_TURNS: Record<string, number> = {
    'O/L': 0.125,
    'S': 0.158,
    'C': 0.158,
    'BT': 0.158,
    'BH': 0.158,
    'O': 0.158,
    'S/M': 0.369,
    'IRON': 0.048
};

export const useIeLayoutForm = (id?: string) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [lots, setLots] = useState<{ id: string, lot_code: string }[]>([]);
    const [availableSections, setAvailableSections] = useState<string[]>(['OUTLINE', 'OFFLINE', 'INLINE']);

    const [formData, setFormData] = useState<Partial<IeLayout>>({
        name: '',
        lot_id: '',
        price: 0,
        efficiency_constant: 1,
        department: 'Sewing',
        total_smv: 0,
        man_power_sewer: 0,
        man_power_matching: 0,
        man_power_qc: 0,
        man_power_others: 0,
        details: []
    });

    const [draggedSection, setDraggedSection] = useState<string | null>(null);
    const [draggedProcessIdx, setDraggedProcessIdx] = useState<number | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsFetching(true);
            try {
                const [opsData, lotsData] = await Promise.all([
                    IeLayoutService.getOperations(),
                    IeLayoutService.getLots()
                ]);
                setOperations(opsData);
                setLots(lotsData);

                if (id) {
                    const layoutData = await IeLayoutService.getById(id);
                    if (layoutData) {
                        const existingSections = Array.from(new Set((layoutData.details || []).map(d => d.section || 'INLINE')));
                        setAvailableSections(prev => Array.from(new Set([...prev, ...existingSections])));

                        const sanitizedDetails = (layoutData.details || []).map(d => {
                            const detailWithNumbers = {
                                ...d,
                                section: d.section || 'INLINE',
                                handling_position_value: Number(d.handling_position_value || 0),
                                length: Number(d.length || 0),
                                machine_turn: Number(d.machine_turn || 0),
                                man_power: Number(d.man_power || 1),
                            };
                            return calculateRowMetrics(detailWithNumbers, Number(layoutData.efficiency_constant || 1));
                        });
                        setFormData({
                            ...layoutData,
                            price: Number(layoutData.price || 0),
                            efficiency_constant: Number(layoutData.efficiency_constant || 1),
                            details: sanitizedDetails
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setIsFetching(false);
            }
        };
        loadInitialData();
    }, [id]);

    const calculateRowMetrics = (detail: TimeStudy, efficiency: number) => {
        const key = detail.machine_type?.toUpperCase() || '';
        const turn = MACHINE_TURNS[key] || detail.machine_turn || 0;
        const posHandling = detail.handling_position_value || 0;
        const sewLength = detail.length || 0;
        const mp = detail.man_power || 1;

        const rawStdTime = posHandling > 0 ? (sewLength * turn) + posHandling : 0;
        const stdTime = Math.ceil(rawStdTime * 100) / 100;

        const smv = stdTime > 0 ? stdTime / 60 : 0;
        const targetHour = (stdTime > 0) ? (3600 * efficiency * mp) / stdTime : 0;
        const targetDay = targetHour * 8;

        return {
            ...detail,
            machine_turn: turn,
            std_time: stdTime,
            target_hour: targetHour,
            target_day: targetDay,
            smv: smv
        };
    };

    const addOperation = (section: string) => {
        const newDetail: TimeStudy = {
            operation_id: '',
            operation_name: '',
            section: section,
            handling_position: 'Seated',
            handling_position_value: 0,
            length: 0,
            man_power: 1,
            sequence: (formData.details?.length || 0) + 1,
            machine_type: '',
            machine_turn: 0
        };
        setFormData(prev => ({ ...prev, details: [...(prev.details || []), newDetail] }));
    };

    const removeOperation = (indexInDetails: number) => {
        setFormData(prev => {
            const newDetails = [...(prev.details || [])];
            newDetails.splice(indexInDetails, 1);
            return { ...prev, details: newDetails };
        });
    };

    const removeSection = (sectionName: string) => {
        setFormData(prev => ({
            ...prev,
            details: (prev.details || []).filter(d => d.section !== sectionName)
        }));
        setAvailableSections(prev => prev.filter(s => s !== sectionName));
    };

    const updateDetail = (indexInDetails: number, field: keyof TimeStudy, value: string | number) => {
        setFormData(prev => {
            const newDetails = [...(prev.details || [])];
            let detail = { ...newDetails[indexInDetails], [field]: value };

            if (field === 'operation_name') {
                const op = operations.find(o => o.name.toLowerCase() === String(value).toLowerCase());
                if (op) {
                    detail.operation_id = op.id;
                    detail.machine_type = op.machine_type;
                } else {
                    detail.operation_id = '';
                }
            }

            if (['length', 'machine_type', 'handling_position_value', 'machine_turn', 'operation_name'].includes(field as string)) {
                detail = calculateRowMetrics(detail, prev.efficiency_constant || 1);
            }

            newDetails[indexInDetails] = detail;
            return { ...prev, details: newDetails };
        });
    };

    const onDragSectionStart = (e: React.DragEvent, section: string) => {
        setDraggedSection(section);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragSectionOver = (e: React.DragEvent, targetSection: string) => {
        e.preventDefault();
        if (draggedSection === targetSection || draggedProcessIdx !== null) return;
        const newSections = [...availableSections];
        const draggedIdx = newSections.indexOf(draggedSection!);
        const targetIdx = newSections.indexOf(targetSection);
        newSections.splice(draggedIdx, 1);
        newSections.splice(targetIdx, 0, draggedSection!);
        setAvailableSections(newSections);
    };

    const onProcessDragStart = (e: React.DragEvent, globalIdx: number) => {
        setDraggedProcessIdx(globalIdx);
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };

    const onProcessDragOver = (e: React.DragEvent, targetGlobalIdx: number) => {
        e.preventDefault();
        if (draggedProcessIdx === null || draggedProcessIdx === targetGlobalIdx) return;
        setFormData(prev => {
            const newDetails = [...(prev.details || [])];
            const draggedItem = newDetails[draggedProcessIdx];
            newDetails.splice(draggedProcessIdx, 1);
            newDetails.splice(targetGlobalIdx, 0, draggedItem);
            setDraggedProcessIdx(targetGlobalIdx);
            return { ...prev, details: newDetails };
        });
    };

    const handleSubmit = async () => {
        const totalSmv = formData.details?.reduce((acc, d) => acc + (d.smv || 0), 0) || 0;
        const submitData = { ...formData, total_smv: totalSmv };
        setIsLoading(true);
        try {
            if (id) {
                await IeLayoutService.update(id, submitData);
            } else {
                await IeLayoutService.create(submitData);
            }
            router.push('/admin/ielayout');
        } catch (error) {
            console.error('Failed to save layout:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        availableSections,
        setAvailableSections,
        operations,
        lots,
        isFetching,
        isLoading,
        handleSubmit,
        addOperation,
        removeOperation,
        removeSection,
        updateDetail,
        onDragSectionStart,
        onDragSectionOver,
        onProcessDragStart,
        onProcessDragOver,
        draggedSection,
        setDraggedSection,
        draggedProcessIdx,
        setDraggedProcessIdx
    };
};
