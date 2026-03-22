import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const ConversionContext = createContext();

export function ConversionProvider({ children }) {
  const [direction, setDirection] = useState('ifrs-to-gaap');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawText, setRawText] = useState('');

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setRawText('');
  }, []);

  const value = useMemo(() => ({
    direction, setDirection,
    currency, setCurrency,
    result, setResult,
    loading, setLoading,
    error, setError,
    rawText, setRawText,
    reset,
  }), [direction, currency, result, loading, error, rawText, reset]);

  return (
    <ConversionContext.Provider value={value}>
      {children}
    </ConversionContext.Provider>
  );
}

export function useConversion() {
  return useContext(ConversionContext);
}
