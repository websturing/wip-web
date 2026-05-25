'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { MultiSelect } from '@/app/components/ui/MultiSelect';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { WipReportService } from '../services/WipReportService';

export default function WipBalanceReport() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [glOptions, setGlOptions] = useState<{ id: string, label: string }[]>([]);
    const [colorOptions, setColorOptions] = useState<{ id: string, label: string }[]>([]);

    const [selectedGl, setSelectedGl] = useState<string>('');
    const [selectedColors, setSelectedColors] = useState<(string | number)[]>([]);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Report', icon: 'solar:document-text-bold-duotone' },
        { label: 'Balance Size', icon: 'solar:checklist-minimalistic-bold-duotone' },
    ];

    useEffect(() => {
        // Load GL options
        WipReportService.getSummary().then(res => {
            if (res.status === 'success' && res.gl_options) {
                setGlOptions(res.gl_options.map((gl: string) => ({ id: gl, label: gl })));
            }
        });
    }, []);

    useEffect(() => {
        if (selectedGl) {
            // Load colors for the selected GL
            setSelectedColors([]);
            WipReportService.getLotColors(selectedGl).then(res => {
                if (res.status === 'success') {
                    setColorOptions(res.data.map((c: string) => ({ id: c, label: c })));
                }
            });
        }
    }, [selectedGl]);

    const handleSelectAllColors = () => {
        setSelectedColors(colorOptions.map(o => o.id));
    };

    const loadData = async () => {
        if (!selectedGl || selectedColors.length === 0) return;
        setIsLoading(true);
        try {
            const res = await WipReportService.getBalanceSummary(selectedGl, selectedColors.map(String));
            if (res.status === 'success') {
                setData(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!data) return;

        let html = `<table border="1" style="border-collapse:collapse; font-family:Arial, sans-serif;">`;

        data.reports.forEach((report: any, idx: number) => {
            const sizeCount = data.sizes.length;
            const tableWidth = 4 + sizeCount + 1; // Remark, DO, Date, Line, Sizes, Total

            // Title Row
            html += `
                <tr>
                    <td colspan="${tableWidth}" style="font-size:24px; font-weight:bold; color:#FF0000; border:none;">INPUT</td>
                    <td style="width:20px; background-color:#FFFF00; border:none;"></td>
                    <td colspan="${tableWidth + 1}" style="font-size:24px; font-weight:bold; color:#00B050; border:none;">OUTPUT</td>
                </tr>
                <tr><td colspan="${tableWidth * 2 + 2}" style="border:none; height:10px;"></td></tr>
            `;

            // Meta Info
            const metaRows = [
                ['GL#', data.header.gl],
                ['STYLE#', data.header.style],
                ['Order Qty', `${data.header.order_qty} pcs.`],
                ['COLOR', report.color]
            ];

            metaRows.forEach((meta, mIdx) => {
                const isColor = meta[0] === 'COLOR';
                const valStyle = isColor ? 'color:#0000FF; text-decoration:underline; font-weight:bold;' : 'font-weight:bold;';

                html += `
                    <tr>
                        <td style="font-weight:bold; border:none;">${meta[0]}</td>
                        <td colspan="${tableWidth - 1}" style="${valStyle} border:none;">${meta[1]}</td>
                        <td style="background-color:#FFFF00; border:none;"></td>
                        <td style="font-weight:bold; border:none;">${meta[0]}</td>
                        <td colspan="${tableWidth}" style="${valStyle} border:none;">${meta[1]}</td>
                    </tr>
                `;
            });

            html += `<tr><td colspan="${tableWidth * 2 + 2}" style="border:none; height:10px;"></td></tr>`;

            // TABLE HEADERS
            html += `
                <tr>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">REMARK</td>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">DO<br/>NUMBER</td>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">DATE</td>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">LINE</td>
                    ${data.sizes.map((s: string) => `<td style="background-color:#DDEBF7; font-weight:bold; text-align:center;">${s}</td>`).join('')}
                    <td style="background-color:#202020; color:#FFFFFF; font-weight:bold; text-align:center;">TOTAL</td>
                    <td style="background-color:#FFFF00; border:none;"></td>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">REMARK</td>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">DO<br/>NUMBER</td>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">DATE</td>
                    <td style="background-color:#F2F2F2; font-weight:bold; text-align:center; vertical-align:middle;">LINE</td>
                    ${data.sizes.map((s: string) => `<td style="background-color:#DDEBF7; font-weight:bold; text-align:center;">${s}</td>`).join('')}
                    <td style="background-color:#202020; color:#FFFFFF; font-weight:bold; text-align:center;">TOTAL</td>
                </tr>
            `;

            // DATA ROWS
            const inCut = report.cutting_qty || { sizes: {}, total: 0 };

            // Header Row for Actual Cut
            html += `
                <tr style="background-color:#EBF1DE; font-weight:bold;">
                    <td colspan="4">ACTUAL CUT (CUTTING DEPT)</td>
                    ${data.sizes.map((s: string) => `<td style="text-align:center;">${inCut.sizes[s] || ''}</td>`).join('')}
                    <td style="text-align:center; background-color:#8EB4E3;">${inCut.total}</td>
                    <td style="background-color:#FFFF00; border:none;"></td>
                    <td colspan="4">ACTUAL CUT (CUTTING DEPT)</td>
                    ${data.sizes.map((s: string) => `<td style="text-align:center;">${inCut.sizes[s] || ''}</td>`).join('')}
                    <td style="text-align:center; background-color:#8EB4E3;">${inCut.total}</td>
                </tr>
            `;

            const maxRows = Math.max(report.input.length, report.output.length, 5); // Show at least 5 rows
            for (let i = 0; i < maxRows; i++) {
                const inRow = report.input[i] || { date: '', line: '', sizes: {}, total: 0 };
                const outRow = report.output[i] || { do_number: '', date: '', line: '', sizes: {}, total: 0 };

                html += `
                    <tr>
                        <td style="text-align:center;">-</td>
                        <td style="text-align:center; color:#CCCCCC;">-</td>
                        <td style="text-align:center;">${inRow.date}</td>
                        <td style="text-align:center; font-weight:bold;">${inRow.line}</td>
                        ${data.sizes.map((s: string) => `<td style="text-align:center;">${inRow.sizes[s] || ''}</td>`).join('')}
                        <td style="text-align:center; font-weight:bold; background-color:#F2F2F2;">${inRow.total || ''}</td>
                        <td style="background-color:#FFFF00; border:none;"></td>
                        <td style="text-align:center;">-</td>
                        <td style="text-align:center; font-weight:bold;">${outRow.do_number === '-' ? '' : outRow.do_number}</td>
                        <td style="text-align:center;">${outRow.date}</td>
                        <td style="text-align:center; font-weight:bold;">${outRow.line}</td>
                        ${data.sizes.map((s: string) => `<td style="text-align:center;">${outRow.sizes[s] || ''}</td>`).join('')}
                        <td style="text-align:center; font-weight:bold; background-color:#F2F2F2;">${outRow.total || ''}</td>
                    </tr>
                `;
            }

            // FOOTER: TOTALS
            html += `
                <tr style="font-weight:bold; background-color:#D9D9D9;">
                    <td colspan="4" style="text-align:right;">TOTAL INPUT SEWING</td>
                    ${data.sizes.map((s: string) => `<td style="text-align:center;">${report.input.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0) || ''}</td>`).join('')}
                    <td style="text-align:center; background-color:#202020; color:#FFFFFF;">${report.input.reduce((sum: number, r: any) => sum + r.total, 0)}</td>
                    <td style="background-color:#FFFF00; border:none;"></td>
                    <td colspan="4" style="text-align:right;">TOTAL OUTPUT SEWING</td>
                    ${data.sizes.map((s: string) => `<td style="text-align:center;">${report.output.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0) || ''}</td>`).join('')}
                    <td style="text-align:center; background-color:#202020; color:#FFFFFF;">${report.output.reduce((sum: number, r: any) => sum + r.total, 0)}</td>
                </tr>
            `;

            // FOOTER: DIFF QTY
            html += `
                <tr style="font-weight:bold;">
                    <td colspan="4" style="text-align:right;">DIFF (CUT vs INPUT)</td>
                    ${data.sizes.map((s: string) => {
                const cutVal = report.cutting_qty.sizes[s] || 0;
                const inSum = report.input.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0);
                const diff = cutVal - inSum;
                return `<td style="text-align:center; color:#FF0000; border:2px solid black;">${diff || 0}</td>`;
            }).join('')}
                    <td style="text-align:center; color:#FF0000; border:2px solid black;">${report.cutting_qty.total - report.input.reduce((sum: number, r: any) => sum + r.total, 0)}</td>
                    <td style="background-color:#FFFF00; border:none;"></td>
                    <td colspan="4" style="text-align:right;">DIFF (CUT vs OUTPUT)</td>
                    ${data.sizes.map((s: string) => {
                const cutVal = inCut.sizes[s] || 0;
                const outSum = report.output.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0);
                const diff = cutVal - outSum;
                const displayDiff = diff === 0 ? '-' : (diff < 0 ? `+${Math.abs(diff)}` : diff);
                return `<td style="text-align:center; color:#FF0000; border:2px solid black;">${displayDiff}</td>`;
            }).join('')}
                    ${(() => {
                const totalDiff = inCut.total - report.output.reduce((sum: number, r: any) => sum + r.total, 0);
                const displayTotalDiff = totalDiff === 0 ? '-' : (totalDiff < 0 ? `+${Math.abs(totalDiff)}` : totalDiff);
                return `<td style="text-align:center; color:#FF0000; border:2px solid black;">${displayTotalDiff}</td>`;
            })()}
                </tr>
                <tr><td colspan="${tableWidth * 2 + 2}" style="border:none; height:40px;"></td></tr>
            `;
        });

        html += `</table>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Balance_Report_${data.header.gl}.xls`;
        a.click();
    };

    const formatNum = (num: number) => num === 0 ? '' : new Intl.NumberFormat().format(num);

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="Input vs Output Balance Report"
                description="Monitor production flow and identify discrepancies across operations."
            />

            <div className="mb-8 flex flex-wrap items-end gap-4 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm relative z-40">
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Select GL Number</label>
                    <Select
                        options={glOptions}
                        value={selectedGl}
                        onChange={(val) => setSelectedGl(val as string)}
                        placeholder="Choose GL..."
                    />
                </div>

                <div className="flex-1 min-w-[250px] space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Color(s)</label>
                        <button
                            disabled={!selectedGl || colorOptions.length === 0}
                            onClick={handleSelectAllColors}
                            className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:underline disabled:opacity-30"
                        >
                            Select All
                        </button>
                    </div>
                    <MultiSelect
                        options={colorOptions}
                        value={selectedColors}
                        onChange={setSelectedColors}
                        placeholder={selectedGl ? "Select Colors..." : "First choose GL"}
                        disabled={!selectedGl}
                        className="max-h-[120px] overflow-y-auto custom-scrollbar"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={loadData}
                        disabled={!selectedGl || selectedColors.length === 0 || isLoading}
                        className="h-12 px-8 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4" />
                        )}
                        Load Report
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!data}
                        onClick={exportToExcel}
                        className="h-12 px-6 bg-emerald-600 text-white border-none rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Icon icon="solar:file-download-bold-duotone" className="w-4 h-4" />
                        Excel
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.print()}
                        className="h-12 px-6 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-zinc-50 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Icon icon="solar:printer-bold-duotone" className="w-4 h-4 text-zinc-400" />
                        Print
                    </Button>
                </div>
            </div>

            {data ? (
                <div className="space-y-12 pb-20">
                    {/* INFO HEADER */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        <InfoCard label="GL#" value={data.header.gl} icon="solar:tag-bold" color="blue" />
                        <InfoCard label="STYLE#" value={data.header.style} icon="solar:t-shirt-bold" color="amber" />
                        <InfoCard label="Order Qty" value={`${new Intl.NumberFormat().format(data.header.order_qty)} pcs.`} icon="solar:box-bold" color="emerald" />
                    </div>

                    {data.reports.map((report: any, rIdx: number) => (
                        <div key={rIdx} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-zinc-100"></div>
                                <div className="px-4 py-1.5 bg-zinc-900 rounded-full flex items-center gap-2.5 shadow-lg">
                                    <Icon icon="solar:palette-bold" className="w-3.5 h-3.5 text-white" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-mono">{report.color}</span>
                                </div>
                                <div className="h-px flex-1 bg-zinc-100"></div>
                            </div>

                            {/* MAIN TABLES */}
                            <div className="relative bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden min-h-[50px]">
                                <div className="flex flex-col lg:flex-row">
                                    {/* INPUT SIDE */}
                                    <div className="flex-1 border-r border-zinc-100 p-0.5 lg:p-1 overflow-x-auto lg:overflow-visible">
                                        <div className="bg-red-500 text-white px-3 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] mb-1 rounded-t-lg text-center font-mono">
                                            INPUT (Sewing)
                                        </div>
                                        <div className="overflow-x-auto no-scrollbar scroll-smooth">
                                            <table className="w-full text-[9px] border-collapse min-w-[500px] lg:min-w-0">
                                                <thead>
                                                    <tr className="bg-zinc-50 text-zinc-500 font-black uppercase tracking-tighter">
                                                        <th className="border border-zinc-200 p-1.5 text-left">Remark</th>
                                                        <th className="border border-zinc-200 p-1.5 w-14">DATE</th>
                                                        <th className="border border-zinc-200 p-1.5 w-14">LINE</th>
                                                        {data.sizes.map((s: string) => (
                                                            <th key={s} className="border border-zinc-200 p-1.5 bg-blue-50/50 text-blue-700 min-w-[30px]">{s}</th>
                                                        ))}
                                                        <th className="border border-zinc-200 p-1.5 bg-zinc-900 text-white w-16">TOTAL</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="font-bold text-zinc-700">
                                                    {/* ACTUAL CUT FROM API ROW */}
                                                    <tr className="bg-blue-50/30 text-blue-900 border-b-2 border-zinc-200">
                                                        <td colSpan={3} className="border border-zinc-200 p-1.5 uppercase tracking-widest text-[8px] font-black italic">Actual Cut Qty (Cutting Dept)</td>
                                                        {data.sizes.map((s: string) => (
                                                            <td key={s} className="border border-zinc-200 p-1.5 text-center tabular-nums bg-blue-50/50">{formatNum(report.cutting_qty.sizes[s])}</td>
                                                        ))}
                                                        <td className="border border-zinc-200 p-1.5 text-center tabular-nums bg-blue-900 text-white font-black">{formatNum(report.cutting_qty.total)}</td>
                                                    </tr>

                                                    {report.input.map((row: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                                            <td className="border border-zinc-200 p-1.5">-</td>
                                                            <td className="border border-zinc-200 p-1.5 text-center text-zinc-500 whitespace-nowrap">{row.date}</td>
                                                            <td className="border border-zinc-200 p-1.5 text-center text-blue-600 uppercase font-black">{row.line}</td>
                                                            {data.sizes.map((s: string) => (
                                                                <td key={s} className="border border-zinc-200 p-1.5 text-center tabular-nums">{formatNum(row.sizes[s])}</td>
                                                            ))}
                                                            <td className="border border-zinc-200 p-1.5 text-center tabular-nums bg-zinc-50 font-black">{formatNum(row.total)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-zinc-50 font-black">
                                                    <tr className="bg-zinc-100/80 border-t-2 border-zinc-300">
                                                        <td colSpan={3} className="border border-zinc-200 p-1.5 uppercase tracking-widest text-zinc-900 text-[8px]">Grand Total Input Sewing</td>
                                                        {data.sizes.map((s: string) => (
                                                            <td key={s} className="border border-zinc-200 p-1.5 text-center text-zinc-900 text-[10px]">
                                                                {formatNum(report.input.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0))}
                                                            </td>
                                                        ))}
                                                        <td className="border border-zinc-200 p-1.5 text-center bg-zinc-900 text-white text-[10px]">
                                                            {formatNum(report.input.reduce((sum: number, r: any) => sum + (r.total || 0), 0))}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white text-red-500 text-[9px]">
                                                        <td colSpan={3} className="border border-zinc-200 p-1.5 uppercase tracking-widest font-black italic">Diff (Cut - Input)</td>
                                                        {data.sizes.map((s: string) => {
                                                            const cutQty = report.cutting_qty.sizes[s] || 0;
                                                            const inSum = report.input.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0);
                                                            const diff = cutQty - inSum;
                                                            return (
                                                                <td key={s} className={cn(
                                                                    "border border-zinc-200 p-1.5 text-center font-black text-[10px]",
                                                                    diff > 0 ? "text-amber-600" : diff < 0 ? "text-red-600" : "text-emerald-600"
                                                                )}>
                                                                    {diff === 0 ? '-' : diff}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="border border-zinc-200 p-1.5 text-center font-black text-[10px] bg-red-50">
                                                            {report.cutting_qty.total - report.input.reduce((sum: number, r: any) => sum + (r.total || 0), 0)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* YELLOW SEPARATOR */}
                                    <div className="hidden lg:block w-2.5 bg-yellow-400 shrink-0 shadow-inner"></div>

                                    {/* OUTPUT SIDE */}
                                    <div className="flex-1 p-0.5 lg:p-1 overflow-x-auto lg:overflow-visible">
                                        <div className="bg-emerald-500 text-white px-3 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] mb-1 rounded-t-lg text-center font-mono">
                                            OUTPUT (Sewing)
                                        </div>
                                        <div className="overflow-x-auto no-scrollbar scroll-smooth">
                                            <table className="w-full text-[9px] border-collapse min-w-[500px] lg:min-w-0">
                                                <thead>
                                                    <tr className="bg-zinc-50 text-zinc-500 font-black uppercase tracking-tighter">
                                                        <th className="border border-zinc-200 p-1.5 text-left">Remark</th>
                                                        <th className="border border-zinc-200 p-1.5 w-14">DO NO.</th>
                                                        <th className="border border-zinc-200 p-1.5 w-14">DATE</th>
                                                        <th className="border border-zinc-200 p-1.5 w-14">LINE</th>
                                                        {data.sizes.map((s: string) => (
                                                            <th key={s} className="border border-zinc-200 p-1.5 bg-emerald-50/50 text-emerald-700 min-w-[30px]">{s}</th>
                                                        ))}
                                                        <th className="border border-zinc-200 p-1.5 bg-zinc-900 text-white w-16">TOTAL</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="font-bold text-zinc-700">
                                                    {/* ACTUAL CUT FROM API ROW AS REFERENCE */}
                                                    <tr className="bg-blue-50/30 text-blue-900 border-b-2 border-zinc-200">
                                                        <td colSpan={4} className="border border-zinc-200 p-1.5 uppercase tracking-widest text-[8px] font-black italic">Actual Cut Qty (Cutting Dept)</td>
                                                        {data.sizes.map((s: string) => (
                                                            <td key={s} className="border border-zinc-200 p-1.5 text-center tabular-nums bg-blue-50/50">
                                                                {formatNum(report.cutting_qty.sizes[s])}
                                                            </td>
                                                        ))}
                                                        <td className="border border-zinc-200 p-1.5 text-center tabular-nums bg-blue-900 text-white font-black">
                                                            {formatNum(report.cutting_qty.total)}
                                                        </td>
                                                    </tr>

                                                    {report.output.map((row: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                                            <td className="border border-zinc-200 p-1.5 text-zinc-300">-</td>
                                                            <td className="border border-zinc-200 p-1.5 text-center text-emerald-600 font-black uppercase text-[8px]">{row.do_number}</td>
                                                            <td className="border border-zinc-200 p-1.5 text-center text-zinc-500 whitespace-nowrap">{row.date}</td>
                                                            <td className="border border-zinc-200 p-1.5 text-center uppercase font-black">{row.line}</td>
                                                            {data.sizes.map((s: string) => (
                                                                <td key={s} className="border border-zinc-200 p-1.5 text-center tabular-nums">{formatNum(row.sizes[s])}</td>
                                                            ))}
                                                            <td className="border border-zinc-200 p-1.5 text-center tabular-nums bg-zinc-50 font-black">{formatNum(row.total)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-zinc-50 font-black">
                                                    <tr className="bg-emerald-50/80 border-t-2 border-zinc-300">
                                                        <td colSpan={4} className="border border-zinc-200 p-1.5 uppercase tracking-widest text-emerald-900 text-[8px]">Grand Total Output Sewing</td>
                                                        {data.sizes.map((s: string) => (
                                                            <td key={s} className="border border-zinc-200 p-1.5 text-center text-emerald-700 text-[10px]">
                                                                {formatNum(report.output.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0))}
                                                            </td>
                                                        ))}
                                                        <td className="border border-zinc-200 p-1.5 text-center bg-zinc-900 text-white text-[10px]">
                                                            {formatNum(report.output.reduce((sum: number, r: any) => sum + (r.total || 0), 0))}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white text-red-500 text-[9px]">
                                                        <td colSpan={4} className="border border-zinc-200 p-1.5 uppercase tracking-widest font-black italic">Diff (Cut - Output)</td>
                                                        {data.sizes.map((s: string) => {
                                                            const cutQty = report.cutting_qty.sizes[s] || 0;
                                                            const outSum = report.output.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0);
                                                            const diff = cutQty - outSum;
                                                            const displayDiff = diff === 0 ? '-' : (diff < 0 ? `+${Math.abs(diff)}` : diff);
                                                            return (
                                                                <td key={s} className={cn(
                                                                    "border border-zinc-200 p-1.5 text-center font-black text-[10px]",
                                                                    diff > 0 ? "text-amber-600" : diff < 0 ? "text-red-600" : "text-emerald-600"
                                                                )}>
                                                                    {displayDiff}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="border border-zinc-200 p-1.5 text-center font-black text-[10px] bg-red-50">
                                                            {(() => {
                                                                const totalDiff = report.cutting_qty.total - report.output.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
                                                                return totalDiff === 0 ? '-' : (totalDiff < 0 ? `+${Math.abs(totalDiff)}` : totalDiff);
                                                            })()}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-zinc-200">
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 mb-4 animate-bounce">
                        <Icon icon="solar:document-text-bold-duotone" className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">No Intelligence Loaded</h3>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter mt-1">Please select GL and Color(s) above to generate performance metrics.</p>
                </div>
            )}
        </div>
    );
}

function InfoCard({ label, value, icon, color }: { label: string, value: string, icon: string, color: string }) {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform", colors[color])}>
                <Icon icon={icon} className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-sm font-black text-zinc-900 truncate max-w-[150px]">{value}</p>
            </div>
        </div>
    );
}
