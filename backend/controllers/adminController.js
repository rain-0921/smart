const db = require('../config/db');
const bcrypt = require('bcrypt');

// ─── USERS ───────────────────────────────────────────────

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT user_id, username, email, role, department, 
              phone_number, status, created_at, photo_url
       FROM user ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add new user
exports.addUser = async (req, res) => {
  const { username, email, password, role, department, phone_number } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  try {
    const [existing] = await db.execute(
      'SELECT user_id FROM user WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO user (username, email, password_hash, role, department, phone_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, role, department || null, phone_number || null]
    );
    const newUserId = result.insertId;
    if (role === 'student') {
      await db.execute('INSERT INTO student_profile (user_id) VALUES (?)', [newUserId]);
    } else if (role === 'instructor') {
      await db.execute('INSERT INTO instructor_profile (user_id) VALUES (?)', [newUserId]);
    }
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Edit user
exports.editUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, department, phone_number, status } = req.body;
  if (!username || !email || !role || !status) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  try {
    await db.execute(
      `UPDATE user SET username=?, email=?, role=?, department=?, 
       phone_number=?, status=? WHERE user_id=?`,
      [username, email, role, department || null, phone_number || null, status, id]
    );
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Deactivate user
exports.deactivateUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(
      "UPDATE user SET status='inactive' WHERE user_id=?", [id]
    );
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── COURSES ─────────────────────────────────────────────

exports.getAllCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      `SELECT c.course_id, c.title, c.description, c.status, c.created_at,
              u.username AS instructor_name
       FROM course c
       JOIN user u ON c.instructor_id = u.user_id
       ORDER BY c.created_at DESC`
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addCourse = async (req, res) => {
  const { title, description, instructor_id } = req.body;
  if (!title || !instructor_id) {
    return res.status(400).json({ message: 'Title and instructor are required' });
  }
  try {
    await db.execute(
      `INSERT INTO course (title, description, instructor_id, status)
       VALUES (?, ?, ?, 'draft')`,
      [title, description || null, instructor_id]
    );
    res.status(201).json({ message: 'Course created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, instructor_id } = req.body;
  if (!title || !status || !instructor_id) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  try {
    await db.execute(
      `UPDATE course SET title=?, description=?, status=?, instructor_id=?
       WHERE course_id=?`,
      [title, description || null, status, instructor_id, id]
    );
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.archiveCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(
      "UPDATE course SET status='archived' WHERE course_id=?", [id]
    );
    res.json({ message: 'Course archived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ENROLLMENTS ─────────────────────────────────────────

exports.getAllEnrollments = async (req, res) => {
  try {
    const [enrollments] = await db.execute(
      `SELECT e.enrollment_id, e.status, e.enrolled_at, e.completion_percent,
              u.username AS student_name, u.email AS student_email,
              c.title AS course_title
       FROM enrollment e
       JOIN user u ON e.user_id = u.user_id
       JOIN course c ON e.course_id = c.course_id
       ORDER BY e.enrolled_at DESC`
    );
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addEnrollment = async (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id) {
    return res.status(400).json({ message: 'Student and course are required' });
  }
  try {
    const [existing] = await db.execute(
      'SELECT enrollment_id FROM enrollment WHERE user_id=? AND course_id=?',
      [user_id, course_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }
    await db.execute(
      "INSERT INTO enrollment (user_id, course_id, status) VALUES (?, ?, 'active')",
      [user_id, course_id]
    );
    res.status(201).json({ message: 'Enrollment added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Edit enrollment (update status or course_id by enrollment_id)
exports.editEnrollment = async (req, res) => {
  const { id } = req.params;
  const { status, course_id } = req.body;
  if (!status && !course_id) {
    return res.status(400).json({ message: 'At least one of status or course_id is required' });
  }
  try {
    // Build dynamic SET clause so callers can update either or both fields
    const fields = [];
    const values = [];
    if (status) { fields.push('status=?');    values.push(status); }
    if (course_id) { fields.push('course_id=?'); values.push(course_id); }
    values.push(id);

    await db.execute(
      `UPDATE enrollment SET ${fields.join(', ')} WHERE enrollment_id=?`,
      values
    );
    res.json({ message: 'Enrollment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.dropEnrollment = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(
      "UPDATE enrollment SET status='dropped' WHERE enrollment_id=?", [id]
    );
    res.json({ message: 'Enrollment dropped successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── NOTIFICATIONS ───────────────────────────────────────

// Get all notifications (admin view), newest first.
// Adds an explicit `delivery_status` (sent / scheduled / draft) so the frontend
// no longer has to infer status from scheduled_at — matches spec UC 2.3.6.
exports.getAllNotifications = async (req, res) => {
  try {
    const [notifications] = await db.execute(
      `SELECT n.notification_id, n.user_id, n.title, n.message, n.type,
              n.is_read, n.related_item_type, n.related_item_id,
              n.target_role, n.scheduled_at, n.created_at,
              u.username AS recipient_name,
              CASE
                WHEN n.scheduled_at IS NULL THEN 'sent'
                WHEN n.scheduled_at <= NOW() THEN 'sent'
                ELSE 'scheduled'
              END AS delivery_status
       FROM notification n
       LEFT JOIN user u ON n.user_id = u.user_id
       ORDER BY n.created_at DESC`
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create notification — four target modes:
//   1. user_id                  → single specific recipient
//   2. target_role              → all active users with that role
//   3. target_all = true        → all active users on the platform
//   4. course_id                → all active students enrolled in that course
//
// Supported notification types: announcement | deadline | quiz_score | admin_broadcast
//
// IMPORTANT: notification.user_id has a real FK to user(user_id) (ON DELETE CASCADE),
// so we cannot insert a sentinel like 0. We always fan out into one row per recipient.
exports.createNotification = async (req, res) => {
  const { title, message, type, target_role, user_id, course_id, target_all, scheduled_at } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }
  // At least one target must be specified
  if (!user_id && !target_role && !course_id && !target_all) {
    return res.status(400).json({
      message: 'A target is required: user_id, target_role, course_id, or target_all'
    });
  }
  // Normalise notification type — default to admin_broadcast if not provided or invalid
  const VALID_TYPES = ['announcement', 'deadline', 'quiz_score', 'admin_broadcast'];
  const notifType = type && VALID_TYPES.includes(type) ? type : 'admin_broadcast';

  // Treat empty/null scheduled_at as "send now" (NULL in DB means immediate)
  const scheduledAt = scheduled_at && scheduled_at.trim() !== '' ? scheduled_at : null;

  // Helper: bulk-insert one notification row per recipient
  const fanOut = async (recipients, type, targetRole = null) => {
    if (recipients.length === 0) return 0;
    const values = recipients.map(r => [r.user_id, title, message, type, targetRole, scheduledAt]);
    await db.query(
      `INSERT INTO notification (user_id, title, message, type, target_role, scheduled_at)
       VALUES ?`,
      [values]
    );
    return recipients.length;
  };

  try {
    if (user_id) {
      // ── Mode 1: single recipient ───────────────────────────────────────────
      await db.execute(
        `INSERT INTO notification (user_id, title, message, type, target_role, scheduled_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, title, message, notifType, target_role || null, scheduledAt]
      );
      res.status(201).json({ message: 'Notification created successfully', recipients: 1 });

    } else if (target_role) {
      // ── Mode 2: role broadcast ─────────────────────────────────────────────
      const [recipients] = await db.execute(
        `SELECT user_id FROM user WHERE role=? AND status='active'`, [target_role]
      );
      if (recipients.length === 0) {
        return res.status(400).json({ message: `No active users found with role "${target_role}"` });
      }
      const count = await fanOut(recipients, notifType, target_role);
      res.status(201).json({ message: 'Notification created successfully', recipients: count });

    } else if (target_all) {
      // ── Mode 3: all-users broadcast ────────────────────────────────────────
      const [recipients] = await db.execute(
        `SELECT user_id FROM user WHERE status='active'`
      );
      if (recipients.length === 0) {
        return res.status(400).json({ message: 'No active users found on the platform' });
      }
      const count = await fanOut(recipients, notifType, null);
      res.status(201).json({ message: 'Notification sent to all users', recipients: count });

    } else if (course_id) {
      // ── Mode 4: course broadcast (all active students enrolled in a course) ─
      const [[course]] = await db.execute(
        `SELECT title FROM course WHERE course_id=?`, [course_id]
      );
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const [recipients] = await db.execute(
        `SELECT DISTINCT e.user_id FROM enrollment e
         JOIN user u ON e.user_id = u.user_id
         WHERE e.course_id=? AND e.status='active' AND u.status='active'`,
        [course_id]
      );
      if (recipients.length === 0) {
        return res.status(400).json({
          message: `No active enrolled students found for course "${course.title}"`
        });
      }
      const count = await fanOut(recipients, notifType, null);
      res.status(201).json({
        message: `Notification sent to enrolled students of "${course.title}"`,
        recipients: count,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Edit notification — only allowed if not yet sent
// "Not yet sent" = scheduled_at is in the future OR scheduled_at is NULL (draft/send-now pending)
// NOTE: editing only applies to single-recipient notifications. Role-broadcast notifications
// are fanned out into many rows at creation time (one per user) and are not editable as a
// group here — delete and recreate the broadcast instead.
// Only draft notifications (scheduled_at IS NULL) are editable.
exports.editNotification = async (req, res) => {
  const { id } = req.params;
  const { title, message, scheduled_at } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const [[existing]] = await db.execute(
      `SELECT notification_id, scheduled_at FROM notification WHERE notification_id=?`,
      [id]
    );
    if (!existing) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    // Only draft notifications (not yet queued) can be edited
    if (existing.scheduled_at !== null) {
      return res.status(400).json({
        message: 'Only draft notifications can be edited. Delete this notification and create a new one.'
      });
    }

    const scheduledAtNew = scheduled_at && scheduled_at.trim() !== '' ? scheduled_at : null;

    await db.execute(
      `UPDATE notification SET title=?, message=?, scheduled_at=? WHERE notification_id=?`,
      [title, message, scheduledAtNew, id]
    );
    res.json({ message: 'Notification updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification by id
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(
      `DELETE FROM notification WHERE notification_id=?`, [id]
    );
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── SHARED HELPERS (reports + logs) ─────────────────────

// Validate a YYYY-MM-DD string and build a date-range WHERE fragment on `column`.
// Returns { clause, params }; clause is '' when no valid dates are supplied.
function buildDateRange(column, startDate, endDate) {
  const clauses = [];
  const params = [];
  const isValid = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (isValid(startDate)) { clauses.push(`${column} >= ?`); params.push(`${startDate} 00:00:00`); }
  if (isValid(endDate))   { clauses.push(`${column} <= ?`); params.push(`${endDate} 23:59:59`); }
  return { clause: clauses.join(' AND '), params };
}

// ─── REPORTS ─────────────────────────────────────────────
// Spec 7.3.4 (AdminViewReports): display available report types, accept a report
// type + time period, query for data, show "No data available" when empty, then
// generate and display the report. (Save-to-DB intentionally omitted per request.)

const REPORT_TYPES = [
  { key: 'summary',            label: 'Platform Summary' },
  { key: 'student_enrollment', label: 'Student Enrollment' },
  { key: 'course_performance', label: 'Course Performance' },
  { key: 'user_registration',  label: 'User Registration' },
];

// "DISPLAY available report types"
exports.getReportTypes = async (req, res) => {
  res.json(REPORT_TYPES);
};

exports.getReports = async (req, res) => {
  const type = req.query.type || 'summary';
  const { startDate, endDate } = req.query;

  if (!REPORT_TYPES.some(r => r.key === type)) {
    return res.status(400).json({ message: `Unknown report type "${type}"` });
  }

  try {
    let payload;
    if (type === 'summary')                  payload = await buildSummaryReport(startDate, endDate);
    else if (type === 'student_enrollment')  payload = await buildEnrollmentReport(startDate, endDate);
    else if (type === 'course_performance')  payload = await buildCoursePerformanceReport(startDate, endDate);
    else if (type === 'user_registration')   payload = await buildUserRegistrationReport(startDate, endDate);

    const meta = {
      reportType: type,
      period: { startDate: startDate || null, endDate: endDate || null },
      generatedAt: new Date().toISOString(),
    };

    // "IF no data IS AVAILABLE THEN DISPLAY 'No data available for this report'"
    if (payload.isEmpty) {
      return res.json({ ...meta, isEmpty: true, message: 'No data available for this report', summary: {}, data: [] });
    }
    res.json({ ...meta, isEmpty: false, ...payload });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Platform-wide overview (also feeds the dashboard). Time period scopes the
// user/enrollment counts when supplied.
async function buildSummaryReport(startDate, endDate) {
  const reg = buildDateRange('created_at', startDate, endDate);
  const enr = buildDateRange('enrolled_at', startDate, endDate);

  const userWhere = reg.clause ? `WHERE ${reg.clause}` : '';
  const enrWhere  = enr.clause ? `WHERE ${enr.clause}` : '';

  const [[{ totalUsers }]]       = await db.execute(`SELECT COUNT(*) AS totalUsers FROM user ${userWhere}`, reg.params);
  const [[{ totalCourses }]]     = await db.execute('SELECT COUNT(*) AS totalCourses FROM course');
  const [[{ totalEnrollments }]] = await db.execute(`SELECT COUNT(*) AS totalEnrollments FROM enrollment ${enrWhere}`, enr.params);
  const [[{ activeStudents }]]   = await db.execute(
    "SELECT COUNT(*) AS activeStudents FROM user WHERE role='student' AND status='active'"
  );
  const [courseStats] = await db.execute(
    `SELECT c.title, COUNT(e.enrollment_id) AS enrollments
     FROM course c LEFT JOIN enrollment e ON c.course_id = e.course_id
     GROUP BY c.course_id ORDER BY enrollments DESC LIMIT 5`
  );

  const isEmpty = totalUsers === 0 && totalCourses === 0 && totalEnrollments === 0;
  return { isEmpty, summary: { totalUsers, totalCourses, totalEnrollments, activeStudents }, data: courseStats };
}

// Student enrollment report — one row per enrollment in the period, plus
// status breakdown.
async function buildEnrollmentReport(startDate, endDate) {
  const { clause, params } = buildDateRange('e.enrolled_at', startDate, endDate);
  const where = clause ? `WHERE ${clause}` : '';
  const [rows] = await db.execute(
    `SELECT e.enrollment_id, u.username AS student_name, u.email AS student_email,
            c.title AS course_title, e.status, e.completion_percent, e.enrolled_at
     FROM enrollment e
     JOIN user u ON e.user_id = u.user_id
     JOIN course c ON e.course_id = c.course_id
     ${where}
     ORDER BY e.enrolled_at DESC`,
    params
  );
  if (rows.length === 0) return { isEmpty: true };
  const byStatus = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  return { isEmpty: false, summary: { total: rows.length, byStatus }, data: rows };
}

// Course performance report — per-course enrollment + completion stats. Time
// period scopes which enrollments are counted.
async function buildCoursePerformanceReport(startDate, endDate) {
  const { clause, params } = buildDateRange('e.enrolled_at', startDate, endDate);
  const join = clause ? `AND ${clause}` : '';
  const [rows] = await db.execute(
    `SELECT c.course_id, c.title AS course_title, u.username AS instructor_name,
            COUNT(e.enrollment_id) AS total_enrolled,
            SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN e.status='active'    THEN 1 ELSE 0 END) AS active,
            SUM(CASE WHEN e.status='dropped'   THEN 1 ELSE 0 END) AS dropped,
            ROUND(AVG(e.completion_percent), 2) AS avg_completion
     FROM course c
     JOIN user u ON c.instructor_id = u.user_id
     LEFT JOIN enrollment e ON c.course_id = e.course_id ${join}
     GROUP BY c.course_id
     ORDER BY total_enrolled DESC`,
    params
  );
  const hasAny = rows.some(r => Number(r.total_enrolled) > 0);
  if (!hasAny) return { isEmpty: true };
  return { isEmpty: false, summary: { courses: rows.length }, data: rows };
}

// User registration report — new users in the period, grouped by role.
async function buildUserRegistrationReport(startDate, endDate) {
  const { clause, params } = buildDateRange('created_at', startDate, endDate);
  const where = clause ? `WHERE ${clause}` : '';
  const [rows] = await db.execute(
    `SELECT user_id, username, email, role, status, created_at
     FROM user ${where} ORDER BY created_at DESC`,
    params
  );
  if (rows.length === 0) return { isEmpty: true };
  const byRole = rows.reduce((acc, r) => { acc[r.role] = (acc[r.role] || 0) + 1; return acc; }, {});
  return { isEmpty: false, summary: { total: rows.length, byRole }, data: rows };
}

// Export a generated report as CSV (same types + filters as getReports).
exports.exportReports = async (req, res) => {
  const type = req.query.type || 'summary';
  const { startDate, endDate } = req.query;

  if (!REPORT_TYPES.some(r => r.key === type)) {
    return res.status(400).json({ message: `Unknown report type "${type}"` });
  }

  try {
    let rows = [];
    let headers = [];

    if (type === 'student_enrollment') {
      headers = ['enrollment_id', 'student_name', 'student_email', 'course_title', 'status', 'completion_percent', 'enrolled_at'];
      const { clause, params: p } = buildDateRange('e.enrolled_at', startDate, endDate);
      const where = clause ? `WHERE ${clause}` : '';
      [rows] = await db.execute(
        `SELECT e.enrollment_id, u.username AS student_name, u.email AS student_email,
                c.title AS course_title, e.status, e.completion_percent, e.enrolled_at
         FROM enrollment e
         JOIN user u ON e.user_id = u.user_id
         JOIN course c ON e.course_id = c.course_id
         ${where}
         ORDER BY e.enrolled_at DESC`,
        p
      );
    } else if (type === 'course_performance') {
      headers = ['course_id', 'course_title', 'instructor_name', 'total_enrolled', 'completed', 'active', 'dropped', 'avg_completion'];
      const { clause, params: p } = buildDateRange('e.enrolled_at', startDate, endDate);
      const join = clause ? `AND ${clause}` : '';
      [rows] = await db.execute(
        `SELECT c.course_id, c.title AS course_title, u.username AS instructor_name,
                COUNT(e.enrollment_id) AS total_enrolled,
                SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN e.status='active'    THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN e.status='dropped'   THEN 1 ELSE 0 END) AS dropped,
                ROUND(AVG(e.completion_percent), 2) AS avg_completion
         FROM course c
         JOIN user u ON c.instructor_id = u.user_id
         LEFT JOIN enrollment e ON c.course_id = e.course_id ${join}
         GROUP BY c.course_id
         ORDER BY total_enrolled DESC`,
        p
      );
    } else if (type === 'user_registration') {
      headers = ['user_id', 'username', 'email', 'role', 'status', 'created_at'];
      const { clause, params: p } = buildDateRange('created_at', startDate, endDate);
      const where = clause ? `WHERE ${clause}` : '';
      [rows] = await db.execute(
        `SELECT user_id, username, email, role, status, created_at FROM user ${where} ORDER BY created_at DESC`,
        p
      );
    } else {
      // summary — export course-level enrollment counts
      headers = ['title', 'enrollments'];
      const [courseStats] = await db.execute(
        `SELECT c.title, COUNT(e.enrollment_id) AS enrollments
         FROM course c LEFT JOIN enrollment e ON c.course_id = e.course_id
         GROUP BY c.course_id ORDER BY enrollments DESC`
      );
      rows = courseStats;
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No data available to export' });
    }

    if (headers.length === 0) headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map(h => toCsvValue(row[h])).join(','));
    }
    const csv = lines.join('\r\n');
    const filename = `report_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ACTIVITY LOGS ───────────────────────────────────────
// Spec 7.3.7 (AdminManageActivityLogs): list users with most recent activity,
// filter by role / date range / activity type, drill into one user's full
// history, show "No records found" when empty, and export the log as a file.

// Map UI-friendly category labels → the raw activity_type values stored in DB.
const ACTIVITY_CATEGORIES = {
  'Course Activity':     ['enroll', 'course_create'],
  'Learning Activity':   ['lesson_complete', 'quiz_submit', 'assignment_submit'],
  'Content Activity':   ['video_watch', 'page_visit', 'lesson_view'],
  'System Activity':    ['login', 'profile_update', 'user_create'],
};
const ACTIVITY_CATEGORY_KEYS = Object.keys(ACTIVITY_CATEGORIES);

// Build the shared WHERE clause for the log list / per-user / export queries.
// Supports both a raw activityType (exact match) and an activityCategory (mapped to types).
function buildActivityFilters(query) {
  const { role, activityType, activityCategory, startDate, endDate, userId } = query;
  const clauses = [];
  const params = [];
  if (userId) { clauses.push('a.user_id = ?'); params.push(userId); }
  if (role)   { clauses.push('u.role = ?');   params.push(role); }

  // Prefer category over raw type when both are supplied.
  const types = activityCategory && ACTIVITY_CATEGORIES[activityCategory]
    ? ACTIVITY_CATEGORIES[activityCategory]
    : activityType ? [activityType] : [];

  if (types.length === 1) {
    clauses.push('a.activity_type = ?');
    params.push(types[0]);
  } else if (types.length > 1) {
    clauses.push(`a.activity_type IN (${types.map(() => '?').join(',')})`);
    params.push(...types);
  }

  const dr = buildDateRange('a.created_at', startDate, endDate);
  if (dr.clause) { clauses.push(dr.clause); params.push(...dr.params); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

// Filter options for the UI dropdowns (roles + activity categories).
exports.getActivityFilters = async (req, res) => {
  res.json({
    roles:            ['student', 'instructor', 'advisor', 'admin'],
    activityTypes:   ACTIVITY_CATEGORY_KEYS,
  });
};

// Initial screen: "a list of all users with their most recent tracked activities".
exports.getActivityUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.username, u.role,
              a.activity_type AS last_activity_type,
              a.description   AS last_description,
              a.created_at    AS last_activity_at
       FROM user u
       JOIN activity_log a ON a.activity_log_id = (
         SELECT a2.activity_log_id FROM activity_log a2
         WHERE a2.user_id = u.user_id
         ORDER BY a2.created_at DESC LIMIT 1
       )
       ORDER BY a.created_at DESC`
    );
    if (rows.length === 0) {
      return res.json({ isEmpty: true, message: 'No records found', data: [] });
    }
    res.json({ isEmpty: false, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Filtered log list, and — when `userId` is supplied — that user's full
// chronological history (no row cap). Supports role / activityType / date range.
exports.getActivityLogs = async (req, res) => {
  const { where, params } = buildActivityFilters(req.query);
  const hasUser = !!req.query.userId;
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  try {
    const sql =
      `SELECT a.activity_log_id, a.user_id, a.activity_type, a.description,
              a.related_item_type, a.related_item_id, a.created_at,
              u.username, u.role
       FROM activity_log a
       JOIN user u ON a.user_id = u.user_id
       ${where}
       ORDER BY a.created_at DESC
       ${hasUser ? '' : `LIMIT ${limit}`}`;
    const [logs] = await db.execute(sql, params);
    // "IF no records MATCH filter THEN DISPLAY 'No records found'"
    if (logs.length === 0) {
      return res.json({ isEmpty: true, message: 'No records found', data: [] });
    }
    res.json({ isEmpty: false, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Escape a single CSV field per RFC 4180.
function toCsvValue(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Export the (optionally filtered) activity log as a downloadable CSV file.
// "IF admin CLICKS Export THEN GENERATE report file ... DOWNLOAD report file".
exports.exportActivityLogs = async (req, res) => {
  const { where, params } = buildActivityFilters(req.query);
  try {
    const [logs] = await db.execute(
      `SELECT a.activity_log_id, u.username, u.role, a.activity_type,
              a.description, a.related_item_type, a.related_item_id, a.created_at
       FROM activity_log a
       JOIN user u ON a.user_id = u.user_id
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );
    if (logs.length === 0) {
      return res.status(404).json({ message: 'No records found to export' });
    }
    const headers = [
      'activity_log_id', 'username', 'role', 'activity_type',
      'description', 'related_item_type', 'related_item_id', 'created_at',
    ];
    const lines = [headers.join(',')];
    for (const row of logs) {
      lines.push(headers.map(h => toCsvValue(row[h])).join(','));
    }
    const csv = lines.join('\r\n');
    const filename = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DASHBOARD ───────────────────────────────────────────
// Single endpoint that bundles everything the Admin Dashboard page shows:
// headline counts, user breakdown by role, top courses, and recent activity.

exports.getDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]]       = await db.execute('SELECT COUNT(*) AS totalUsers FROM user');
    const [[{ totalCourses }]]     = await db.execute('SELECT COUNT(*) AS totalCourses FROM course');
    const [[{ totalEnrollments }]] = await db.execute('SELECT COUNT(*) AS totalEnrollments FROM enrollment');
    const [[{ activeStudents }]]   = await db.execute(
      "SELECT COUNT(*) AS activeStudents FROM user WHERE role='student' AND status='active'"
    );
    const [usersByRole] = await db.execute(
      `SELECT role, COUNT(*) AS count FROM user GROUP BY role`
    );
    const [topCourses] = await db.execute(
      `SELECT c.title, COUNT(e.enrollment_id) AS enrollments
       FROM course c LEFT JOIN enrollment e ON c.course_id = e.course_id
       GROUP BY c.course_id ORDER BY enrollments DESC LIMIT 5`
    );
    const [recentActivity] = await db.execute(
      `SELECT a.activity_type, a.description, a.created_at, u.username, u.role
       FROM activity_log a JOIN user u ON a.user_id = u.user_id
       ORDER BY a.created_at DESC LIMIT 10`
    );
    res.json({
      stats: { totalUsers, totalCourses, totalEnrollments, activeStudents },
      usersByRole,
      topCourses,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};