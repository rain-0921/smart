import { useState, useEffect, useCallback } from 'react';

/**
 * useApi — generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => studentGetDashboard(), []);
 *   const { data: courses } = useApi(() => instrGetCourses(), [], { enabled: tab === 'courses' });
 *
 * The fetcher should return a Promise that resolves to an Axios response (i.e. has `.data`).
 * Hook returns the response's `.data` field as `data`.
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, enabled]);

  return { data, loading, error, refetch: run, setData };
}