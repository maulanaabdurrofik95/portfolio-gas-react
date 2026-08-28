const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/export const CATEGORIES = \[\s*'All',\s*'Web & Otomasi',\s*'Algorithmic Trading',\s*'IoT & Hardware'\s*\];/g, '');
fs.writeFileSync('src/types.ts', code);
