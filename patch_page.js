const fs = require('fs');
const file = '/var/www/html/wip/web/app/admin/detailed-statistics/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add setDatePreset
const datePresetFunc = `
    const setDatePreset = (preset: 'today' | 'week' | 'month') => {
        const d = new Date();
        const end = d.toISOString().split('T')[0];
        if (preset === 'today') {
            setStartDate(end);
            setEndDate(end);
        } else if (preset === 'week') {
            const start = new Date(d);
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end);
        } else if (preset === 'month') {
            const start = new Date(d.getFullYear(), d.getMonth(), 2); // 2 to offset timezone if needed, better use UTC or local
            const localStart = new Date(d.getFullYear(), d.getMonth(), 1);
            // simple format
            const yyyy = localStart.getFullYear();
            const mm = String(localStart.getMonth() + 1).padStart(2, '0');
            const dd = String(localStart.getDate()).padStart(2, '0');
            setStartDate(\`\${yyyy}-\${mm}-\${dd}\`);
            setEndDate(end);
        }
    };

    const dataToDisplay = activeTab === 'active' ? activeGLs : pendingGLs;
    const totalInputDisplay = dataToDisplay.reduce((sum, item) => sum + (item.order_qty || 0), 0);
    const totalOutputDisplay = dataToDisplay.reduce((sum, item) => sum + (item.output_qty || 0), 0);
`;

content = content.replace('const activeGLsCount = activeGLs.length;', 'const activeGLsCount = activeGLs.length;\n' + datePresetFunc);

// Update Grid class
content = content.replace('<div className="grid grid-cols-4 gap-4 mt-6">', '<div className="grid grid-cols-6 gap-4 mt-6">');

// Add 2 new cards after the Pending GLs card
const pendingCardEnd = `</p>\n                </div>\n            </div>`;
const newCards = `</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:box-minimalistic-bold-duotone" className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Total Input</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : new Intl.NumberFormat('en-US').format(totalInputDisplay)}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Total Order on Selected Tab</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Total Output</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : new Intl.NumberFormat('en-US').format(totalOutputDisplay)}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Total Output on Selected Tab</p>
                </div>
            </div>`;

content = content.replace(pendingCardEnd, newCards);

// Add Date Presets buttons next to the date picker
const datePickerEnd = `className="text-xs font-bold bg-transparent outline-none px-2 text-zinc-600"\n                        />\n                    </div>\n                </div>`;
const datePickerWithPresets = `className="text-xs font-bold bg-transparent outline-none px-2 text-zinc-600"\n                        />\n                    </div>\n\n                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shadow-sm">\n                        <button onClick={() => setDatePreset('today')} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">Today</button>\n                        <button onClick={() => setDatePreset('week')} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">This Week</button>\n                        <button onClick={() => setDatePreset('month')} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">This Month</button>\n                    </div>\n                </div>`;

content = content.replace(datePickerEnd, datePickerWithPresets);

fs.writeFileSync(file, content);
console.log('page patched.');
