const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace("import { CATEGORIES, Menu, Portfolio } from '../types';", "import { Menu, Portfolio } from '../types';");
code = code.replace("{CATEGORIES.length - 1}", "{categories.length}");

fs.writeFileSync('src/pages/Admin.tsx', code);
