import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
app.use(express.json({ limit: '50mb' }));

const CONFIG_PATH = path.join(process.cwd(), 'config.json');
let GAS_URL = 'https://script.google.com/macros/s/AKfycbxx1jr54BQRloOSbvpCtqzKygUKl4LgE_vgbjay9IMrMxx6f5vMDr8QtGyqTxzw5Q5I6A/exec';
let landingTitle = 'MAULANA\nABDUR\nROFIK';
let landingDescription = 'Membangun solusi perangkat lunak yang tidak hanya indah dipandang, tetapi juga memiliki performa tinggi dan logika bisnis yang kuat.';

// Load initial config
if (fs.existsSync(CONFIG_PATH)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    if (config.gasUrl) GAS_URL = config.gasUrl;
    if (config.landingTitle) landingTitle = config.landingTitle;
    if (config.landingDescription) landingDescription = config.landingDescription;
  } catch (e) {
    console.error('Error reading config:', e);
  }
}

// API to update settings
app.get('/api/settings', (req, res) => {
  res.json({ gasUrl: GAS_URL, landingTitle, landingDescription });
});

app.post('/api/settings', (req, res) => {
  if (req.body.gasUrl !== undefined) {
    GAS_URL = req.body.gasUrl;
  }
  if (req.body.landingTitle !== undefined) {
    landingTitle = req.body.landingTitle;
  }
  if (req.body.landingDescription !== undefined) {
    landingDescription = req.body.landingDescription;
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ gasUrl: GAS_URL, landingTitle, landingDescription }));
  res.json({ success: true, gasUrl: GAS_URL, landingTitle, landingDescription });
});

// Mock data fallbacks to keep the app running if GAS isn't configured yet
const fallbackPortfolios = [
  {
    id: 1,
    title: 'Sistem Manajemen Inventaris',
    category: 'Web & Otomasi',
    description: 'Aplikasi berbasis web untuk melacak dan mengelola inventaris gudang secara realtime.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Bot Trading Crypto',
    category: 'Algorithmic Trading',
    description: 'Algoritma trading otomatis berbasis indikator teknikal dengan integrasi API Binance.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    techStack: ['Python', 'Pandas', 'Binance API', 'Docker'],
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Smart Home Hub',
    category: 'IoT & Hardware',
    description: 'Sistem kontrol perangkat elektronik rumah berbasis ESP32 dan protokol MQTT.',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800',
    techStack: ['C++', 'ESP32', 'MQTT', 'React Native'],
    createdAt: new Date().toISOString()
  }
];

const fallbackMenus = [
  { id: 1, label: 'PORTFOLIO', link: '#', type: 'portfolio', content: '' },
  { id: 2, label: 'SERVICES', link: '#services', type: 'custom', content: '## Layanan Kami\n\nKami menawarkan layanan profesional di bidang pengembangan web dan otomasi.' },
  { id: 3, label: 'CONTACT', link: '#contact', type: 'custom', content: '## Hubungi Kami\n\nSilakan email saya di maulanaadelzivana@gmail.com' }
];

// API Routes - Proxy to Google Apps Script
app.get('/api/portfolios', async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=getPortfolios`);
    if (!response.ok) throw new Error('Failed to fetch from GAS');
    const text = await response.text();
    
    // Check if response is HTML (meaning the GAS deployment isn't updated)
    if (text.trim().startsWith('<')) {
      console.warn('GAS returned HTML. Falling back to mock portfolios.');
      return res.json(fallbackPortfolios);
    }
    
    const data = JSON.parse(text);
    res.json(Array.isArray(data) ? data : fallbackPortfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.json(fallbackPortfolios);
  }
});

app.post('/api/portfolios', async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // Using text/plain avoids CORS preflight issues on GAS if called directly, but we are server-side anyway.
      body: JSON.stringify({
        action: 'savePortfolio',
        ...req.body
      })
    });
    const text = await response.text();
    if (text.trim().startsWith('<')) throw new Error('GAS returned HTML (Not updated)');
    const data = JSON.parse(text);
    if (data.success === false) {
      return res.status(400).json({ error: data.message || 'Failed to save portfolio in GAS' });
    }
    res.status(201).json(data);
  } catch (error) {
    console.error('Error saving portfolio:', error);
    res.status(500).json({ error: 'Failed to save portfolio. Make sure GAS is deployed as a NEW version.' });
  }
});

app.get('/api/menus', async (req, res) => {
  try {
    const response = await fetch(`${GAS_URL}?action=getMenus`);
    if (!response.ok) throw new Error('Failed to fetch from GAS');
    const text = await response.text();
    
    if (text.trim().startsWith('<')) {
      console.warn('GAS returned HTML. Falling back to mock menus.');
      return res.json(fallbackMenus);
    }
    
    const data = JSON.parse(text);
    res.json(Array.isArray(data) ? data : fallbackMenus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.json(fallbackMenus);
  }
});

app.post('/api/menus', async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'saveMenus',
        menus: req.body
      })
    });
    const text = await response.text();
    if (text.trim().startsWith('<')) throw new Error('GAS returned HTML (Not updated)');
    const data = JSON.parse(text);
    if (data.success === false) {
      return res.status(400).json({ error: data.message || 'Failed to save menus in GAS' });
    }
    res.json(req.body); // Return the menus back to update client state
  } catch (error) {
    console.error('Error saving menus:', error);
    res.status(500).json({ error: 'Failed to save menus. Make sure GAS is deployed as a NEW version.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
