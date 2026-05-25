const fs = require('fs');
const file = '/var/www/html/wip/web/app/admin/detailed-statistics/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFetch = `                const res = await apiClient.get('/productivity/detailed-statistics');`;
const newFetch = `                const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString();\n                const res = await apiClient.get(\`/productivity/detailed-statistics?\${query}\`);`;

content = content.replace(oldFetch, newFetch);

// Also need to add startDate and endDate to the useEffect dependency array
const oldEffect = `    }, []);`;
const newEffect = `    }, [startDate, endDate]);`;
content = content.replace(oldEffect, newEffect);

fs.writeFileSync(file, content);
console.log('page.tsx patched successfully.');
