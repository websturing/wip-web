'use client';

import { format } from 'date-fns';
import { Fragment } from 'react';

interface ProductivitySummaryTableProps {
    date: string;
    data: any;
}

export default function ProductivitySummaryTable({ date, data }: ProductivitySummaryTableProps) {
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(num || 0);
    };

    const formatPercent = (num: number) => {
        return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(num || 0);
    };

    return (
        <div className="bg-white p-4 border rounded-lg shadow-sm w-full max-w-4xl mx-auto text-sm">
            
            {/* Header */}
            <div className="flex font-bold text-base mb-2 border-b pb-2">
                <div className="flex-1">{format(new Date(date), 'd-MMM-yy')}</div>
                <div className="flex-1 text-center">TOTAL ACCUMULATION (All Lines)</div>
                <div className="flex-1 text-right">Factory {data.prefix}</div>
            </div>

            <div className="border border-black">
                {/* Categories */}
                {data.categories.map((cat: any, idx: number) => (
                    <Fragment key={idx}>
                        <div className="bg-gray-200 border-b border-black font-bold p-1 text-center">
                            {cat.label}
                        </div>
                        
                        <div className="flex border-b border-black font-bold italic">
                            <div className="w-[30%] p-1 border-r border-black"></div>
                            <div className="w-[30%] p-1 text-center border-r border-black">{cat.shiftName} ({cat.start}-{cat.end})</div>
                            <div className="w-[15%] p-1 text-center border-r border-black">TOTAL</div>
                            <div className="w-[25%] p-1 text-center bg-yellow-400 not-italic">
                                SPV {cat.start} - {cat.end} {cat.shiftCode}
                            </div>
                        </div>

                        {[
                            { label: 'Sewer/Helper', key: 'Sewer/Helper', isPercent: false },
                            { label: 'Total Hours', key: 'Total Hours', isPercent: false },
                            { label: 'Total Daily Target', key: 'Total Daily Target', isPercent: false },
                            { label: 'Total Production Output', key: 'Total Production Output', isPercent: false },
                        ].map((row, rIdx) => (
                            <div key={rIdx} className="flex border-b border-black font-bold">
                                <div className="w-[30%] p-1 border-r border-black">{row.label}</div>
                                <div className="w-[30%] p-1 text-center border-r border-black font-normal">
                                    {formatNumber(cat.metrics[row.key])}
                                </div>
                                <div className="w-[15%] p-1 text-center border-r border-black">
                                    {formatNumber(cat.metrics[row.key])}
                                </div>
                                <div className="w-[25%] bg-white"></div>
                            </div>
                        ))}
                        
                        {/* % Achieved Row */}
                        <div className="flex border-b border-black font-bold">
                            <div className="w-[30%] p-1 border-r border-black">% of Achieved</div>
                            <div className="w-[30%] p-1 text-center border-r border-black bg-[#FFE699]">
                                {formatPercent(cat.metrics['% of Achieved'])}
                            </div>
                            <div className="w-[15%] p-1 text-center border-r border-black bg-[#FFE699]">
                                {formatPercent(cat.metrics['% of Achieved'])}
                            </div>
                            <div className="w-[25%] bg-white"></div>
                        </div>
                    </Fragment>
                ))}

                {/* All Shifts Summary */}
                <div className="bg-gray-200 border-b border-black font-bold p-1 text-center mt-2">
                    SEWING ALL SHIFT
                </div>
                
                <div className="flex border-b border-black font-bold italic">
                    <div className="w-[30%] p-1 border-r border-black"></div>
                    <div className="w-[30%] p-1 text-center border-r border-black">DAY - NIGHT</div>
                    <div className="w-[15%] p-1 text-center border-r border-black">TOTAL</div>
                    <div className="w-[25%] bg-white"></div>
                </div>

                {[
                    { label: 'Sewer/Helper', key: 'Sewer/Helper', isPercent: false },
                    { label: 'Total Hours', key: 'Total Hours', isPercent: false },
                    { label: 'Total Daily Target', key: 'Total Daily Target', isPercent: false },
                    { label: 'Total Production Output', key: 'Total Production Output', isPercent: false },
                ].map((row, rIdx) => (
                    <div key={rIdx} className="flex border-b border-black font-bold">
                        <div className="w-[30%] p-1 border-r border-black">{row.label}</div>
                        <div className="w-[30%] p-1 text-center border-r border-black font-normal">
                            {formatNumber(data.allTotals[row.key])}
                        </div>
                        <div className="w-[15%] p-1 text-center border-r border-black">
                            {formatNumber(data.allTotals[row.key])}
                        </div>
                        <div className="w-[25%] bg-white"></div>
                    </div>
                ))}
                
                <div className="flex border-b border-black font-bold">
                    <div className="w-[30%] p-1 border-r border-black">% of Achieved</div>
                    <div className="w-[30%] p-1 text-center border-r border-black bg-[#FFE699]">
                        {formatPercent(data.allTotals['% of Achieved'])}
                    </div>
                    <div className="w-[15%] p-1 text-center border-r border-black bg-[#FFE699]">
                        {formatPercent(data.allTotals['% of Achieved'])}
                    </div>
                    <div className="w-[25%] bg-white"></div>
                </div>

                {/* Signatures & Footer Blocks */}
                <div className="flex mt-4 font-bold text-center">
                    <div className="w-[30%]"></div>
                    <div className="w-[22%] border border-black bg-yellow-400 p-1">Production Manager</div>
                    <div className="w-[23%] border border-black bg-yellow-400 p-1 ml-1">Production Manager</div>
                    <div className="flex-1 border border-black bg-yellow-400 p-1 ml-1">FACTORY MANAGER</div>
                </div>
                <div className="flex text-center mb-1">
                    <div className="w-[30%]"></div>
                    <div className="w-[22%] border-x border-b border-black h-16"></div>
                    <div className="w-[23%] border-x border-b border-black h-16 ml-1"></div>
                    <div className="flex-1 border-x border-b border-black h-16 ml-1"></div>
                </div>
                <div className="flex text-center font-bold">
                    <div className="w-[30%]"></div>
                    <div className="w-[22%] border border-black p-1">MS. Sri Sutarmi</div>
                    <div className="w-[23%] border border-black p-1 ml-1">MS. Anabel</div>
                    <div className="flex-1 border border-black p-1 ml-1">MS. QING FEN YE</div>
                </div>



                <div className="flex mt-1 border border-black bg-yellow-300">
                    <div className="w-[30%]"></div>
                    <div className="w-[22%] p-1"></div>
                    <div className="flex-1"></div>
                </div>
            </div>
        </div>
    );
}
