const fs = require('fs');
const file = '/var/www/html/wip/web/features/productivity/components/DetailedStatisticsTable.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add expandedRows state
content = content.replace(
    'const [sortDirection, setSortDirection] = useState<\'asc\' | \'desc\'>(\'desc\');',
    'const [sortDirection, setSortDirection] = useState<\'asc\' | \'desc\'>(\'desc\');\n    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());\n\n    const toggleRow = (gl: string) => {\n        setExpandedRows(prev => {\n            const next = new Set(prev);\n            if (next.has(gl)) next.delete(gl);\n            else next.add(gl);\n            return next;\n        });\n    };\n'
);

// 2. Adjust th headers
content = content.replace(
    '<th className="px-4 py-3 cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort(\'gl_number\')}>GL NUMBER {getSortIcon(\'gl_number\')}</th>',
    '<th className="w-10 px-2"></th>\n                            <th className="px-4 py-3 cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort(\'gl_number\')}>GL NUMBER {getSortIcon(\'gl_number\')}</th>'
);
content = content.replace(
    '<th className="px-4 py-3 cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort(\'color\')}>COLOR {getSortIcon(\'color\')}</th>',
    '' // Remove color column header
);

// 3. Adjust colspans
content = content.replace(/colSpan=\{8\}/g, 'colSpan={8}');

// 4. Update row rendering logic
const oldRowRenderer = `                            paginatedData.map((item, idx) => {
                                const running = isCurrentlyRunning(item.last_update);
                                return (
                                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-zinc-900">
                                        <div className="flex items-center gap-2">
                                            {item.gl_number}
                                            {running && (
                                                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold tracking-widest uppercase" title="Output logged within last 7 days">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-zinc-600">{item.color || '-'}</td>
                                    <td className="px-4 py-3 text-right">{new Intl.NumberFormat('en-US').format(item.order_qty)}</td>
                                    <td className="px-4 py-3 font-bold text-right">{new Intl.NumberFormat('en-US').format(item.output_qty)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={\`font-bold \${item.balance > 0 ? 'text-emerald-500' : item.balance < 0 ? 'text-red-500' : 'text-zinc-400'}\`}>
                                            {item.balance > 0 ? \`+\${new Intl.NumberFormat('en-US').format(item.balance)}\` : new Intl.NumberFormat('en-US').format(item.balance)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-zinc-600">{item.days_running}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={\`px-2 py-0.5 rounded border text-[10px] font-black \${
                                            item.achievement >= 80 
                                                ? 'border-emerald-200 text-emerald-600 bg-emerald-50' 
                                                : item.achievement >= 50 
                                                    ? 'border-amber-200 text-amber-600 bg-amber-50' 
                                                    : 'border-red-200 text-red-600 bg-red-50'
                                        }\`}>
                                            {item.achievement.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium text-zinc-500">{item.last_update}</td>
                                </tr>
                            )})`;

const newRowRenderer = `                            paginatedData.map((item, idx) => {
                                const running = isCurrentlyRunning(item.last_update);
                                const isExpanded = expandedRows.has(item.gl_number);
                                return (
                                <React.Fragment key={idx}>
                                    <tr className={\`hover:bg-zinc-50/50 transition-colors cursor-pointer \${isExpanded ? 'bg-zinc-50/50' : ''}\`} onClick={() => toggleRow(item.gl_number)}>
                                        <td className="px-4 py-3 text-center">
                                            {item.colors && item.colors.length > 0 && (
                                                <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                                    <Icon icon={isExpanded ? "solar:alt-arrow-down-bold" : "solar:alt-arrow-right-bold"} className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-zinc-900">
                                            <div className="flex items-center gap-2">
                                                {item.gl_number}
                                                {running && (
                                                    <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold tracking-widest uppercase" title="Output logged within last 7 days">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">{new Intl.NumberFormat('en-US').format(item.order_qty)}</td>
                                        <td className="px-4 py-3 font-bold text-right">{new Intl.NumberFormat('en-US').format(item.output_qty)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={\`font-bold \${item.balance > 0 ? 'text-emerald-500' : item.balance < 0 ? 'text-red-500' : 'text-zinc-400'}\`}>
                                                {item.balance > 0 ? \`+\${new Intl.NumberFormat('en-US').format(item.balance)}\` : new Intl.NumberFormat('en-US').format(item.balance)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-zinc-600">{item.days_running}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={\`px-2 py-0.5 rounded border text-[10px] font-black \${
                                                item.achievement >= 80 
                                                    ? 'border-emerald-200 text-emerald-600 bg-emerald-50' 
                                                    : item.achievement >= 50 
                                                        ? 'border-amber-200 text-amber-600 bg-amber-50' 
                                                        : 'border-red-200 text-red-600 bg-red-50'
                                            }\`}>
                                                {item.achievement.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium text-zinc-500">{item.last_update}</td>
                                    </tr>
                                    {isExpanded && item.colors && item.colors.length > 0 && (
                                        <tr>
                                            <td colSpan={8} className="bg-zinc-50/50 p-4 border-b border-zinc-100">
                                                <div className="pl-12 pr-4">
                                                    <table className="w-full text-left text-[11px] border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                        <thead className="bg-zinc-100/80 text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                                                            <tr>
                                                                <th className="px-4 py-2">COLOR / TYPE</th>
                                                                <th className="px-4 py-2 text-right">OUTPUT</th>
                                                                <th className="px-4 py-2 text-center">ACHIEVEMENT</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-zinc-100">
                                                            {item.colors.map((c: any, cIdx: number) => (
                                                                <tr key={cIdx} className="hover:bg-zinc-50/50">
                                                                    <td className="px-4 py-2 font-medium text-zinc-700">{c.color || '-'}</td>
                                                                    <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(c.output_qty)}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <span className={\`font-bold \${
                                                                            c.achievement >= 80 ? 'text-emerald-600' : c.achievement >= 50 ? 'text-amber-500' : 'text-red-500'
                                                                        }\`}>{c.achievement.toFixed(2)}%</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )})`;

content = content.replace(oldRowRenderer, newRowRenderer);

// Missing React import
if (!content.includes("import React")) {
    content = content.replace("import { useState, useMemo }", "import React, { useState, useMemo }");
}

fs.writeFileSync(file, content);
console.log('Table patched successfully.');
