const fs = require('fs');
const file = '/var/www/html/wip/web/features/productivity/components/DetailedStatisticsTable.tsx';
let content = fs.readFileSync(file, 'utf8');

const tfoot = `                                                            </tbody>
                                                            <tfoot className="bg-zinc-100/50">
                                                                <tr>
                                                                    <td className="px-4 py-2 font-bold text-zinc-900 text-right">TOTAL</td>
                                                                    <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(item.order_qty)}</td>
                                                                    <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(item.output_qty)}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <span className={\`font-bold \${item.balance > 0 ? 'text-emerald-500' : item.balance < 0 ? 'text-red-500' : 'text-zinc-400'}\`}>
                                                                            {item.balance > 0 ? \`+\${new Intl.NumberFormat('en-US').format(item.balance)}\` : new Intl.NumberFormat('en-US').format(item.balance)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center font-bold text-zinc-900">
                                                                        {item.achievement.toFixed(2)}%
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>`;

content = content.replace('                                                            </tbody>\n                                                        </table>', tfoot);
fs.writeFileSync(file, content);
console.log('Footer added');
