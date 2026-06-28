import { token, fontDisplay } from '../../../theme';
import { cardBase, hSection, btnRow, btnGhost, btnDanger, StatusBadge } from '../components/styles';

export default function InstructorCoursesSection({ courses, onAddNew, onOpenCourse, onEditCourse, onArchiveCourse }) {
  return (
    <div className="ins-card" style={cardBase}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ ...hSection, margin: 0 }}>My Courses</h3>
        <button className="ins-btn" onClick={onAddNew}
          style={{ ...btnRow, padding: '9px 18px', fontSize: 13 }}>
          + New Course
        </button>
      </div>
      {courses.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No courses yet. Create your first course!</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {courses.map(c => (
              <div key={c.course_id} style={{ background: token.paper, border: `1px solid ${token.line}`, borderRadius: 10, padding: 18, borderTop: `3px solid ${token.brassSoft}` }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: token.ink, marginBottom: 6, fontFamily: fontDisplay }}>{c.title}</div>
                <div style={{ fontSize: 12, color: token.inkSoft, marginBottom: 10 }}>
                  {c.enrolled_count} enrolled student{c.enrolled_count !== 1 ? 's' : ''}
                </div>
                <div style={{ marginBottom: 12 }}><StatusBadge status={c.status} /></div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="ins-btn" onClick={() => onOpenCourse(c)}
                    style={btnRow}>
                    Open
                  </button>
                  <button className="ins-btn" onClick={() => onEditCourse(c)}
                    style={btnGhost}>
                    Edit
                  </button>
                  {c.status !== 'archived' && (
                    <button className="ins-btn" onClick={() => onArchiveCourse(c.course_id)}
                      style={btnDanger}>
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}