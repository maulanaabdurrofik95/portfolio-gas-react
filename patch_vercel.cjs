const fs = require('fs');
let code = fs.readFileSync('vercel.json', 'utf8');

const newRewrite = `
    {
      "source": "/api/categories",
      "destination": "https://script.google.com/macros/s/AKfycbxx1jr54BQRloOSbvpCtqzKygUKl4LgE_vgbjay9IMrMxx6f5vMDr8QtGyqTxzw5Q5I6A/exec?action=getCategories"
    },`;

code = code.replace('"rewrites": [', '"rewrites": [' + newRewrite);
fs.writeFileSync('vercel.json', code);
