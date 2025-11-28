import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ImageCard from './components/ImageCard';
import { ProcessedImage, ProcessingStats } from './types';
import { generateId, fileToBase64, getImageDimensions, downloadImage } from './utils/fileHelpers';
import { removeBackgroundWithGemini } from './services/geminiService';
import { Play, Trash2, DownloadCloud, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);

  // Statistics
  const stats: ProcessingStats = useMemo(() => {
    return images.reduce(
      (acc, img) => {
        acc.total++;
        if (img.status === 'completed') acc.completed++;
        if (img.status === 'error') acc.failed++;
        if (img.status === 'processing') acc.processing++;
        return acc;
      },
      { total: 0, completed: 0, failed: 0, processing: 0 }
    );
  }, [images]);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newImages: ProcessedImage[] = await Promise.all(
      files.map(async (file) => {
        const dimensions = await getImageDimensions(file);
        return {
          id: generateId(),
          file,
          originalPreviewUrl: URL.createObjectURL(file),
          processedPreviewUrl: null,
          status: 'idle',
          originalWidth: dimensions.width,
          originalHeight: dimensions.height,
        };
      })
    );
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.originalPreviewUrl);
        if (target.processedPreviewUrl) URL.revokeObjectURL(target.processedPreviewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalPreviewUrl);
      if (img.processedPreviewUrl) URL.revokeObjectURL(img.processedPreviewUrl);
    });
    setImages([]);
  }, [images]);

  const processImage = async (image: ProcessedImage) => {
    // Skip if already completed or currently processing
    if (image.status === 'completed' || image.status === 'processing') return;

    // Update status to processing
    setImages((prev) =>
      prev.map((img) => (img.id === image.id ? { ...img, status: 'processing', errorMessage: undefined } : img))
    );

    try {
      const base64 = await fileToBase64(image.file);
      const processedBase64 = await removeBackgroundWithGemini(base64, image.file.type);
      
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, status: 'completed', processedPreviewUrl: processedBase64 }
            : img
        )
      );
    } catch (error: any) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, status: 'error', errorMessage: error.message || 'Processing failed' }
            : img
        )
      );
    }
  };

  const handleProcessAll = async () => {
    setIsGlobalProcessing(true);
    const idleImages = images.filter((img) => img.status === 'idle' || img.status === 'error');
    
    // Process 3 at a time to avoid heavy rate limiting issues, though Gemini has high limits.
    const CONCURRENCY_LIMIT = 3;
    
    for (let i = 0; i < idleImages.length; i += CONCURRENCY_LIMIT) {
        const batch = idleImages.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(batch.map((img) => processImage(img)));
    }
    
    setIsGlobalProcessing(false);
  };

  const handleDownload = useCallback((image: ProcessedImage) => {
    if (image.processedPreviewUrl) {
      const filename = `clearcut_${image.file.name.split('.')[0]}.png`;
      downloadImage(image.processedPreviewUrl, filename);
    }
  }, []);

  const handleDownloadAll = useCallback(() => {
    const completedImages = images.filter(img => img.status === 'completed');
    let delay = 0;
    completedImages.forEach((img) => {
        setTimeout(() => {
             handleDownload(img);
        }, delay);
        delay += 500; // Stagger downloads slightly
    });
  }, [images, handleDownload]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="w-full md:w-auto">
                <h2 className="text-2xl font-bold text-white mb-1">Your Workflow</h2>
                <p className="text-zinc-400 text-sm">
                    {stats.total === 0 ? 'Upload images to get started' : `${stats.total} images loaded • ${stats.completed} processed`}
                </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                {stats.total > 0 && (
                    <>
                        <button 
                            onClick={handleClearAll}
                            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                            disabled={isGlobalProcessing}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Clear All</span>
                        </button>

                         <button 
                            onClick={handleDownloadAll}
                            disabled={stats.completed === 0 || isGlobalProcessing}
                            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 border border-zinc-700"
                        >
                            <DownloadCloud className="w-4 h-4" />
                            <span className="hidden sm:inline">Download All</span>
                        </button>

                        <button 
                            onClick={handleProcessAll}
                            disabled={isGlobalProcessing || (stats.total === stats.completed)}
                            className={`
                                px-6 py-2 text-sm font-bold text-white rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20
                                ${isGlobalProcessing || (stats.total === stats.completed && stats.total > 0)
                                    ? 'bg-zinc-700 cursor-not-allowed opacity-75' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95'
                                }
                            `}
                        >
                            <Play className={`w-4 h-4 ${isGlobalProcessing ? 'hidden' : 'block'}`} />
                            {isGlobalProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                "Process Batch"
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* Upload Area */}
        {images.length === 0 && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <UploadArea onFilesSelected={handleFilesSelected} isProcessing={isGlobalProcessing} />
            </div>
        )}

        {/* Floating Upload Button (Small) when images exist */}
        {images.length > 0 && (
             <div className="mb-8">
                 <UploadArea onFilesSelected={handleFilesSelected} isProcessing={isGlobalProcessing} />
             </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {images.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                onRemove={handleRemoveImage}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {/* Empty State / Guidelines */}
        {images.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-zinc-400">
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-white">1</div>
                    <h3 className="text-white font-medium mb-2">Upload Photos</h3>
                    <p className="text-sm">Drag and drop your product photos, portraits, or objects. Supports JPG, PNG, WEBP.</p>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-white">2</div>
                    <h3 className="text-white font-medium mb-2">AI Processing</h3>
                    <p className="text-sm">Our advanced vision model detects subjects and precisely removes backgrounds in seconds.</p>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-white">3</div>
                    <h3 className="text-white font-medium mb-2">Download Results</h3>
                    <p className="text-sm">Get clean, transparent PNGs ready for your e-commerce store or design project.</p>
                </div>
            </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-zinc-600 text-sm">
                Powered by Google Gemini 2.5 Flash Vision. 
                <br className="sm:hidden" />
                Images are processed in memory and not stored.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;