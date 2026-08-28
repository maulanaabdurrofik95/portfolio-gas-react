const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace("import { Portfolio, Menu, CATEGORIES } from '../types';", "import { Portfolio, Menu } from '../types';");
code = code.replace("const { portfolios, menus, settings, loading, fetchAll } = useGAS();", "const { portfolios, menus, categories, settings, loading, fetchAll } = useGAS();");
code = code.replace("CATEGORIES.map((cat) => (", "['All', ...categories].map((cat) => (");

fs.writeFileSync('src/pages/Home.tsx', code);
