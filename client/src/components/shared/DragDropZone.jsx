import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';

export default function DragDropZone({ accept, onFile, file, onClear, label }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFile(acceptedFiles[0]);
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  if (file) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <File className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          aria-label="Remove file"
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all
        ${isDragActive
          ? 'border-primary/50 bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDragActive ? 'bg-primary/15' : 'bg-muted'}`}>
        <Upload className={`w-5 h-5 ${isDragActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/80">
          {isDragActive ? 'Drop file here' : 'Drag & drop, or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}
