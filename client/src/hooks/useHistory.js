import { useState, useEffect } from 'react';

const STORAGE_KEY = 'flowbridge_history';
const MAX_ENTRIES = 20;

export function useHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (entry) => {
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      direction: entry.direction,
      currency: entry.currency,
      inputPreview: (entry.rawText || '').substring(0, 120),
      confidence: entry.confidence,
      result: entry.result,
    };
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const remove = (id) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clear = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, save, remove, clear };
}
