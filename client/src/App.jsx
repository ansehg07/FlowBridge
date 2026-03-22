import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ConversionProvider, useConversion } from './context/ConversionContext';
import { useHistory } from './hooks/useHistory';
import { TooltipProvider } from './components/ui/tooltip';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import InputPanel from './components/input/InputPanel';
import OutputPanel from './components/output/OutputPanel';
import { convertText } from './api/client';
import { SAMPLE_IFRS } from './utils/constants';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { history, save, remove, clear } = useHistory();
  const { setResult, setDirection, setCurrency, setRawText, setLoading, setError } = useConversion();

  const handleConvert = (data, rawText) => {
    save({
      direction: data.conversion?.metadata?.sourceStandard === 'IFRS' ? 'ifrs-to-gaap' : 'gaap-to-ifrs',
      currency: data.conversion?.metadata?.currency || 'USD',
      rawText,
      confidence: data.confidence,
      result: data,
    });
  };

  const handleSelectHistory = (entry) => {
    setResult(entry.result);
    setDirection(entry.direction);
    setCurrency(entry.currency);
    setRawText(entry.inputPreview || '');
    setSidebarOpen(false);
  };

  const handleTrySample = async () => {
    setDirection('ifrs-to-gaap');
    setCurrency('USD');
    setLoading(true);
    setError(null);
    localStorage.setItem('flowbridge_sample_seen', '1');
    try {
      const data = await convertText(SAMPLE_IFRS, 'ifrs-to-gaap', 'USD');
      setResult(data);
      setRawText(SAMPLE_IFRS);
      handleConvert(data, SAMPLE_IFRS);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Sample conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        historyCount={history.length}
        onOpenHistory={() => setSidebarOpen(true)}
      />

      <Sidebar
        history={history}
        onSelect={handleSelectHistory}
        onRemove={remove}
        onClear={clear}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-[76px]">
            <InputPanel onConvert={handleConvert} />
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7">
            <OutputPanel onTrySample={handleTrySample} />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ConversionProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ConversionProvider>
    </ThemeProvider>
  );
}

export default App;
