import { useState, useCallback } from 'react';

/**
 * useAsyncAction — fire-and-forget action with loading + error state.
 *
 * Usage:
 *   const { run, loading, error } = useAsyncAction();
 *   const handleSave = () => run(() => studentEnroll({ course_id }), {
 *     onSuccess: () => showAlert('Enrolled!'),
 *     onError:   (e) => showAlert(e.response?.data?.message || 'Failed'),
 *   });
 */
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