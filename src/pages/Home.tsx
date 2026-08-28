import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Portfolio, Menu } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { ExternalLink, X, Menu as MenuIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { useGAS } from '../hooks/useGAS';

import { PortfolioModal } from '../components/PortfolioModal';
import { ImageWithFallback } from '../components/ImageWithFallback';

const getValidImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    const id = url.split('id=')[1];
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }
  return url;
};

export function Home() {
  const { portfolios, menus, categories, settings, loading, fetchAll } = useGAS();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayTitle = settings?.landingTitle || "MAULANA\nABDUR\nROFIK";
  const displayDescription = settings?.landingDescription || "Cerdas. Efisien. Terotomasi.";

  useEffect(() => {
    fetchAll().then(() => {
      // The hook updates the states. But we also need to set activeMenu.
    });
  }, [fetchAll]);

  useEffect(() => {
    if (menus.length > 0 && !activeMenu) {
      setActiveMenu(menus[0]);
    }
  }, [menus, activeMenu]);

  useEffect(() => {
    // Dynamic SEO Meta Tags Injection
    const baseTitle = displayTitle.replace(/\n/g, ' ') + " | Senior Developer";
    let dynamicTitle = baseTitle;
    
    if (activeMenu?.type === 'custom') {
      dynamicTitle = `${activeMenu.label} | ${baseTitle}`;
    } else if (activeCategory !== 'All') {
      dynamicTitle = `${activeCategory} Portfolio | ${baseTitle}`;
    }
    
    document.title = dynamicTitle;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    
    let descriptionText = displayDescription.replace(/\n/g, ' ');
    if (portfolios.length > 0) {
      const uniqueCategories = [...new Set(portfolios.map(p => p.category))].slice(0, 3).join(', ');
      descriptionText = `Explore ${portfolios.length} projects by ${displayTitle.replace(/\n/g, ' ')} in categories like ${uniqueCategories}. ${displayDescription.replace(/\n/g, ' ')}`;
    }
    metaDesc.setAttribute('content', descriptionText);

    // Update Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', dynamicTitle);

    // Update Open Graph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', descriptionText);

  }, [portfolios, activeCategory, activeMenu]);

  const filteredPortfolios = activeCategory === 'All' 
    ? portfolios 
    : portfolios.filter(p => p.category === activeCategory);

  return (
    <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-purple-50/50 to-sky-100 text-slate-900 min-h-screen flex flex-col md:flex-row md:h-screen md:overflow-hidden font-sans dark:from-slate-900 dark:via-slate-950 dark:to-black dark:text-slate-50 transition-colors duration-500 relative">
      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 w-[80%] max-w-sm h-screen bg-white dark:bg-slate-950 z-[101] p-6 shadow-2xl flex flex-col md:hidden border-r border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-bold tracking-widest text-xs uppercase text-slate-900 dark:text-white">Navigation</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col space-y-8">
                {menus.map((menu, index) => (
                  <button 
                    key={menu.id || index} 
                    onClick={() => {
                      setActiveMenu(menu);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${activeMenu?.id === menu.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'}`}
                  >
                    <span className={`h-[2px] rounded-full transition-all ${activeMenu?.id === menu.id ? 'w-8 bg-indigo-600 dark:bg-indigo-400' : 'w-4 bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-900 dark:group-hover:bg-slate-50 group-hover:w-8'}`}></span>
                    {menu.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-full md:w-[340px] md:h-screen md:sticky top-0 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between p-6 md:p-12 bg-white/40 dark:bg-slate-950/70 backdrop-blur-3xl shrink-0 z-20">
        <div>
          <div className="flex items-center justify-between mb-8 md:mb-16">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
                <span className="text-[10px] font-bold">M</span>
              </div>
              <span className="uppercase tracking-[0.2em] text-[10px] font-bold text-slate-500 dark:text-slate-400">Senior Developer</span>
            </div>
            <button 
              className="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 whitespace-pre-line">
            {displayTitle}
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-line">
            {displayDescription}
          </p>
          
          <nav className="mt-12 md:mt-16 flex-col space-y-6 hidden md:flex">
            {menus.map((menu, index) => (
              <button 
                key={menu.id || index} 
                onClick={() => setActiveMenu(menu)}
                className={`group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${activeMenu?.id === menu.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'}`}
              >
                <span className={`h-[2px] rounded-full transition-all ${activeMenu?.id === menu.id ? 'w-8 bg-indigo-600 dark:bg-indigo-400' : 'w-4 bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-900 dark:group-hover:bg-slate-50 group-hover:w-8'}`}></span>
                {menu.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="pt-6 md:pt-8 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center mt-8 md:mt-0">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            &copy; {new Date().getFullYear()} / ID
          </div>
          <Link 
            to="/admin" 
            className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-bold uppercase tracking-widest shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-slate-700 border-b-[3px] hover:bg-slate-50 dark:hover:bg-slate-800 active:border-b active:translate-y-[2px] transition-all"
          >
            Admin
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-[500px] md:h-screen relative z-10">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-purple-300/30 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[400px] bg-sky-300/30 dark:bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Header Filters */}
        <header className="h-auto md:h-24 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-6 md:py-0 shrink-0 gap-6 md:gap-0 bg-white/40 dark:bg-slate-950/30 backdrop-blur-3xl z-10">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 w-full md:w-auto">
            {(!activeMenu || activeMenu.type === 'portfolio') ? (
              ['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    activeCategory === cat 
                      ? 'bg-indigo-600 text-white border-indigo-700 border-b-[3px] active:border-b active:translate-y-[2px] shadow-sm dark:bg-indigo-500 dark:border-indigo-600' 
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700 border-b-[3px] active:border-b active:translate-y-[2px] backdrop-blur-sm'
                  }`}
                >
                  {cat}
                </button>
              ))
            ) : (
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white text-center md:text-left w-full md:w-auto">
                {activeMenu.label}
              </h2>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 bg-white/60 dark:bg-slate-800/50 p-1.5 pl-4 rounded-full backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 border-b-[3px] shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Section */}
        <section className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">Memuat data...</div>
            </div>
          ) : activeMenu?.type === 'custom' ? (
            <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 bg-white/60 dark:bg-slate-900/80 p-8 md:p-12 rounded-[32px] backdrop-blur-2xl border-2 border-white/80 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <Markdown>{activeMenu.content || ''}</Markdown>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto pb-12"
            >
              <AnimatePresence mode="popLayout">
                {filteredPortfolios.map((portfolio, index) => (
                  <motion.div
                    key={portfolio.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ 
                      delay: index * 0.05, 
                      type: "spring", 
                      stiffness: 350, 
                      damping: 25 
                    }}
                    onClick={() => setSelectedPortfolio(portfolio)}
                    className="group flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] border border-white dark:border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] m-2 rounded-[24px] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <ImageWithFallback 
                        src={getValidImageUrl(portfolio.imageUrl)} 
                        alt={portfolio.title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-50 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                        {portfolio.category}
                      </div>
                    </div>
                    <div className="p-6 pt-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold tracking-tight mb-2 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{portfolio.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow line-clamp-3">
                        {portfolio.description}
                      </p>
                      
                      <div className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 border-b-[3px] group-hover:bg-indigo-600 group-hover:border-indigo-700 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all duration-300 active:border-b active:translate-y-[2px]">
                        View Details
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedPortfolio && (
          <PortfolioModal
            portfolio={selectedPortfolio}
            onClose={() => setSelectedPortfolio(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}