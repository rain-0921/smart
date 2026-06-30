import { useState, useEffect, useCallback } from 'react';

export default function useApi(fetcher, deps = [], options = {}) {
  const { enabled = true, initial = null } = options;
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res?.data ?? null);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    run();
  }, [run, enabled]);

  return { data, loading, error, refetch: run, setData };
}
