const fs = require('fs');
const file = '/var/www/html/wip/web/features/productivity/components/DetailedStatisticsTable.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace table header for nested table
const nestedHeaderOld = `<thead className="bg-zinc-100/80 text-zinc-500 font-bold uppercase tracking-widest text-[9px]">\n                                                                <tr>\n                                                                    <th className="px-4 py-2">COLOR / TYPE</th>\n                                                                    <th className="px-4 py-2 text-right">OUTPUT</th>\n                                                                    <th className="px-4 py-2 text-center">ACHIEVEMENT</th>\n                                                                </tr>\n                                                            </thead>`;

const nestedHeaderNew = `<thead className="bg-zinc-100/80 text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                                                                <tr>
                                                                    <th className="px-4 py-2">COLOR / TYPE</th>
                                                                    <th className="px-4 py-2 text-right">INPUT</th>
                                                                    <th className="px-4 py-2 text-right">OUTPUT</th>
                                                                    <th className="px-4 py-2 text-center">BALANCE</th>
                                                                    <th className="px-4 py-2 text-center">ACHIEVEMENT</th>
                                                                </tr>
                                                            </thead>`;

content = content.replace(nestedHeaderOld, nestedHeaderNew);

// Replace nested rows
const nestedRowOld = `<tr key={cIdx} className="hover:bg-zinc-50/50">\n                                                                        <td className="px-4 py-2 font-medium text-zinc-700">{c.color || '-'}</td>\n                                                                        <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(c.output_qty)}</td>\n                                                                        <td className="px-4 py-2 text-center">\n                                                                            <span className={\`font-bold \${c.achievement >= 80 ? 'text-emerald-600' : c.achievement >= 50 ? 'text-amber-500' : 'text-red-500'\n                                                                                }\`}>{c.achievement.toFixed(2)}%</span>\n                                                                        </td>\n                                                                    </tr>`;

const nestedRowNew = `<tr key={cIdx} className="hover:bg-zinc-50/50">
                                                                        <td className="px-4 py-2 font-medium text-zinc-700">{c.color || '-'}</td>
                                                                        <td className="px-4 py-2 text-right">{new Intl.NumberFormat('en-US').format(c.order_qty)}</td>
                                                                        <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(c.output_qty)}</td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <span className={\`font-bold \${c.balance > 0 ? 'text-emerald-500' : c.balance < 0 ? 'text-red-500' : 'text-zinc-400'}\`}>
                                                                                {c.balance > 0 ? \`+\${new Intl.NumberFormat('en-US').format(c.balance)}\` : new Intl.NumberFormat('en-US').format(c.balance)}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <span className={\`font-bold \${c.achievement >= 80 ? 'text-emerald-600' : c.achievement >= 50 ? 'text-amber-500' : 'text-red-500'}\`}>
                                                                                {c.achievement.toFixed(2)}%
                                                                            </span>
                                                                        </td>
                                                                    </tr>`;

content = content.replace(nestedRowOld, nestedRowNew);
fs.writeFileSync(file, content);
console.log('Nested table patched.');
