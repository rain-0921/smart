import { useState, useCallback } from 'react';

/**
 * useDashboardAlerts  small toast-like alert system for dashboard pages.
 *
 * Usage:
 *   const { alert, showAlert } = useDashboardAlerts();
 *   showAlert('Saved!', 'success');     // auto-clears after 3s
 *   showAlert('Failed', 'error');
 *
 * Returns { alert: {msg,type}, showAlert(msg, type?) }
 */
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