import { motion } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { Portfolio } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface PortfolioModalProps {
  portfolio: Portfolio;
  onClose: () => void;
}

const getValidImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    const id = url.split('id=')[1];
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }
  return url;
};

export function PortfolioModal({ portfolio, onClose }: PortfolioModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] border border-white/20 dark:border-slate-700/50 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 dark:text-white transition-colors shadow-md"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        
        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 relative shrink-0">
          <ImageWithFallback src={getValidImageUrl(portfolio.imageUrl)} alt={portfolio.title} referrerPolicy="no-referrer" />
        </div>
        
        <div className="p-5 md:p-8 overflow-y-auto flex-1">
          <div className="inline-block bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 md:mb-4">
            {portfolio.category}
          </div>
          
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 text-slate-900 dark:text-white">
            {portfolio.title}
          </h2>
          
          <div className="prose prose-slate dark:prose-invert max-w-none mb-6 md:mb-8">
            <p className="text-sm md:text-lg text-slate-700 dark:text-slate-300 leading-[1.6] md:leading-[1.8] font-medium whitespace-pre-wrap">
              {portfolio.description}
            </p>
          </div>
          
          {portfolio.techStack && portfolio.techStack.length > 0 && (
            <div className="mb-6 md:mb-10 p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 md:mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2 md:gap-2.5">
                {portfolio.techStack.map(tech => (
                  <span key={tech} className="px-2.5 py-1 md:px-3 md:py-1.5 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] md:text-[11px] font-bold uppercase tracking-wide border border-indigo-100 dark:border-indigo-500/20 shadow-sm shadow-indigo-500/5">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <a
            href={`https://wa.me/6285287411177?text=Halo%20Pak%20Maulana,%20saya%20ingin%20konsultasi%20mengenai%20${encodeURIComponent(portfolio.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-indigo-600 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl border border-indigo-700 border-b-[3px] shadow-[0_4px_20px_-4px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all active:border-b active:translate-y-[2px]"
          >
            Consult Now
            <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
