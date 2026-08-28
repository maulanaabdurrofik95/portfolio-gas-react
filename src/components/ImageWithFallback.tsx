import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIconSize?: number;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackIconSize = 48,
  ...props 
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden ${className || ''}`}>
      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse">
          <ImageIcon className="text-slate-300 dark:text-slate-600 animate-bounce" size={fallbackIconSize} />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 p-4 text-center">
          <ImageIcon size={fallbackIconSize} className="mb-2 opacity-50" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Image Unavailable</span>
        </div>
      )}

      {/* Actual Image */}
      {src && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}
