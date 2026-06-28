import { useState } from 'react';
import { token } from '../../../theme';
import { Empty, Modal } from '../../../components/shared';
import { formLabel, formInput, btnPrimary, table, th, td } from '../components/styles';

const EMAIL_SMIS_REGEX = /^[^@\s]+@smis\.edu$/;
const PHONE_REGEX = /^\+?[\d\s\-]*$/;

export function AdminUserModal({ editingUser, userForm, instructors, departments, onChange, onClose, onSubmit }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const ph = userForm.phone_number || '';
    if (!userForm.username.trim())            e.username = 'Username is required';
    if (!userForm.email.trim())               e.email = 'Email is required';
    else if (userForm.role === 'student' && !EMAIL_SMIS_REGEX.test(userForm.email)) {
      e.email = 'Student email must end with @smis.edu';
    }
    if (ph.trim() !== '' && !PHONE_REGEX.test(ph)) {
      e.phone_number = 'Phone can only contain digits, spaces, hyphens and leading +';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit();
  };

  const handleChange = (key, value) => {
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    onChange({ ...userForm, [key]: value });
  };

  return (
    <Modal title={editingUser ? 'Edit User' : 'Add New User'} onClose={onClose}>
      {[
        { label: 'Username', key: 'username', type: 'text' },
        { label: 'Email',    key: 'email',    type: 'email', error: errors.email },
        ...(!editingUser ? [{ label: 'Password', key: 'password', type: 'password' }] : []),
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <label style={formLabel}>{f.label}</label>
          <input className="adm-input" style={formInput} type={f.type} value={userForm[f.key]}
            onChange={e => handleChange(f.key, e.target.value)} />
          {f.error && <span style={{ color: 'red', fontSize: 12 }}>{f.error}</span>}
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Role</label>
        <select className="adm-input" style={formInput} value={userForm.role} onChange={e => handleChange('role', e.target.value)}>
          {['student', 'instructor', 'advisor', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {!editingUser && (
        <div style={{ marginBottom: 12 }}>
          <label style={formLabel}>Department</label>
          {departments.length > 0 ? (
            <select className="adm-input" style={formInput} value={userForm.department}
              onChange={e => handleChange('department', e.target.value)}>
              <option value="">-- Select Department --</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          ) : (
            <input className="adm-input" style={formInput} type="text" value={userForm.department || ''}
              onChange={e => handleChange('department', e.target.value)} placeholder="e.g. Computer Science" />
          )}
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Phone</label>
        <input className="adm-input" style={formInput} type="text" value={userForm.phone_number || ''}
          onChange={e => handleChange('phone_number', e.target.value)} placeholder="+1 234 567 8900" />
        {errors.phone_number && <span style={{ color: 'red', fontSize: 12 }}>{errors.phone_number}</span>}
      </div>
      {editingUser && (
        <div style={{ marginBottom: 12 }}>
          <label style={formLabel}>Status</label>
          <select className="adm-input" style={formInput} value={userForm.status} onChange={e => handleChange('status', e.target.value)}>
            {['active', 'inactive', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={handleSubmit}>
        {editingUser ? 'Update User' : 'Add User'}
      </button>
    </Modal>
  );
}

export function AdminCourseModal({ editingCourse, courseForm, instructors, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingCourse ? 'Edit Course' : 'Add New Course'} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Title</label>
        <input className="adm-input" style={formInput} value={courseForm.title}
          onChange={e => onChange({ ...courseForm, title: e.target.value })} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Description</label>
        <textarea className="adm-input" style={{ ...formInput, height: 80 }} value={courseForm.description}
          onChange={e => onChange({ ...courseForm, description: e.target.value })} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Assign Instructor</label>
        <select className="adm-input" style={formInput} value={courseForm.instructor_id}
          onChange={e => onChange({ ...courseForm, instructor_id: e.target.value })}>
          <option value="">-- Select Instructor --</option>
          {instructors.map(i => <option key={i.user_id} value={i.user_id}>{i.username}</option>)}
        </select>
      </div>
      {editingCourse && (
        <div style={{ marginBottom: 12 }}>
          <label style={formLabel}>Status</label>
          <select className="adm-input" style={formInput} value={courseForm.status}
            onChange={e => onChange({ ...courseForm, status: e.target.value })}>
            {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={onSubmit}>
        {editingCourse ? 'Update Course' : 'Create Course'}
      </button>
    </Modal>
  );
}

export function AdminEnrollmentModal({
  editingEnrollment, enrollForm, enrollEditForm,
  students, courses,
  onChangeAdd, onChangeEdit, onClose, onSubmitAdd, onSubmitEdit,
}) {
  const publishedCourses = courses.filter(c => c.status === 'published');
  return (
    <Modal title={editingEnrollment ? 'Edit Enrollment' : 'Add Enrollment'} onClose={onClose}>
      {editingEnrollment ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Student</label>
            <input className="adm-input" style={{ ...formInput, background: '#f0f0f0' }} type="text"
              value={students.find(s => s.user_id === editingEnrollment.user_id)?.username || ''} readOnly />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Course</label>
            <input className="adm-input" style={{ ...formInput, background: '#f0f0f0' }} type="text"
              value={editingEnrollment.course_title || ''} readOnly />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Status</label>
            <select className="adm-input" style={formInput} value={enrollEditForm.status}
              onChange={e => onChangeEdit({ ...enrollEditForm, status: e.target.value })}>
              {['active', 'completed', 'dropped'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={onSubmitEdit}>
            Update Enrollment
          </button>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Student</label>
            <select className="adm-input" style={formInput} value={enrollForm.user_id}
              onChange={e => onChangeAdd({ ...enrollForm, user_id: e.target.value })}>
              <option value="">-- Select Student --</option>
              {students.map(s => <option key={s.user_id} value={s.user_id}>{s.username} ({s.email})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Course</label>
            <select className="adm-input" style={formInput} value={enrollForm.course_id}
              onChange={e => onChangeAdd({ ...enrollForm, course_id: e.target.value })}>
              <option value="">-- Select Course --</option>
              {publishedCourses.map(c =>
                <option key={c.course_id} value={c.course_id}>{c.title}</option>
              )}
            </select>
          </div>
          <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={onSubmitAdd}>
            Add Enrollment
          </button>
        </>
      )}
    </Modal>
  );
}

export function AdminNotificationModal({ editingNotif, notifForm, users, courses, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingNotif ? 'Edit Notification' : 'Create Notification'} wide onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Title *</label>
        <input className="adm-input" style={formInput} value={notifForm.title}
          onChange={e => onChange({ ...notifForm, title: e.target.value })} placeholder="e.g. New Course Available" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Message *</label>
        <textarea className="adm-input" style={{ ...formInput, height: 80 }} value={notifForm.message}
          onChange={e => onChange({ ...notifForm, message: e.target.value })} placeholder="Write your notification message here..." />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Notification Type</label>
        <select className="adm-input" style={formInput} value={notifForm.type}
          onChange={e => onChange({ ...notifForm, type: e.target.value })}>
          <option value="announcement">Announcement</option>
          <option value="deadline">Deadline Alert</option>
          <option value="quiz_score">Quiz Score</option>
          <option value="admin_broadcast">General Broadcast</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Target Audience</label>
        <select className="adm-input" style={formInput} value={notifForm.target_mode}
          onChange={e => onChange({ ...notifForm, target_mode: e.target.value })}>
          <option value="role">By Role</option>
          <option value="course">By Course</option>
          <option value="user">Specific User</option>
          <option value="all">All Users</option>
        </select>
      </div>
      {notifForm.target_mode === 'role' && (
        <div style={{ marginBottom: 12 }}>
          <label style={formLabel}>Role</label>
          <select className="adm-input" style={formInput} value={notifForm.target_role}
            onChange={e => onChange({ ...notifForm, target_role: e.target.value })}>
            {['student', 'instructor', 'advisor', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}
      {notifForm.target_mode === 'course' && (
        <div style={{ marginBottom: 12 }}>
          <label style={formLabel}>Course</label>
          <select className="adm-input" style={formInput} value={notifForm.course_id}
            onChange={e => onChange({ ...notifForm, course_id: e.target.value })}>
            <option value="">-- Select Course --</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
          </select>
        </div>
      )}
      {notifForm.target_mode === 'user' && (
        <div style={{ marginBottom: 12 }}>
          <label style={formLabel}>User</label>
          <select className="adm-input" style={formInput} value={notifForm.user_id}
            onChange={e => onChange({ ...notifForm, user_id: e.target.value })}>
            <option value="">-- Select User --</option>
            {users.map(u => <option key={u.user_id} value={u.user_id}>{u.username} ({u.role})</option>)}
          </select>
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <label style={formLabel}>Delivery Time</label>
        <input className="adm-input" style={formInput} type="datetime-local" value={notifForm.scheduled_at}
          onChange={e => onChange({ ...notifForm, scheduled_at: e.target.value })} />
        <span style={{ fontSize: 11.5, color: token.inkFaint, marginTop: 4, display: 'block' }}>Leave empty to send immediately.</span>
      </div>
      <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={onSubmit}>
        {editingNotif ? 'Update Notification' : 'Send Notification'}
      </button>
    </Modal>
  );
}

export function AdminLogDetailModal({ username, detailLogs, onClose }) {
  return (
    <Modal title={`Activity History — ${username || ''}`} wide onClose={onClose}>
      {detailLogs.length === 0 ? <Empty>No records found.</Empty>
        : <div className="adm-table-wrap"><table style={table}>
            <thead><tr>{['Activity', 'Description', 'Related Item', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{detailLogs.map((l, i) => (
              <tr key={i} className="adm-table-row">
                <td style={{ ...td, fontWeight: 600 }}>{l.activity_type}</td>
                <td style={td}>{l.description}</td>
                <td style={td}>{l.related_item_type ? <span style={{ fontSize: 12, color: token.inkFaint }}>{l.related_item_type} #{l.related_item_id}</span> : '—'}</td>
                <td style={{ ...td, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table></div>
      }
    </Modal>
  );
}