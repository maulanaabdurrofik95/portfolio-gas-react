const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const categoriesFallback = `const fallbackCategories = ['Web & Otomasi', 'Algorithmic Trading', 'IoT & Hardware'];\n`;

// insert fallbacks
code = code.replace("const fallbackPortfolios = [", categoriesFallback + "\nconst fallbackPortfolios = [");

// Add /api/categories endpoints
const categoryEndpoints = `
app.get('/api/categories', async (req, res) => {
  try {
    const response = await fetch(\`\${GAS_URL}?action=getCategories\`);
    if (!response.ok) throw new Error('Failed to fetch from GAS');
    const text = await response.text();
    if (text.trim().startsWith('<')) {
      return res.json(fallbackCategories);
    }
    const data = JSON.parse(text);
    res.json(Array.isArray(data) ? data : fallbackCategories);
  } catch (error) {
    res.json(fallbackCategories);
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'saveCategories',
        categories: req.body.categories || req.body
      })
    });
    const text = await response.text();
    if (text.trim().startsWith('<')) throw new Error('GAS returned HTML (Not updated)');
    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save categories.' });
  }
});
`;

code = code.replace("app.get('/api/portfolios', async (req, res) => {", categoryEndpoints + "\napp.get('/api/portfolios', async (req, res) => {");

fs.writeFileSync('server.ts', code);
