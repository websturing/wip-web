'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductionService } from '../../Production/services/ProductionService';
import { ReferenceService } from '../../Reference/services/ReferenceService';
import { ProductivityService } from '../services/ProductivityService';

export interface LotConfigItem {
    row_id: string;
    lot_id: string;
    label?: string;
    smv: number;
    last_step: number;
    target_plan: number;
    manpower: number;
    plan_manpower: number;
    sewer: number;
    plan_sewer: number;
    working_hour: number;
    section?: string;
    actual_output?: number;
    outputs_by_color?: { color: string; qty: number }[];
    media_id?: string;
    media_url?: string;
}

export const useProductivityForm = (id?: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lines, setLines] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [productionData, setProductionData] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        id: null as string | null,
        line_id: '',
        date: (() => {
            const spDate = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('date') : null;
            if (spDate) return spDate;

            const date = new Date();
            date.setDate(date.getDate() - 1);
            return date.toISOString().split('T')[0];
        })(),
        sewer: 1,
        lot_configs: [] as LotConfigItem[]
    });

    const [pickingMediaFor, setPickingMediaFor] = useState<string | null>(null);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [lastSynced, setLastSynced] = useState({ line_id: '', date: '' });
    const [selectedMergeIds, setSelectedMergeIds] = useState<string[]>([]);

    // Total target sum across all lots
    const currentTargetSum = useMemo(() => {
        return formData.lot_configs.reduce((sum, c) => sum + (Number(c.target_plan) || 0), 0);
    }, [formData.lot_configs]);

    // Initial load for lines and lots list
    useEffect(() => {
        ProductionService.getLines().then(res => {
            if (res.status === 'success') {
                const sortedLines = res.data
                    .map((l: any) => ({ id: l.id, label: l.name }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
                setLines(sortedLines);
            }
        });
        ReferenceService.getLotList().then(res => {
            if (res.status === 'success') {
                const sortedLots = res.data
                    .map((l: any) => ({
                        id: l.id,
                        label: `${l.gl_group?.gl_number || ''} / ${(l.lot_code || '').replace(/^0+/, '')}`
                    }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
                setLots(sortedLots);
            }
        });
    }, []);

    // Sync configs helper function
    const getSyncConfigs = useCallback((configs: LotConfigItem[], lineId: string, prodData: any[]): LotConfigItem[] => {
        if (!lineId || !prodData.length) {
            return configs.map(c => ({
                ...c,
                actual_output: 0,
                outputs_by_color: []
            }));
        }

        // Filter production entries for this line
        const lineOutput = prodData.filter((p: any) => String(p.line_id) === String(lineId));

        return configs.map(c => {
            const configLotIds = c.lot_id.split(',').map(id => String(id).trim());
            const sectionFilter = (c.section || 'all').toUpperCase();

            // Accumulate output quantities grouped by color
            const colorQtyMap: Record<string, number> = {};

            lineOutput.forEach((p: any) => {
                p.items?.forEach((i: any) => {
                    const itemLotId = String(i.lot_id);
                    if (configLotIds.includes(itemLotId)) {
                        // Match section
                        const itemSection = (i.section || 'all').toUpperCase();
                        if (sectionFilter === 'ALL' || itemSection === sectionFilter) {
                            const color = i.color || 'No Color';
                            const qty = (i.details || []).reduce((s: number, d: any) => s + (Number(d.qty_output) || 0), 0);
                            colorQtyMap[color] = (colorQtyMap[color] || 0) + qty;
                        }
                    }
                });
            });

            // Convert grouped colors map to array of { color: string, qty: number }
            const outputs_by_color = Object.entries(colorQtyMap)
                .map(([color, qty]) => ({ color, qty }))
                .filter(item => item.qty > 0)
                .sort((a, b) => b.qty - a.qty);

            const actual_output = outputs_by_color.reduce((sum, item) => sum + item.qty, 0);

            return {
                ...c,
                actual_output,
                outputs_by_color
            };
        });
    }, []);

    // Initial load for editing existing productivity log
    useEffect(() => {
        if (id && typeof id === 'string') {
            setIsLoading(true);
            ProductivityService.getById(id).then(res => {
                if (res.status === 'success' && res.data) {
                    const item = res.data;
                    const rawConfigs = item.lots ? item.lots.map((l: any) => ({
                        lot_id: String(l.id),
                        label: `${l.gl_group?.gl_number || ''} / ${(l.lot_code || '').replace(/^0+/, '')}`,
                        smv: parseFloat(l.pivot?.smv || 0),
                        last_step: parseFloat(l.pivot?.last_step || 0),
                        target_plan: parseFloat(l.pivot?.target_plan || 0),
                        manpower: parseFloat(l.pivot?.manpower || 0),
                        plan_manpower: parseFloat(l.pivot?.plan_manpower || 0),
                        sewer: parseFloat(l.pivot?.sewer || 0),
                        plan_sewer: parseFloat(l.pivot?.plan_sewer || 0),
                        working_hour: parseFloat(l.pivot?.working_hour || 8),
                        section: l.pivot?.section || 'all',
                        media_id: l.pivot?.media_id,
                        media_url: l.pivot?.media_url || l.pivot?.media?.url,
                        merge_id: l.pivot?.merge_id
                    })) : [];

                    // Group by merge_id or pivot values hash (for backward compatibility)
                    const grouped: Record<string, any> = {};
                    rawConfigs.forEach((c: any) => {
                        const hash = c.merge_id || `${c.smv}-${c.last_step}-${c.target_plan}-${c.manpower}-${c.plan_manpower}-${c.sewer}-${c.working_hour}-${c.section}-${c.media_id}`;
                        if (!grouped[hash]) {
                            grouped[hash] = { ...c };
                        } else {
                            grouped[hash].lot_id += `,${c.lot_id}`;
                            grouped[hash].label += ` + ${c.label}`;
                        }
                    });
                    const configs = Object.values(grouped).map((c: any) => ({
                        ...c,
                        row_id: `row-${Math.random().toString(36).substr(2, 9)}`
                    })) as LotConfigItem[];

                    const dateStr = item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '';
                    
                    ProductionService.getAll(dateStr).then(prodRes => {
                        let currentProdData = [];
                        if (prodRes.status === 'success') {
                            currentProdData = prodRes.data || [];
                            setProductionData(currentProdData);
                        }

                        const syncedConfigs = getSyncConfigs(configs, item.line_id, currentProdData);

                        setFormData({
                            id: item.id,
                            line_id: item.line_id,
                            date: dateStr,
                            sewer: parseFloat(item.sewer || 0),
                            lot_configs: syncedConfigs
                        });
                        setLastSynced({
                            line_id: item.line_id,
                            date: dateStr,
                        });
                    });
                }
            }).finally(() => setIsLoading(false));
        }
    }, [id, getSyncConfigs]);

    // Retrieve default values for lot-section pairs
    const fetchDefaultLotConfigs = useCallback(async (pairs: { lot_id: string, section: string }[]) => {
        return await Promise.all(pairs.map(async (pair) => {
            const lotInfo = lots.find(l => String(l.id) === String(pair.lot_id));
            let defaults = {
                smv: 0,
                last_step: 0,
                target_plan: 0,
                manpower: 0,
                plan_manpower: 0,
                sewer: 0,
                plan_sewer: 0,
                working_hour: 8,
                section: pair.section,
                actual_output: 0,
                media_id: undefined as string | undefined,
                media_url: undefined as string | undefined
            };

            try {
                const res = await ProductivityService.getLastInfo(pair.lot_id);
                if (res.status === 'success' && res.data) {
                    defaults = {
                        ...defaults,
                        smv: parseFloat(res.data.smv || 0),
                        target_plan: parseFloat(res.data.target_plan || 0),
                        plan_manpower: parseFloat(res.data.plan_manpower || 0),
                        sewer: parseFloat(res.data.sewer || 0),
                        media_id: res.data.media_id,
                        media_url: res.data.media_url
                    };
                }
            } catch (e) { }

            return {
                row_id: `row-${Math.random().toString(36).substr(2, 9)}`,
                lot_id: pair.lot_id,
                label: lotInfo?.label,
                ...defaults
            };
        }));
    }, [lots]);

    // Keep handleLotSectionAutoFill for compatibility
    const handleLotSectionAutoFill = useCallback(async (pairs: { lot_id: string, section: string }[]) => {
        const configs = await fetchDefaultLotConfigs(pairs);
        setFormData(prev => ({ ...prev, lot_configs: configs }));
    }, [fetchDefaultLotConfigs]);

    // Fetch production data when date changes
    useEffect(() => {
        if (!formData.date) return;
        ProductionService.getAll(formData.date).then(res => {
            if (res.status === 'success') {
                setProductionData(res.data || []);
            }
        });
    }, [formData.date]);

    // Auto-fill GLs from Production Output when line or date is updated
    useEffect(() => {
        if (formData.line_id === lastSynced.line_id && formData.date === lastSynced.date) return;
        if (!formData.line_id || !formData.date || lots.length === 0) return;

        const autoFillStyles = async () => {
            setIsAutoFilling(true);
            try {
                const res = await ProductionService.getAll(formData.date);
                if (res.status === 'success') {
                    const prodList = res.data || [];
                    setProductionData(prodList);

                    const lineOutput = prodList.filter((p: any) => String(p.line_id) === String(formData.line_id));

                    const lotSectionPairs = lineOutput.flatMap((p: any) => {
                        const items = p.items || [];
                        return items.map((i: any) => ({
                            lot_id: String(i.lot_id),
                            section: i.section || 'all'
                        }));
                    }).filter(Boolean);

                    const uniquePairs = Array.from(
                        new Set(lotSectionPairs.map((p: any) => JSON.stringify(p)))
                    ).map((s: any) => JSON.parse(s) as { lot_id: string, section: string });

                    const configs = await fetchDefaultLotConfigs(uniquePairs);
                    const totalMatching = lineOutput.reduce((sum: number, p: any) => sum + (Number(p.man_power_matching) || 0), 0);
                    const syncedConfigs = getSyncConfigs(configs, formData.line_id, prodList);

                    setFormData(prev => ({
                        ...prev,
                        sewer: totalMatching > 0 ? totalMatching : prev.sewer,
                        lot_configs: syncedConfigs.map((c, i) => ({
                            ...c,
                            sewer: i === 0 && totalMatching > 0 ? totalMatching : c.sewer
                        }))
                    }));

                    setLastSynced({ line_id: formData.line_id, date: formData.date });
                }
            } catch (error) {
                console.error('Failed to auto-select styles:', error);
            } finally {
                setIsAutoFilling(false);
            }
        };

        autoFillStyles();
    }, [formData.line_id, formData.date, lots, lastSynced, getSyncConfigs, fetchDefaultLotConfigs]);

    // Keep lot configurations in sync when line changes
    useEffect(() => {
        if (!formData.line_id || !productionData.length) return;
        setFormData(prev => {
            const synced = getSyncConfigs(prev.lot_configs, prev.line_id, productionData);
            const isChanged = JSON.stringify(synced) !== JSON.stringify(prev.lot_configs);
            if (isChanged) {
                return { ...prev, lot_configs: synced };
            }
            return prev;
        });
    }, [formData.line_id, productionData, getSyncConfigs]);

    const handleQuickMerge = async (forceAll = false) => {
        const canMergeAll = formData.lot_configs.length === 2;
        if (!forceAll && !canMergeAll && selectedMergeIds.length < 2) return;

        setIsAutoFilling(true);
        try {
            const toMerge = forceAll ? formData.lot_configs : formData.lot_configs.filter(c => selectedMergeIds.includes(c.row_id));
            const remaining = formData.lot_configs.filter(c => !toMerge.find(m => m.row_id === c.row_id));

            const mergedConfig: LotConfigItem = {
                row_id: `row-${Math.random().toString(36).substr(2, 9)}`,
                lot_id: toMerge.map(c => c.lot_id).join(','),
                label: toMerge.map(c => c.label).join(' + '),
                smv: toMerge[0].smv,
                last_step: Math.max(...toMerge.map(c => c.last_step)),
                target_plan: toMerge[0].target_plan,
                manpower: toMerge[0].manpower,
                plan_manpower: toMerge[0].plan_manpower,
                sewer: Number(formData.sewer) || 0,
                plan_sewer: 0,
                working_hour: toMerge[0].working_hour,
                section: toMerge[0].section || 'all',
                media_id: toMerge[0].media_id,
                media_url: toMerge[0].media_url
            };

            const mergedList = [mergedConfig, ...remaining];
            const syncedConfigs = getSyncConfigs(mergedList, formData.line_id, productionData);

            setFormData(prev => ({ ...prev, lot_configs: syncedConfigs }));
            setSelectedMergeIds([]);
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleUnmerge = async (index: number) => {
        const configToUnmerge = formData.lot_configs[index];
        const ids = configToUnmerge.lot_id.split(',');
        if (ids.length <= 1) return;

        setIsAutoFilling(true);
        try {
            const splitConfigs = await Promise.all(ids.map(async (lotId) => {
                const lotInfo = lots.find(l => String(l.id) === String(lotId));
                let defaults = {
                    smv: configToUnmerge.smv,
                    last_step: configToUnmerge.last_step,
                    target_plan: configToUnmerge.target_plan,
                    manpower: configToUnmerge.manpower,
                    plan_manpower: configToUnmerge.plan_manpower,
                    sewer: configToUnmerge.sewer,
                    plan_sewer: 0,
                    working_hour: configToUnmerge.working_hour,
                    section: configToUnmerge.section || 'all',
                    media_id: undefined as string | undefined,
                    media_url: undefined as string | undefined
                };

                try {
                    const res = await ProductivityService.getLastInfo(String(lotId));
                    if (res.status === 'success' && res.data) {
                        defaults.media_id = res.data.media_id;
                        defaults.media_url = res.data.media_url;
                    }
                } catch (e) {}

                return {
                    row_id: `row-${Math.random().toString(36).substr(2, 9)}`,
                    lot_id: String(lotId),
                    label: lotInfo?.label || `GL / Lot ${lotId}`,
                    ...defaults
                };
            }));

            const syncedSplit = getSyncConfigs(splitConfigs, formData.line_id, productionData);

            setFormData(prev => {
                const nextConfigs = [...prev.lot_configs];
                nextConfigs.splice(index, 1, ...syncedSplit);
                return { ...prev, lot_configs: nextConfigs };
            });
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleLotSelection = async (ids: (string | number)[]) => {
        const prevLotIds = formData.lot_configs.flatMap(c => c.lot_id.split(','));
        const addedIds = ids.filter(id => !prevLotIds.includes(String(id)));
        const existingConfigs = formData.lot_configs.filter(c =>
            c.lot_id.split(',').some(id => ids.includes(id))
        );

        const newConfigs = await Promise.all(addedIds.map(async (lotId) => {
            const lotInfo = lots.find(l => String(l.id) === String(lotId));
            let defaults = {
                smv: 0,
                last_step: 0,
                target_plan: 0,
                manpower: 0,
                plan_manpower: 0,
                sewer: 0,
                plan_sewer: 0,
                working_hour: 8,
                section: 'all',
                actual_output: 0,
                media_id: undefined as string | undefined,
                media_url: undefined as string | undefined
            };

            try {
                const res = await ProductivityService.getLastInfo(String(lotId));
                if (res.status === 'success' && res.data) {
                    defaults = {
                        ...defaults,
                        smv: parseFloat(res.data.smv || 0),
                        target_plan: parseFloat(res.data.target_plan || 0),
                        plan_manpower: parseFloat(res.data.plan_manpower || 0),
                        sewer: parseFloat(res.data.sewer || 0),
                        media_id: res.data.media_id,
                        media_url: res.data.media_url
                    };
                }
            } catch (e) { }

            return {
                row_id: `row-${Math.random().toString(36).substr(2, 9)}`,
                lot_id: String(lotId),
                label: lotInfo?.label,
                ...defaults
            };
        }));

        const mergedConfigs = [...existingConfigs, ...newConfigs];
        const syncedConfigs = getSyncConfigs(mergedConfigs, formData.line_id, productionData);
        setFormData(prev => ({ ...prev, lot_configs: syncedConfigs }));
    };

    const updateLotConfig = (index: number, field: keyof LotConfigItem, value: any) => {
        setFormData(prev => {
            const nextConfigs = [...prev.lot_configs];
            nextConfigs[index] = { ...nextConfigs[index], [field]: value };
            
            if (field === 'section' || field === 'lot_id') {
                const synced = getSyncConfigs(nextConfigs, prev.line_id, productionData);
                return { ...prev, lot_configs: synced };
            }
            
            return { ...prev, lot_configs: nextConfigs };
        });
    };

    const duplicateLotConfig = (index: number) => {
        setFormData(prev => {
            const configToDuplicate = prev.lot_configs[index];
            const nextConfigs = [...prev.lot_configs, { ...configToDuplicate, row_id: `row-${Math.random().toString(36).substr(2, 9)}` }];
            const syncedConfigs = getSyncConfigs(nextConfigs, prev.line_id, productionData);
            return {
                ...prev,
                lot_configs: syncedConfigs
            };
        });
    };

    const removeLotConfig = (index: number) => {
        setFormData(prev => {
            const config = prev.lot_configs[index];
            const nextConfigs = prev.lot_configs.filter((_, i) => i !== index);
            if (config) {
                setSelectedMergeIds(mIds => mIds.filter(id => id !== config.row_id));
            }
            const syncedConfigs = getSyncConfigs(nextConfigs, prev.line_id, productionData);
            return { ...prev, lot_configs: syncedConfigs };
        });
    };

    const handleSave = async (onSuccess: (date: string) => void) => {
        if (!formData.line_id || formData.lot_configs.length === 0) {
            alert('Selection required: Line & Styles');
            return false;
        }

        setIsSaving(true);
        try {
            const processedLotData = formData.lot_configs.flatMap(config => {
                const ids = config.lot_id.split(',');
                return ids.map(id => ({
                    ...config,
                    lot_id: id,
                    merge_id: config.row_id
                }));
            });

            const payload = {
                ...formData,
                manpower: formData.lot_configs.reduce((sum, c) => sum + (Number(c.manpower) || 0), 0),
                plan_manpower: formData.lot_configs.reduce((sum, c) => sum + (Number(c.plan_manpower) || 0), 0),
                sewer: Number(formData.sewer) || 0,
                plan_sewer: 0,
                working_hour: formData.lot_configs[0]?.working_hour || 8,
                lot_data: processedLotData
            };

            const res = await ProductivityService.save(payload);
            if (res.status === 'success') {
                onSuccess(formData.date);
                return true;
            }
            throw new Error(res.message || 'Failed to save log');
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Error saving data.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isSaving,
        lines,
        lots,
        showConfirm,
        setShowConfirm,
        formData,
        setFormData,
        pickingMediaFor,
        setPickingMediaFor,
        isAutoFilling,
        selectedMergeIds,
        setSelectedMergeIds,
        currentTargetSum,
        handleQuickMerge,
        handleUnmerge,
        handleLotSelection,
        updateLotConfig,
        duplicateLotConfig,
        removeLotConfig,
        handleSave
    };
};
