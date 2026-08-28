const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace("const [category, setCategory] = useState(CATEGORIES[1]); // Default to first actual category", "const [category, setCategory] = useState('');");

code = code.replace("{CATEGORIES.filter(c => c !== 'All').map(cat => (", "{categories.map(cat => (");

fs.writeFileSync('src/pages/Admin.tsx', code);
