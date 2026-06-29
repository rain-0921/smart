import { useState } from 'react';
import { token } from '../../../theme';
import { Modal } from '../../../components/shared';
import { formLabel, formInput, btnPrimary } from '../components/styles';

export function AdminAdvisorAssignmentModal({
  student, advisors,
  assignForm, onChange,
  onClose, onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Assign Advisor — ${student?.username || ''}`} onClose={onClose}>
      {student && (
        <div style={{ marginBottom: 6 }}>
          <label style={formLabel}>Student</label>
          <input className="adm-input" style={{ ...formInput, background: '#f0f0f0' }} type="text"
            value={`${student.username}  (${student.email})`} readOnly />
        </div>
      )}

      <div style={{ marginBottom: 6 }}>
        <label style={formLabel}>Current Advisor</label>
        <input className="adm-input" style={{ ...formInput, background: '#f0f0f0' }} type="text"
          value={
            student?.advisor_name
              ? `${student.advisor_name}  (${student.advisor_email})`
              : 'None — currently unassigned'
          } readOnly />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={formLabel}>
          New Advisor <span style={{ fontWeight: 400, color: token.inkFaint, fontSize: 12 }}>(leave blank to unassign)</span>
        </label>
        <select
          className="adm-input" style={formInput}
          value={assignForm.advisor_id}
          onChange={e => onChange({ ...assignForm, advisor_id: e.target.value })}
        >
          <option value="">— None / Unassign —</option>
          {advisors.map(a => (
            <option key={a.user_id} value={a.user_id}>
              {a.username}{a.department ? `  (${a.department})` : ''}
            </option>
          ))}
        </select>
      </div>

      <button
        className="adm-btn" style={{ ...btnPrimary, width: '100%', opacity: submitting ? 0.7 : 1 }}
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? 'Saving…' : 'Save Assignment'}
      </button>
    </Modal>
  );
}
