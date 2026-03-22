import { useState } from 'react';
import { useConversion } from '../../context/ConversionContext';
import { convertFile } from '../../api/client';
import DragDropZone from '../shared/DragDropZone';
import { Button } from '../ui/button';

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
};

function detectInputType(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'excel';
  if (name.endsWith('.csv')) return 'csv';
  return 'pdf';
}

export default function FileUploadInput({ onConvert }) {
  const [file, setFile] = useState(null);
  const { direction, currency, setResult, setLoading, setError, setRawText, loading } = useConversion();

  const handleConvert = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const inputType = detectInputType(file);
      const data = await convertFile(file, inputType, direction, currency);
      setResult(data);
      setRawText(data.rawExtractedText || '');
      onConvert?.(data, data.rawExtractedText || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Upload PDF, Excel, or CSV file
      </label>

      <DragDropZone
        accept={ACCEPT}
        onFile={setFile}
        file={file}
        onClear={() => setFile(null)}
        label="Drop a PDF, XLSX, or CSV file here"
      />

      <Button
        variant="default"
        onClick={handleConvert}
        disabled={!file || loading}
        size="lg"
        className="w-full"
      >
        Convert Statement
      </Button>
    </div>
  );
}
