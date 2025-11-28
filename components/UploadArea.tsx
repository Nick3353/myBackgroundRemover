import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const validFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
    // Reset input value to allow selecting same files again
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div 
      className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100 cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        multiple 
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleFileInput}
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className={`
          p-4 rounded-full mb-4 transition-transform duration-300
          ${isDragging ? 'bg-indigo-500/20 text-indigo-400 scale-110' : 'bg-zinc-800 text-zinc-400'}
        `}>
          {isProcessing ? (
             <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
             <UploadCloud className="w-8 h-8" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">
          {isDragging ? 'Drop images here' : 'Click or drag images to upload'}
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Support for PNG, JPG, JPEG, WEBP.
          <br />
          Batch processing supported.
        </p>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-700 rounded-tl-lg m-2 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-700 rounded-tr-lg m-2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-700 rounded-bl-lg m-2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700 rounded-br-lg m-2 pointer-events-none"></div>
    </div>
  );
};

export default UploadArea;