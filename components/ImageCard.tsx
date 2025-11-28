import React, { memo } from 'react';
import { Download, X, AlertCircle, CheckCircle2, Loader2, ArrowRightLeft } from 'lucide-react';
import { ProcessedImage } from '../types';

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
  onDownload: (image: ProcessedImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = memo(({ image, onRemove, onDownload }) => {
  // Determine status color/icon
  const getStatusIndicator = () => {
    switch (image.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-transparent opacity-50" />;
    }
  };

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow-md">
      {/* Remove Button */}
      <button 
        onClick={() => onRemove(image.id)}
        className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
        title="Remove"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Image Display Area */}
      <div className="aspect-[4/3] w-full relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-zinc-950/50">
        {/* Checkerboard background for transparency visualization */}
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `linear-gradient(45deg, #3f3f46 25%, transparent 25%), 
                                 linear-gradient(-45deg, #3f3f46 25%, transparent 25%), 
                                 linear-gradient(45deg, transparent 75%, #3f3f46 75%), 
                                 linear-gradient(-45deg, transparent 75%, #3f3f46 75%)`,
               backgroundSize: '20px 20px',
               backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
             }} 
        />
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {image.status === 'completed' && image.processedPreviewUrl ? (
            <img 
              src={image.processedPreviewUrl} 
              alt="Processed" 
              className="max-w-full max-h-full object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-300"
            />
          ) : (
            <img 
              src={image.originalPreviewUrl} 
              alt="Original" 
              className={`max-w-full max-h-full object-contain ${image.status === 'processing' ? 'opacity-50 blur-sm scale-95' : ''} transition-all duration-500`} 
            />
          )}
        </div>

        {/* Processing Overlay */}
        {image.status === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div className="relative">
               <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <ZapIcon className="w-4 h-4 text-indigo-400 fill-indigo-400" />
               </div>
            </div>
            <span className="mt-3 text-sm font-medium text-white shadow-black drop-shadow-md">Refining Edges...</span>
          </div>
        )}

         {/* Error Overlay */}
         {image.status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm text-red-200">{image.errorMessage || 'Failed to process'}</p>
          </div>
        )}
      </div>

      {/* Details Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2 overflow-hidden">
              {getStatusIndicator()}
              <span className="text-sm font-medium text-zinc-300 truncate max-w-[120px]" title={image.file.name}>
                {image.file.name}
              </span>
           </div>
           <span className="text-xs text-zinc-500 font-mono">
              {(image.file.size / 1024).toFixed(0)}KB
           </span>
        </div>

        <div className="flex gap-2 mt-3">
          <button 
             onClick={() => onDownload(image)}
             disabled={image.status !== 'completed'}
             className={`
               flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all
               ${image.status === 'completed' 
                 ? 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5' 
                 : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
             `}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
});

// Helper component for the processing animation
const ZapIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default ImageCard;