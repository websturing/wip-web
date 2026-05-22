const fs = require('fs');
const file = '/var/www/html/wip/web/features/productivity/components/DetailedStatisticsTable.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add SET ITEM badge next to GL Number
const glNumberBlock = `{item.gl_number}`;
const glNumberWithBadge = `{item.gl_number}\n                                                    {item.is_set_item && (\n                                                        <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold tracking-widest uppercase" title="Output dihitung berdasarkan set terkecil (Minimum antara Top dan Pants)">\n                                                            SET ITEM\n                                                        </span>\n                                                    )}`;

content = content.replace(glNumberBlock, glNumberWithBadge);

// 2. Add tooltip to Output Qty
const outputTd = `<td className="px-4 py-3 font-bold text-right">{new Intl.NumberFormat('en-US').format(item.output_qty)}</td>`;
const outputTdWithTooltip = `<td className="px-4 py-3 font-bold text-right" title={item.is_set_item ? "Calculated based on completed sets (Min of Top & Pants)" : undefined}>{new Intl.NumberFormat('en-US').format(item.output_qty)}</td>`;

content = content.replace(outputTd, outputTdWithTooltip);

fs.writeFileSync(file, content);
console.log('Table set patched successfully.');
