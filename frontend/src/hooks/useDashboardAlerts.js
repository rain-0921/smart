import { useState, useCallback } from 'react';

export default function useDashboardAlerts(timeoutMs = 3000) {
  const [alert, setAlert] = useState({ msg: '', type: '' });

  const showAlert = useCallback((msg, type = 'success') => {
    setAlert({ msg, type });
    if (timeoutMs > 0) {
      setTimeout(() => setAlert({ msg: '', type: '' }), timeoutMs);
    }
  }, [timeoutMs]);

  return { alert, showAlert };
}
