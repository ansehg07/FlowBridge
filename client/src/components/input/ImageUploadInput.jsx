import { useState, useEffect } from 'react';
import { ScanLine } from 'lucide-react';
import { useConversion } from '../../context/ConversionContext';
import { convertFile } from '../../api/client';
import DragDropZone from '../shared/DragDropZone';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

const ACCEPT = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tiff', '.tif'],
  'image/bmp': ['.bmp'],
};

export default function ImageUploadInput({ onConvert }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { direction, currency, setResult, setLoading, setError, setRawText, loading } = useConversion();

  // Revoke object URL on unmount or when preview changes to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (f) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleClear = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleConvert = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await convertFile(file, 'image', direction, currency);
      setResult(data);
      setRawText(data.rawExtractedText || '');
      onConvert?.(data, data.rawExtractedText || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'OCR processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Upload image of cash flow statement
      </p>

      <DragDropZone
        accept={ACCEPT}
        onFile={handleFile}
        file={file}
        onClear={handleClear}
        label="Drop a PNG, JPG, or TIFF image here"
      />

      {preview && (
        <div className="rounded-xl overflow-hidden border border-border max-h-40 bg-muted">
          <img
            src={preview}
            alt={file ? `Preview of ${file.name}` : 'Uploaded image preview'}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <Alert variant="default" className="border-border bg-muted/60 text-muted-foreground">
        <ScanLine className="h-4 w-4" />
        <AlertDescription>
          OCR works best with clear, high-resolution images of printed documents.
        </AlertDescription>
      </Alert>

      <Button
        variant="default"
        onClick={handleConvert}
        disabled={!file || loading}
        size="lg"
        className="w-full"
      >
        Extract &amp; Convert
      </Button>
    </div>
  );
}
