import { useState, useCallback } from 'react';

export function useClipboard(timeout = 1500) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback((text) => {
    if (typeof text === 'string' || typeof text === 'number') {
      navigator.clipboard.writeText(String(text))
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), timeout);
        })
        .catch((error) => console.error('Failed to copy to clipboard', error));
    }
  }, [timeout]);

  return [isCopied, copyToClipboard];
}