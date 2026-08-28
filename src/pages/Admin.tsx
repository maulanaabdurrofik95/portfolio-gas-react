import { useState, useEffect } from 'react';
import { Menu, Portfolio } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Trash2, Edit2, X, FolderKanban, Layers, Activity } from 'lucide-react';
import { useGAS } from '../hooks/useGAS';

const ADMIN_PASSWORD = 'M@r11091995';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const { portfolios, menus, loading, fetchAll, savePortfolio, saveMenus, setMenus } = useGAS();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to first actual category
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | number | null>(null);

  // Category State
  const [newCategory, setNewCategory] = useState('');
  const [catMessage, setCatMessage] = useState('');
  const [message, setMessage] = useState('');

  // Menus State
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuLink, setNewMenuLink] = useState('');
  const [menuMessage, setMenuMessage] = useState('');

  // Settings State
  const [gasUrl, setGasUrl] = useState('');
  const [landingTitle, setLandingTitle] = useState('');
  const [landingDescription, setLandingDescription] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    fetchAll();
    
    fetch('/api/settings').then(res => res.json())
      .then(settingsData => {
        if (settingsData) {
          if (settingsData.gasUrl) setGasUrl(settingsData.gasUrl);
          if (settingsData.landingTitle) setLandingTitle(settingsData.landingTitle);
          if (settingsData.landingDescription) setLandingDescription(settingsData.landingDescription);
        }
      }).catch(console.error);
  }, [fetchAll]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl, landingTitle, landingDescription })
      });
      if (!res.ok) throw new Error('Failed to update settings');
      setSettingsMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err) {
      setSettingsMessage('Error: Gagal menyimpan pengaturan.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuth', 'true');
      setLoginError('');
    } else {
      setLoginError('Password salah.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description) {
      setMessage('Judul, Kategori, dan Deskripsi wajib diisi.');
      return;
    }
    
    if (!editingPortfolioId && !imageBase64) {
      setMessage('Gambar wajib diisi untuk portofolio baru.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    
    try {
      await savePortfolio(editingPortfolioId, title, category, description, imageBase64);
      setMessage(editingPortfolioId ? 'Portofolio berhasil diperbarui!' : 'Portofolio berhasil ditambahkan!');
      if (!editingPortfolioId) {
        setTitle('');
        setCategory('');
        setDescription('');
        setImageBase64('');
      } else {
        setEditingPortfolioId(null);
        setTitle('');
        setCategory('');
        setDescription('');
        setImageBase64('');
      }
    } catch (error: any) {
      setMessage(error.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPortfolio = (p: any) => {
    setEditingPortfolioId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setImageBase64(''); // Do not load the URL as base64, keep it empty so we know not to overwrite unless they pick a new one
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePortfolio = async (id: string | number) => {
    if (!confirm('Yakin ingin menghapus portofolio ini?')) return;
    try {
      await deletePortfolio(id);
      setMessage('Portofolio dihapus');
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory) return;
    const updated = [...categories, newCategory];
    try {
      await saveCategories(updated);
      setNewCategory('');
      setCatMessage('Kategori ditambahkan!');
      setTimeout(() => setCatMessage(''), 3000);
    } catch(e) {}
  };

  const handleDeleteCategory = async (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    try {
      await saveCategories(updated);
    } catch(e) {}
  };


  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  
  const saveMenusLocal = async (updatedMenus: Menu[]) => {
    try {
      await saveMenus(updatedMenus);
      setMenuMessage('Menu berhasil diperbarui!');
      setTimeout(() => setMenuMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update menus');
    }
  };

  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel || !newMenuLink) return;
    const updatedMenus: Menu[] = [...menus, { id: Date.now(), label: newMenuLabel, link: newMenuLink, type: 'custom', content: '' }];
    saveMenusLocal(updatedMenus);
    setNewMenuLabel('');
    setNewMenuLink('');
  };

  const handleDeleteMenu = (id: string | number) => {
    const updatedMenus = menus.filter(m => m.id !== id);
    saveMenusLocal(updatedMenus);
  };

  const handleUpdateMenuContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;
    const updatedMenus = menus.map(m => m.id === editingMenu.id ? editingMenu : m);
    saveMenusLocal(updatedMenus);
    setEditingMenu(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100 via-purple-50/50 to-sky-100 dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-slate-50 min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-500 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="w-full max-w-md border border-white/50 dark:border-slate-800/50 p-10 md:p-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-indigo-500/5 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-8 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-8 text-center bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Admin Gateway</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Secure Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 font-medium transition-all"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-rose-500 text-[10px] uppercase tracking-widest font-bold text-center bg-rose-50 dark:bg-rose-500/10 py-2 rounded-lg">{loginError}</p>}
            <button 
              type="submit"
              className="w-full p-3.5 md:p-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 rounded-2xl shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
            >
              Access System
            </button>
          </form>
          <div className="mt-8 text-center pt-6">
            <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">← Return to Portfolio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-purple-50/50 to-sky-100 dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-950 dark:text-slate-50 min-h-screen pb-20 font-sans transition-colors duration-500 relative">
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-purple-300/30 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[400px] bg-sky-300/30 dark:bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <header className="h-20 md:h-24 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center px-6 md:px-12 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight mt-0.5 hidden md:block">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6 bg-white/70 dark:bg-slate-900/70 py-2 px-4 rounded-full border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-sm">
          <ThemeToggle />
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700"></div>
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
            View Site
          </Link>
          <button 
            onClick={() => {
              sessionStorage.removeItem('isAdminAuth');
              setIsAuthenticated(false);
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-full"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-6 md:px-12 py-12 max-w-4xl mx-auto relative z-10">
        {/* Dashboard Stats */}
        <div className="mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Overview</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">System Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Projects</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{portfolios.length}</p>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-6">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Categories</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{categories.length}</p>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-6">
              <div className="w-14 h-14 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Interactions</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{(portfolios.length * 142) + 854}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Integration Settings</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">API Configuration</h2>
          
          <form onSubmit={handleSaveSettings} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none">
            {settingsMessage && (
              <div className={`p-4 mb-6 rounded-2xl font-medium text-sm flex items-center gap-3 shadow-sm ${settingsMessage.includes('berhasil') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                <div className={`w-2 h-2 rounded-full ${settingsMessage.includes('berhasil') ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                {settingsMessage}
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Landing Page Title</label>
              <textarea 
                value={landingTitle}
                onChange={(e) => setLandingTitle(e.target.value)}
                placeholder="MAULANA\nABDUR\nROFIK"
                rows={3}
                className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-sm transition-all resize-none"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Landing Page Description</label>
              <textarea 
                value={landingDescription}
                onChange={(e) => setLandingDescription(e.target.value)}
                placeholder="Membangun solusi perangkat lunak..."
                rows={3}
                className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-sm transition-all resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Google Apps Script Web App URL</label>
              <input 
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm transition-all"
              />
              <p className="text-xs text-slate-500 mt-3 ml-2">Masukkan URL hasil Deploy Google Apps Script untuk menghubungkan React Frontend ke Google Sheets Anda.</p>
            </div>
            
            <button 
              type="submit"
              disabled={isSavingSettings}
              className={`w-full md:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-indigo-600 text-white font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-indigo-500/25 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSavingSettings ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN'}
            </button>
          </form>
        </div>

        
        {/* Manage Categories */}
        <div className="mb-10 pb-6 mt-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Categories</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Manage Categories</h2>
        </div>
        
        {catMessage && (
          <div className="p-4 mb-8 rounded-2xl font-medium text-sm flex items-center gap-3 shadow-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            {catMessage}
          </div>
        )}
        
        <div className="space-y-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="flex flex-wrap gap-4 mb-8">
            {categories.map((cat: string) => (
              <div key={cat} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium">{cat}</span>
                <button type="button" onClick={() => handleDeleteCategory(cat)} className="text-rose-500 hover:text-rose-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-slate-500">Belum ada kategori.</p>}
          </div>
          
          <form onSubmit={handleAddCategory} className="flex gap-4">
            <input 
              type="text" 
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Nama Kategori Baru"
              className="flex-1 p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium"
            />
            <button type="submit" className="px-6 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-colors">
              Add
            </button>
          </form>
        </div>

        {/* Portfolios List */}
        <div className="mt-20 mb-10 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Portfolios</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Daftar Portofolio</h2>
        </div>
        
        <div className="space-y-4 mb-14 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none">
          {portfolios.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <img src={p.imageUrl} alt={p.title} className="w-16 h-16 object-cover rounded-xl" />
                <div>
                  <h4 className="font-bold text-sm">{p.title}</h4>
                  <p className="text-xs text-slate-500">{p.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleEditPortfolio(p)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => handleDeletePortfolio(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {portfolios.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Belum ada portofolio.</p>}
        </div>
        
        <div className="mb-10 pb-6" id="portfolio-form">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Portfolio Entry</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-4">
             {editingPortfolioId ? 'Edit Portofolio' : 'Add New Portfolio'}
             {editingPortfolioId && (
               <button type="button" onClick={() => { setEditingPortfolioId(null); setTitle(''); setCategory(''); setDescription(''); setImageBase64(''); }} className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full dark:bg-rose-500/10">
                 Cancel Edit
               </button>
             )}
          </h2>
        </div>

        
        {message && (
          <div className={`p-4 mb-8 rounded-2xl font-medium text-sm flex items-center gap-3 shadow-sm ${message.includes('berhasil') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${message.includes('berhasil') ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Judul Proyek</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all"
                placeholder="Ex: Smart Home App..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Kategori</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none font-medium transition-all"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-[10px] opacity-50">▼</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Deskripsi Singkat</label>
            <textarea 
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-medium transition-all"
              placeholder="Jelaskan secara singkat mengenai proyek ini..."
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Gambar Cover (Max 5MB)</label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 p-10 rounded-[24px] text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors group cursor-pointer">
              <input 
                type="file" 
                id="image"
                accept="image/*"
                required={!imageBase64}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {!imageBase64 ? (
                <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="text-2xl text-indigo-500">+</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-50 mb-1">Upload File Image</p>
                    <p className="text-[10px] text-slate-500 font-medium">JPG, PNG, WEBP up to 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative pointer-events-none rounded-xl overflow-hidden">
                  <img src={imageBase64} alt="Preview" className="w-full max-h-72 object-cover rounded-xl shadow-md" />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    Preview
                  </div>
                </div>
              )}
            </div>
            {imageBase64 && (
              <p className="text-right mt-3 text-[10px] font-medium text-slate-500 ml-1">Klik area gambar untuk mengganti</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3.5 md:p-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 disabled:opacity-50 mt-4 rounded-2xl shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
          >
            {isSubmitting ? 'PROCESSING...' : 'UPLOAD PORTFOLIO'}
          </button>
        </form>

        {/* Page Contents Editor */}
        <div className="mt-20 mb-10 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Content Management</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Edit Pages Content</h2>
        </div>

        <div className="space-y-8">
          {menus.filter(m => m.type === 'custom').length === 0 && (
            <p className="text-sm text-slate-500">Belum ada halaman kustom.</p>
          )}
          {menus.filter(m => m.type === 'custom').map(menu => (
            <form key={menu.id} onSubmit={(e) => {
              e.preventDefault();
              saveMenusLocal(menus);
            }} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white">{menu.label} Page</h3>
              </div>
              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Konten Markdown</label>
                <textarea 
                  rows={8}
                  value={menu.content || ''}
                  onChange={(e) => {
                    const updated = menus.map(m => m.id === menu.id ? { ...m, content: e.target.value } : m);
                    setMenus(updated);
                  }}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm transition-all resize-y"
                />
              </div>
              <button 
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-indigo-600 text-white font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-indigo-500/25"
              >
                Save {menu.label} Content
              </button>
            </form>
          ))}
        </div>

        <div className="mt-20 mb-10 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Navigation</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Manage Menus</h2>
        </div>

        {menuMessage && (
          <div className="p-4 mb-8 rounded-2xl font-medium text-sm flex items-center gap-3 shadow-sm bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            {menuMessage}
          </div>
        )}

        <div className="space-y-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-white dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="space-y-4 mb-8">
            {menus.map((menu) => (
              <div key={menu.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div>
                  <h4 className="font-bold text-sm">{menu.label}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">{menu.link}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingMenu(menu)}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {menus.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada menu, silakan tambahkan.</p>
            )}
          </div>

          <form onSubmit={handleAddMenu} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <input 
                type="text" 
                value={newMenuLabel}
                onChange={(e) => setNewMenuLabel(e.target.value)}
                placeholder="Menu Label (e.g. ABOUT)"
                className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all text-sm uppercase"
              />
            </div>
            <div className="md:col-span-5">
              <input 
                type="text" 
                value={newMenuLink}
                onChange={(e) => setNewMenuLink(e.target.value)}
                placeholder="Link URL (e.g. #about)"
                className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono transition-all text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <button 
                type="submit"
                className="w-full h-full p-3.5 md:p-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 rounded-2xl shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                Add Menu
              </button>
            </div>
          </form>
        </div>

        {/* Edit Menu Modal */}
        {editingMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-slate-700/50 relative">
              <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Menu: {editingMenu.label}</h3>
                <button 
                  onClick={() => setEditingMenu(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                <form id="editMenuForm" onSubmit={handleUpdateMenuContent} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Menu Label</label>
                    <input 
                      type="text" 
                      value={editingMenu.label}
                      onChange={(e) => setEditingMenu({...editingMenu, label: e.target.value})}
                      className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Menu Link URL</label>
                    <input 
                      type="text" 
                      value={editingMenu.link}
                      onChange={(e) => setEditingMenu({...editingMenu, link: e.target.value})}
                      className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Tipe Halaman</label>
                    <div className="relative">
                      <select 
                        value={editingMenu.type || 'custom'}
                        onChange={(e) => setEditingMenu({...editingMenu, type: e.target.value as 'portfolio' | 'custom'})}
                        className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none font-medium transition-all"
                      >
                        <option value="portfolio">Grid Portofolio (Default)</option>
                        <option value="custom">Halaman Kustom (Markdown)</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <span className="text-[10px] opacity-50">▼</span>
                      </div>
                    </div>
                  </div>
                  
                  {editingMenu.type !== 'portfolio' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500 ml-1">Konten Halaman (Markdown Support)</label>
                      <textarea 
                        rows={10}
                        value={editingMenu.content || ''}
                        onChange={(e) => setEditingMenu({...editingMenu, content: e.target.value})}
                        className="w-full p-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm transition-all resize-y"
                        placeholder="# Judul Halaman&#10;&#10;Isi konten dengan format markdown disini..."
                      ></textarea>
                    </div>
                  )}
                </form>
              </div>
              <div className="p-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit"
                  form="editMenuForm"
                  className="w-full p-3.5 md:p-4 bg-indigo-600 text-white font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-indigo-500/25"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
