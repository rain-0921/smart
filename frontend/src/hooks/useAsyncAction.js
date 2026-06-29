import { useState, useCallback } from 'react';

export default function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn, { onSuccess, onError } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      onSuccess?.(result);
      return result;
    } catch (e) {
      setError(e);
      onError?.(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error };
}
