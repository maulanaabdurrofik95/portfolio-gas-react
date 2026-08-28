const fs = require('fs');

let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Add categories to useGAS destructuring
code = code.replace("const { portfolios, menus, settings, loading, fetchAll, savePortfolio, saveMenus } = useGAS();",
"const { portfolios, menus, categories, settings, loading, fetchAll, savePortfolio, deletePortfolio, saveCategories, saveMenus } = useGAS();");

// 2. Add Edit state for portfolios
code = code.replace("const [isSubmitting, setIsSubmitting] = useState(false);",
`const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | number | null>(null);

  // Category State
  const [newCategory, setNewCategory] = useState('');
  const [catMessage, setCatMessage] = useState('');`);

// 3. Update handleSubmit for portfolios
const newHandleSubmit = `
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
`;
code = code.replace(/const handleSubmit = async.*?};/s, newHandleSubmit);

// 4. Update the select options to use dynamic categories
code = code.replace(/\{CATEGORIES\.filter[^\}]+\}\)/s, 
`{categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}`);

// 5. Inject Categories UI and Portfolios List UI before the portfolio form
const newUI = `
        {/* Manage Categories */}
        <div className="mt-20 mb-10 pb-6">
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
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium">{cat}</span>
                <button onClick={() => handleDeleteCategory(cat)} className="text-rose-500 hover:text-rose-600 transition-colors">
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
                <button onClick={() => handleEditPortfolio(p)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeletePortfolio(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {portfolios.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Belum ada portofolio.</p>}
        </div>
        
        <div className="mb-10 pb-6" id="portfolio-form">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2 block ml-1">Portfolio Entry</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{editingPortfolioId ? 'Edit Portofolio' : 'Add New Portfolio'}</h2>
          {editingPortfolioId && (
            <button onClick={() => { setEditingPortfolioId(null); setTitle(''); setCategory(''); setDescription(''); setImageBase64(''); }} className="mt-4 text-xs font-bold text-rose-500 hover:text-rose-600 uppercase">
              Cancel Edit
            </button>
          )}
        </div>
`;

code = code.replace(/<div className="mt-20 mb-10 pb-6">\s*<span className="text-\[10px\].*?Add New Portfolio.*?<\/h2>\s*<\/div>/s, newUI);

fs.writeFileSync('src/pages/Admin.tsx', code);
