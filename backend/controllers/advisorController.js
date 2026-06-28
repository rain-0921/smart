const db = require('../config/db');

// ─── DASHBOARD ───────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [[{ totalStudents }]] = await db.execute(
      `SELECT COUNT(*) AS totalStudents FROM student_profile WHERE advisor_id=?`, [userId]
    );
    const [[{ atRiskCount }]] = await db.execute(
      `SELECT COUNT(*) AS atRiskCount FROM student_profile
       WHERE advisor_id=? AND is_at_risk=1`, [userId]
    );
    const [[{ avgGpa }]] = await db.execute(
      `SELECT COALESCE(AVG(gpa),0) AS avgGpa FROM student_profile WHERE advisor_id=?`, [userId]
    );
    const [recentActivity] = await db.execute(
      `SELECT al.activity_type, al.description, al.created_at, u.username
       FROM activity_log al
       JOIN user u ON al.user_id = u.user_id
       JOIN student_profile sp ON u.user_id = sp.user_id
       WHERE sp.advisor_id=?
       ORDER BY al.created_at DESC LIMIT 8`, [userId]
    );
    const [atRiskStudents] = await db.execute(
      `SELECT u.user_id, u.username, u.email, sp.gpa, sp.programme
       FROM student_profile sp
       JOIN user u ON sp.user_id = u.user_id
       WHERE sp.advisor_id=? AND sp.is_at_risk=1`, [userId]
    );
    res.json({ totalStudents, atRiskCount, avgGpa, recentActivity, atRiskStudents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PROFILE ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.username, u.email, u.department,
              u.phone_number, u.photo_url
       FROM user u WHERE u.user_id=?`, [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { username, phone_number, department } = req.body;
  if (!username) return res.status(400).json({ message: 'Username is required' });

  // req.file is set by the `handlePhotoUpload` multer middleware in advisorRoutes.js.
  // Format (JPG/PNG) and size (<=5MB) are already validated there per SDS 7.2.2.
  const photo_url = req.file ? `/uploads/profile-photos/${req.file.filename}` : null;

  try {
    if (photo_url) {
      await db.execute(
        `UPDATE user SET username=?, phone_number=?, department=?, photo_url=? WHERE user_id=?`,
        [username, phone_number||null, department||null, photo_url, userId]
      );
    } else {
      // No new photo uploaded — leave the existing photo_url untouched.
      await db.execute(
        `UPDATE user SET username=?, phone_number=?, department=? WHERE user_id=?`,
        [username, phone_number||null, department||null, userId]
      );
    }
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description)
       VALUES (?, 'profile_update', 'Advisor updated their profile')`, [userId]
    );
    res.json({ message: 'Profile updated successfully', photo_url: photo_url || undefined });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── STUDENT PROFILES ────────────────────────────────────
exports.getMyStudents = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [students] = await db.execute(
      `SELECT u.user_id, u.username, u.email, u.phone_number, u.department, u.status,
              sp.academic_level, sp.programme, sp.gpa, sp.is_at_risk,
              sp.learning_preferences,
              COUNT(DISTINCT e.course_id) AS enrolled_courses
       FROM student_profile sp
       JOIN user u ON sp.user_id = u.user_id
       LEFT JOIN enrollment e ON e.user_id = u.user_id AND e.status='active'
       WHERE sp.advisor_id=?
       GROUP BY u.user_id
       ORDER BY sp.gpa ASC`, [userId]
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentDetail = async (req, res) => {
  const { studentId } = req.params;
  const advisorId = req.user.user_id;
  try {
    // Verify this student belongs to this advisor
    const [check] = await db.execute(
      `SELECT user_id FROM student_profile WHERE user_id=? AND advisor_id=?`,
      [studentId, advisorId]
    );
    if (check.length === 0)
      return res.status(403).json({ message: 'Student not assigned to you' });

    // Profile
    const [profile] = await db.execute(
      `SELECT u.user_id, u.username, u.email, u.department, u.status, u.created_at,
              sp.academic_level, sp.programme, sp.gpa, sp.is_at_risk, sp.learning_preferences
       FROM user u
       JOIN student_profile sp ON u.user_id = sp.user_id
       WHERE u.user_id=?`, [studentId]
    );

    // Enrolled courses + progress
    const [courses] = await db.execute(
      `SELECT c.title, c.course_id, e.status AS enrollment_status,
              e.completion_percent, e.enrolled_at,
              u2.username AS instructor_name
       FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       JOIN user u2 ON c.instructor_id = u2.user_id
       WHERE e.user_id=?
       ORDER BY e.enrolled_at DESC`, [studentId]
    );

    // Quiz history
    const [quizHistory] = await db.execute(
      `SELECT qa.score, qa.status, qa.created_at,
              q.title AS quiz_title, c.title AS course_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       WHERE qa.user_id=?
       ORDER BY qa.created_at DESC LIMIT 10`, [studentId]
    );

    // Activity log
    const [activityLog] = await db.execute(
      `SELECT activity_type, description, created_at
       FROM activity_log WHERE user_id=?
       ORDER BY created_at DESC LIMIT 10`, [studentId]
    );

    res.json({
      profile: profile[0],
      courses,
      quizHistory,
      activityLog
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── MONITOR PROGRESS ────────────────────────────────────
exports.getStudentProgress = async (req, res) => {
  const advisorId = req.user.user_id;
  try {
    const [progress] = await db.execute(
      `SELECT u.user_id, u.username, u.email,
              sp.gpa, sp.is_at_risk, sp.programme,
              COUNT(DISTINCT e.course_id) AS total_courses,
              COALESCE(AVG(e.completion_percent),0) AS avg_completion,
              COALESCE(AVG(qa.score),0) AS avg_quiz_score,
              COUNT(DISTINCT qa.quiz_attempt_id) AS total_quizzes
       FROM student_profile sp
       JOIN user u ON sp.user_id = u.user_id
       LEFT JOIN enrollment e ON e.user_id = u.user_id AND e.status='active'
       LEFT JOIN quiz_attempt qa ON qa.user_id = u.user_id AND qa.status='graded'
       WHERE sp.advisor_id=?
       GROUP BY u.user_id
       ORDER BY avg_quiz_score ASC`, [advisorId]
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GRADES & ACADEMIC RECORDS ───────────────────────────
exports.getStudentGrades = async (req, res) => {
  const { studentId } = req.params;
  const advisorId = req.user.user_id;
  try {
    const [check] = await db.execute(
      `SELECT user_id FROM student_profile WHERE user_id=? AND advisor_id=?`,
      [studentId, advisorId]
    );
    if (check.length === 0)
      return res.status(403).json({ message: 'Student not assigned to you' });

    const [grades] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.score, qa.status, qa.created_at,
              q.title AS quiz_title, q.submission_type,
              c.title AS course_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       WHERE qa.user_id=?
       ORDER BY qa.created_at DESC`, [studentId]
    );

    // Academic history: enrolment/course-level record (required by SDS 2.4.4 — "course grades, GPA, and academic history")
    const [academicHistory] = await db.execute(
      `SELECT c.title AS course_title, e.status AS enrollment_status,
              e.completion_percent, e.enrolled_at, e.completed_at
       FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       WHERE e.user_id=?
       ORDER BY e.enrolled_at DESC`, [studentId]
    );

    const [profile] = await db.execute(
      `SELECT sp.gpa, sp.academic_level, sp.programme, u.username
       FROM student_profile sp JOIN user u ON sp.user_id=u.user_id
       WHERE sp.user_id=?`, [studentId]
    );

    res.json({ grades, academicHistory, profile: profile[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GENERATE REPORTS ────────────────────────────────────
exports.generateReport = async (req, res) => {
  const advisorId = req.user.user_id;
  const { type } = req.query; // 'progress' or 'academic'
  try {
    if (type === 'academic') {
      const [report] = await db.execute(
        `SELECT u.username, u.email, sp.programme, sp.academic_level,
                sp.gpa, sp.is_at_risk,
                COUNT(DISTINCT e.course_id) AS enrolled_courses,
                SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed_courses
         FROM student_profile sp
         JOIN user u ON sp.user_id = u.user_id
         LEFT JOIN enrollment e ON e.user_id = u.user_id
         WHERE sp.advisor_id=?
         GROUP BY u.user_id
         ORDER BY sp.gpa DESC`, [advisorId]
      );
      return res.json({ type: 'Academic Summary Report', data: report });
    }

    // Progress report (default)
    const [report] = await db.execute(
      `SELECT u.username, u.email, sp.programme, sp.gpa,
              COUNT(DISTINCT e.course_id) AS total_courses,
              COALESCE(AVG(e.completion_percent),0) AS avg_completion,
              COALESCE(AVG(qa.score),0) AS avg_quiz_score,
              COUNT(DISTINCT qa.quiz_attempt_id) AS quizzes_taken,
              sp.is_at_risk
       FROM student_profile sp
       JOIN user u ON sp.user_id = u.user_id
       LEFT JOIN enrollment e ON e.user_id = u.user_id AND e.status='active'
       LEFT JOIN quiz_attempt qa ON qa.user_id = u.user_id AND qa.status='graded'
       WHERE sp.advisor_id=?
       GROUP BY u.user_id
       ORDER BY avg_completion DESC`, [advisorId]
    );
    res.json({ type: 'Student Progress Report', data: report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reuse adminController's toCsvValue helper. Defined locally so the advisor
// controller stays self-contained.
function toCsvValue(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Stream the currently visible report as a downloadable CSV file. Mirrors the
// generateReport query so the file matches what the advisor sees on screen.
exports.exportReport = async (req, res) => {
  const advisorId = req.user.user_id;
  const type = req.query.type || 'progress';
  try {
    let rows = [];
    let headers = [];

    if (type === 'academic') {
      headers = ['username', 'email', 'programme', 'academic_level', 'gpa', 'is_at_risk', 'enrolled_courses', 'completed_courses'];
      [rows] = await db.execute(
        `SELECT u.username, u.email, sp.programme, sp.academic_level,
                sp.gpa, sp.is_at_risk,
                COUNT(DISTINCT e.course_id) AS enrolled_courses,
                SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed_courses
         FROM student_profile sp
         JOIN user u ON sp.user_id = u.user_id
         LEFT JOIN enrollment e ON e.user_id = u.user_id
         WHERE sp.advisor_id=?
         GROUP BY u.user_id
         ORDER BY sp.gpa DESC`, [advisorId]
      );
    } else {
      headers = ['username', 'email', 'programme', 'gpa', 'total_courses', 'avg_completion', 'avg_quiz_score', 'quizzes_taken', 'is_at_risk'];
      [rows] = await db.execute(
        `SELECT u.username, u.email, sp.programme, sp.gpa,
                COUNT(DISTINCT e.course_id) AS total_courses,
                COALESCE(AVG(e.completion_percent),0) AS avg_completion,
                COALESCE(AVG(qa.score),0) AS avg_quiz_score,
                COUNT(DISTINCT qa.quiz_attempt_id) AS quizzes_taken,
                sp.is_at_risk
         FROM student_profile sp
         JOIN user u ON sp.user_id = u.user_id
         LEFT JOIN enrollment e ON e.user_id = u.user_id AND e.status='active'
         LEFT JOIN quiz_attempt qa ON qa.user_id = u.user_id AND qa.status='graded'
         WHERE sp.advisor_id=?
         GROUP BY u.user_id
         ORDER BY avg_completion DESC`, [advisorId]
      );
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No data available to export' });
    }

    const lines = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map(h => toCsvValue(row[h])).join(','));
    }
    const csv = lines.join('\r\n');
    const filename = `advisor_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── NOTIFICATIONS ───────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [notifications] = await db.execute(
      `SELECT * FROM notification
       WHERE user_id=? OR target_role='advisor'
       ORDER BY created_at DESC LIMIT 20`, [userId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  try {
    // Only allow marking as read if it's this advisor's own notification, or a
    // broadcast-style notification for the 'advisor' role — matches the same
    // scope used in getNotifications above.
    const [result] = await db.execute(
      `UPDATE notification SET is_read=1
       WHERE notification_id=? AND (user_id=? OR target_role='advisor')`,
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};