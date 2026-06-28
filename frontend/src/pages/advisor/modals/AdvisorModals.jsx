import { token, fontMono } from '../../../theme';
import { Empty, Modal, Avatar, Icon } from '../../../components/shared';
import { gpaColor, gpaText, scoreColor, StatusBadge } from '../components/formatters';
import StatCard from '../components/StatCard';
import RiskPill from '../components/RiskPill';
import SectionLabel from '../components/SectionLabel';
import KV from '../components/KV';
import DataTable from '../components/DataTable';

export function StudentDetailModal({ detail, onClose }) {
  return (
    <Modal title={`${detail.profile?.username}'s profile`} onClose={onClose} wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <div>
          <SectionLabel>Personal info</SectionLabel>
          {[
            ['Email',          detail.profile?.email],
            ['Department',     detail.profile?.department || '—'],
            ['Programme',      detail.profile?.programme || '—'],
            ['Academic level', detail.profile?.academic_level || '—'],
          ].map(([label, value]) => (
            <KV key={label} label={label} value={value} />
          ))}
          <KV
            label="GPA"
            value={
              <span style={{ fontFamily: fontMono, color: gpaColor(detail.profile?.gpa) }}>
                {gpaText(detail.profile?.gpa)}
              </span>
            }
          />
          <KV
            label="Standing"
            value={
              <RiskPill atRisk={!!detail.profile?.is_at_risk} />
            }
            last
          />
        </div>

        <div>
          <SectionLabel>Enrolled courses</SectionLabel>
          {(detail.courses || []).length === 0 ? (
            <Empty>Not enrolled in any course yet.</Empty>
          ) : (
            detail.courses.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 0',
                  borderBottom: `1px solid ${token.line}`,
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600, color: token.ink }}>{c.title}</div>
                <div style={{ color: token.inkFaint, fontSize: 12 }}>
                  Taught by {c.instructor_name}
                </div>
                <div
                  style={{
                    background: token.line,
                    borderRadius: 99,
                    height: 5,
                    margin: '6px 0 3px',
                  }}
                >
                  <div
                    style={{
                      background: token.ink,
                      height: 5,
                      borderRadius: 99,
                      width: `${c.completion_percent}%`,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: token.inkSoft,
                    fontFamily: fontMono,
                  }}
                >
                  {c.completion_percent}% complete · {c.enrollment_status}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <SectionLabel>Recent quiz history</SectionLabel>
          {(detail.quizHistory || []).length === 0 ? (
            <Empty>No quiz attempts recorded yet.</Empty>
          ) : (
            <DataTable
              headers={['Quiz', 'Course', 'Score', 'Date']}
              rows={(detail.quizHistory || []).map((q) => [
                q.quiz_title,
                q.course_title,
                <span
                  key="score"
                  style={{
                    fontFamily: fontMono,
                    fontWeight: 700,
                    color: q.status === 'graded' ? scoreColor(q.score) : token.warn,
                  }}
                >
                  {q.status === 'graded' ? `${parseFloat(q.score).toFixed(1)}%` : 'Pending'}
                </span>,
                new Date(q.created_at).toLocaleDateString(),
              ])}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export function StudentGradesModal({ grades, onClose }) {
  return (
    <Modal
      title={`${grades.profile?.username}'s academic record`}
      onClose={onClose}
      wide
    >
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatCard
          label="GPA"
          value={gpaText(grades.profile?.gpa)}
          accent={gpaColor(grades.profile?.gpa)}
        />
        <StatCard
          label="Programme"
          value={grades.profile?.programme || '—'}
          accent={token.brass}
        />
        <StatCard
          label="Level"
          value={grades.profile?.academic_level || '—'}
          accent={token.info}
        />
      </div>

      <SectionLabel>Grade history</SectionLabel>
      {(grades.grades || []).length === 0 ? (
        <Empty>
          No quiz grades recorded yet — they'll appear here once the student completes a
          graded quiz.
        </Empty>
      ) : (
        <DataTable
          headers={['Quiz', 'Course', 'Score', 'Type', 'Status', 'Date']}
          rows={(grades.grades || []).map((g) => [
            g.quiz_title,
            g.course_title,
            <span
              key="score"
              style={{
                fontFamily: fontMono,
                fontWeight: 700,
                color: g.status === 'graded' ? scoreColor(g.score) : token.warn,
              }}
            >
              {g.status === 'graded' ? `${parseFloat(g.score).toFixed(1)}%` : 'Pending'}
            </span>,
            g.submission_type,
            <StatusBadge key="status" status={g.status} />,
            new Date(g.created_at).toLocaleDateString(),
          ])}
        />
      )}

      <SectionLabel style={{ marginTop: 24 }}>Academic history</SectionLabel>
      {(grades.academicHistory || []).length === 0 ? (
        <Empty>No enrolment history on file yet.</Empty>
      ) : (
        <DataTable
          headers={['Course', 'Status', 'Completion', 'Enrolled', 'Completed']}
          rows={(grades.academicHistory || []).map((h) => [
            h.course_title,
            <StatusBadge key="status" status={h.enrollment_status} />,
            `${parseFloat(h.completion_percent || 0).toFixed(0)}%`,
            h.enrolled_at ? new Date(h.enrolled_at).toLocaleDateString() : '—',
            h.completed_at ? new Date(h.completed_at).toLocaleDateString() : '—',
          ])}
        />
      )}
    </Modal>
  );
}

export function ProfileForm({
  profileForm,
  setProfileForm,
  photoPreview,
  profilePhoto,
  fileInputRef,
  onPhotoChange,
  onSubmit,
}) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Avatar name={profileForm.username} src={photoPreview || profilePhoto} size={64} />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={onPhotoChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: token.surface,
              border: `1px solid ${token.line}`,
              color: token.ink,
              borderRadius: 6,
              padding: '7px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Icon name="camera" size={13} /> Change photo
          </button>
          <div style={{ fontSize: 11.5, color: token.inkFaint, marginTop: 6 }}>
            JPG or PNG, up to 5MB.
          </div>
        </div>
      </div>

      {[
        { label: 'Username',   key: 'username' },
        { label: 'Phone',       key: 'phone_number' },
        { label: 'Department',  key: 'department' },
      ].map((f) => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12.5,
              fontWeight: 600,
              color: token.inkSoft,
              marginBottom: 5,
            }}
          >
            {f.label}
          </label>
          <input
            value={profileForm[f.key] || ''}
            onChange={(e) =>
              setProfileForm({ ...profileForm, [f.key]: e.target.value })
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${token.line}`,
              borderRadius: 8,
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: '"Inter", sans-serif',
              color: token.ink,
            }}
          />
        </div>
      ))}
      <button
        onClick={onSubmit}
        style={{
          width: '100%',
          background: token.ink,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '11px 18px',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          marginTop: 6,
        }}
      >
        Save changes
      </button>
    </>
  );
}
