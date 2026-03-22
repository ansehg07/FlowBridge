import { useState, useEffect } from 'react';
import { useConversion } from '../../context/ConversionContext';
import { convertText } from '../../api/client';
import { SAMPLE_IFRS } from '../../utils/constants';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

export default function TextPasteInput({ onConvert }) {
  const [text, setText] = useState('');
  const [showSampleHint, setShowSampleHint] = useState(false);
  const { direction, currency, setResult, setLoading, setError, setRawText, loading } = useConversion();

  useEffect(() => {
    setShowSampleHint(!localStorage.getItem('flowbridge_sample_seen'));
  }, []);

  const handleLoadSample = () => {
    setText(SAMPLE_IFRS);
    setShowSampleHint(false);
    localStorage.setItem('flowbridge_sample_seen', '1');
  };

  const handleConvert = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setRawText(text);
    try {
      const data = await convertText(text, direction, currency);
      setResult(data);
      onConvert?.(data, text);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="flex items-center justify-between">
        <label htmlFor="cash-flow-text" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Paste cash flow statement
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLoadSample}
          className="relative"
        >
          {showSampleHint && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
            </span>
          )}
          Load sample
        </Button>
      </div>

      <Textarea
        id="cash-flow-text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste your cash flow statement here...

Example:
CASH FLOWS FROM OPERATING ACTIVITIES
Net income                          125,000
Depreciation                         32,000
..."
        className="min-h-[300px] font-mono"
      />

      <Button
        variant="default"
        onClick={handleConvert}
        disabled={!text.trim() || loading}
        size="lg"
        className="w-full"
      >
        Convert Statement
      </Button>
    </div>
  );
}
