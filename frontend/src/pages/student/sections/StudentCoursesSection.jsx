import { courseTones } from '../../../theme';
import { courseGridWide, courseCard, courseThumb, courseTag, courseTitle, courseMeta, courseDesc, btnPrimary, btnGhost, emptyState } from '../components/styles';

export default function StudentCoursesSection({ catalogue, search, onEnroll, onOpenCourse }) {
  const filtered = catalogue.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={courseGridWide}>
      {filtered.length === 0
        ? <div style={emptyState}>{search ? 'No courses match your search.' : 'No published courses available.'}</div>
        : filtered.map((c, i) => {
          const tone = courseTones[i % courseTones.length];
          return (
            <div key={c.course_id} style={courseCard}>
              <div style={{ ...courseThumb, background: tone.thumb }}>📘</div>
              <div style={{ ...courseTag, background: tone.tagBg, color: tone.tagColor }}>
                {c.course_code || `COURSE ${c.course_id}`}
              </div>
              <div style={courseTitle}>{c.title}</div>
              <div style={courseMeta}>👨‍🏫 {c.instructor_name}</div>
              <div style={courseDesc}>{c.description || 'No description provided.'}</div>
              {c.is_enrolled > 0
                ? <button style={{ ...btnPrimary, width: '100%' }} onClick={() => onOpenCourse(c)}>Go to Course</button>
                : <button style={{ ...btnGhost, width: '100%' }} onClick={() => onEnroll(c.course_id)}>Enroll Now</button>
              }
            </div>
          );
        })
      }
    </div>
  );
}