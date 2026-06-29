const db = require('../config/db');
const bcrypt = require('bcrypt');

// ─── SHARED VALIDATION HELPERS ─────────────────────────

const VALID_ROLES  = ['student', 'instructor', 'advisor', 'admin'];
const VALID_STATUS = ['active', 'inactive', 'suspended'];
const ENROLLMENT_STATUS = ['active', 'completed', 'dropped', 'suspended'];
const COURSE_STATUS = ['draft', 'published', 'archived'];

// Coerce any incoming scheduled_at into a value safe to bind: only accept
// strings, trim empties to null. Coercing a Date or other type to a string
// would corrupt the SQL binding — guard against that (BUG-18).
function normaliseScheduledAt(v) {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  return trimmed === '' ? null : trimmed;
}

// Email must end with @smis.edu for student accounts.
function isSmisStudentEmail(email) {
  return typeof email === 'string' && /^[^@\s]+@smis\.edu$/.test(email);
}

// Department validation: must (a) exist in the distinct list and (b) be
// non-empty when supplied. Empty/blank is treated as "no department" (null).
async function isValidDepartment(department) {
  if (department === null || department === undefined) return true;
  if (typeof department !== 'string') return false;
  const trimmed = department.trim();
  if (trimmed === '') return true;
  const [rows] = await db.execute(
    "SELECT DISTINCT department FROM user WHERE department IS NOT NULL AND department != ''"
  );
  return rows.map(r => r.department).includes(trimmed);
}

// ─── DEPARTMENTS ──────────────────────────────────────────

// Returns all distinct non-null department values already in use.
exports.getDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT DISTINCT department FROM user WHERE department IS NOT NULL AND department != '' ORDER BY department"
    );
    res.json(rows.map(r => r.department));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
  }
  // Students must use a smis.edu email
  if (role === 'student' && !isSmisStudentEmail(email)) {
    return res.status(400).json({ message: 'Student email must end with @smis.edu' });
  }
  // Phone must contain at least one digit (BUG-3 — previous regex matched '+' alone).
  if (phone_number && phone_number.trim() !== '' && !/^\+?[\d\s\-]+$/.test(phone_number)) {
    return res.status(400).json({ message: 'Phone number can only contain digits, spaces, hyphens and leading +' });
  }
  if (phone_number && phone_number.trim() !== '' && !/\d/.test(phone_number)) {
    return res.status(400).json({ message: 'Phone number must contain at least one digit' });
  }
  // Department must be from the distinct list for ANY role with a department (BUG-2).
  if (department && department.trim() !== '') {
    let ok;
    try { ok = await isValidDepartment(department); }
    catch (e) {
      console.error('[addUser] dept lookup failed', e.message);
      return res.status(500).json({ message: 'Unable to verify department' });
    }
    if (!ok) {
      return res.status(400).json({ message: 'Please select a valid department from the list' });
    }
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO user (username, email, password_hash, role, department, phone_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, role, department || null, phone_number || null]
    );
    const insertId = result.insertId;
    if (role === 'student') {
      await db.execute('INSERT IGNORE INTO student_profile (user_id) VALUES (?)', [insertId]);
    } else if (role === 'instructor') {
      await db.execute('INSERT IGNORE INTO instructor_profile (user_id) VALUES (?)', [insertId]);
    }
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('[addUser]', error.code, error.message);
    let msg = 'Server error';
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('email')) msg = 'Email already exists';
      else if (error.message.includes('username')) msg = 'Username already exists';
      else msg = 'A user with that username or email already exists';
    } else if (error.code === 'ER_NO_REFERENCED') msg = 'Invalid department. Please select a valid department.';
    else if (error.code === 'ER_NO_TABLE') msg = 'System configuration error — please contact support.';
    res.status(400).json({ message: msg });
  }
};

// Edit user
exports.editUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, department, phone_number, status } = req.body;
  const targetId = Number(id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  if (!username || !email || !role || !status) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
  }
  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUS.join(', ')}` });
  }
  // BUG-6: students must keep a smis.edu email even on edit.
  if (role === 'student' && !isSmisStudentEmail(email)) {
    return res.status(400).json({ message: 'Student email must end with @smis.edu' });
  }
  if (phone_number && phone_number.trim() !== '' && !/^\+?[\d\s\-]+$/.test(phone_number)) {
    return res.status(400).json({ message: 'Phone number can only contain digits, spaces, hyphens and leading +' });
  }
  if (phone_number && phone_number.trim() !== '' && !/\d/.test(phone_number)) {
    return res.status(400).json({ message: 'Phone number must contain at least one digit' });
  }

  try {
    // BUG-4: load current row + prevent self-edit demotion/suspension (AUTH-1).
    const [[target]] = await db.execute(
      'SELECT user_id, role, status FROM user WHERE user_id=?', [targetId]
    );
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user && Number(req.user.user_id) === targetId) {
      return res.status(400).json({ message: 'You cannot edit your own account here' });
    }
    if (target.role === 'admin' && status !== 'active') {
      // Make sure we don't lock out the system.
      const [activeAdmins] = await db.execute(
        "SELECT user_id FROM user WHERE role='admin' AND status='active'"
      );
      const others = activeAdmins.filter(r => Number(r.user_id) !== targetId);
      if (others.length === 0) {
        return res.status(400).json({ message: 'Cannot deactivate or suspend the only active admin' });
      }
    }
    if (target.role === 'admin' && role !== 'admin') {
      const [activeAdmins] = await db.execute(
        "SELECT user_id FROM user WHERE role='admin' AND status='active'"
      );
      const others = activeAdmins.filter(r => Number(r.user_id) !== targetId);
      if (others.length === 0) {
        return res.status(400).json({ message: 'Cannot demote the only active admin' });
      }
    }

    const [result] = await db.execute(
      `UPDATE user SET username=?, email=?, role=?, department=?,
       phone_number=?, status=? WHERE user_id=?`,
      [username, email, role, department || null, phone_number || null, status, targetId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('[editUser]', error.code, error.message);
    let msg = 'Failed to update user';
    if (error.code === 'ER_DUP_ENTRY')  msg = 'Email already exists';
    res.status(400).json({ message: msg });
  }
};

// Deactivate user — same last-admin guard
exports.deactivateUser = async (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  try {
    const [[target]] = await db.execute(
      'SELECT role FROM user WHERE user_id=?', [targetId]
    );
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user && Number(req.user.user_id) === targetId) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }
    if (target.role === 'admin') {
      const [activeAdmins] = await db.execute(
        "SELECT user_id FROM user WHERE role='admin' AND status='active'"
      );
      const others = activeAdmins.filter(r => Number(r.user_id) !== targetId);
      if (others.length === 0) {
        return res.status(400).json({ message: 'Cannot deactivate the only active admin' });
      }
    }
    const [result] = await db.execute(
      "UPDATE user SET status='inactive' WHERE user_id=?", [targetId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
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
  const instructorId = Number(instructor_id);
  if (!Number.isInteger(instructorId) || instructorId <= 0) {
    return res.status(400).json({ message: 'instructor_id must be a positive integer' });
  }
  // BUG-8: instructor must exist with role=instructor AND status=active.
  try {
    const [rows] = await db.execute(
      "SELECT user_id FROM user WHERE user_id=? AND role='instructor' AND status='active'", [instructorId]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Selected instructor is not an active user' });
    }
    await db.execute(
      `INSERT INTO course (title, description, instructor_id, status)
       VALUES (?, ?, ?, 'draft')`,
      [title, description || null, instructorId]
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
  const courseId = Number(id);
  const instructorId = Number(instructor_id);
  if (!Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(instructorId) || instructorId <= 0) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  if (!COURSE_STATUS.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${COURSE_STATUS.join(', ')}` });
  }
  try {
    const [instructors] = await db.execute(
      "SELECT user_id FROM user WHERE user_id=? AND role='instructor' AND status='active'", [instructorId]
    );
    if (instructors.length === 0) {
      return res.status(400).json({ message: 'Selected instructor is not an active user' });
    }
    const [result] = await db.execute(
      `UPDATE course SET title=?, description=?, status=?, instructor_id=?
       WHERE course_id=?`,
      [title, description || null, status, instructorId, courseId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.archiveCourse = async (req, res) => {
  const { id } = req.params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ message: 'Invalid course id' });
  }
  try {
    const [result] = await db.execute(
      "UPDATE course SET status='archived' WHERE course_id=?", [courseId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
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
  const userId = Number(user_id);
  const courseId = Number(course_id);
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ message: 'user_id and course_id must be positive integers' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // BUG-10: validate student + course statuses.
    const [students] = await conn.execute(
      "SELECT user_id FROM user WHERE user_id=? AND role='student' AND status='active'", [userId]
    );
    if (students.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Selected user is not an active student' });
    }
    const [courses] = await conn.execute(
      "SELECT course_id, status FROM course WHERE course_id=? AND status IN ('draft','published')", [courseId]
    );
    if (courses.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Course not found or not open for enrollment' });
    }

    // BUG-14: lock the (user_id, course_id) row to prevent duplicate-enroll race.
    const [existing] = await conn.execute(
      "SELECT enrollment_id FROM enrollment WHERE user_id=? AND course_id=? FOR UPDATE", [userId, courseId]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }
    await conn.execute(
      "INSERT INTO enrollment (user_id, course_id, status) VALUES (?, ?, 'active')",
      [userId, courseId]
    );
    await conn.commit();
    res.status(201).json({ message: 'Enrollment added successfully' });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    conn.release();
  }
};

// Edit enrollment — status is enum-validated (BUG-11). When setting
// 'completed', also auto-fill completed_at and completion_percent (BUG-13).
exports.editEnrollment = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const enrollmentId = Number(id);
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    return res.status(400).json({ message: 'Invalid enrollment id' });
  }
  if (!status || !ENROLLMENT_STATUS.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${ENROLLMENT_STATUS.join(', ')}` });
  }
  try {
    const sql = status === 'completed'
      ? 'UPDATE enrollment SET status=?, completed_at=NOW(), completion_percent=100 WHERE enrollment_id=?'
      : 'UPDATE enrollment SET status=? WHERE enrollment_id=?';
    const [result] = await db.execute(sql, [status, enrollmentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.dropEnrollment = async (req, res) => {
  const { id } = req.params;
  const enrollmentId = Number(id);
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    return res.status(400).json({ message: 'Invalid enrollment id' });
  }
  try {
    const [result] = await db.execute(
      "UPDATE enrollment SET status='dropped' WHERE enrollment_id=?", [enrollmentId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
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
  // BUG-16: more than one targeting mode → reject with 400 (instead of
  // silently letting precedence decide).
  const targetModes = [user_id, target_role, course_id, target_all].filter(v => v !== undefined && v !== null && v !== '');
  if (targetModes.length === 0) {
    return res.status(400).json({
      message: 'A target is required: user_id, target_role, course_id, or target_all'
    });
  }
  if (targetModes.length > 1) {
    return res.status(400).json({
      message: 'Specify exactly one target mode: user_id, target_role, course_id, or target_all'
    });
  }
  // Normalise notification type — default to admin_broadcast if not provided or invalid
  const VALID_TYPES = ['announcement', 'deadline', 'quiz_score', 'admin_broadcast'];
  const notifType = type && VALID_TYPES.includes(type) ? type : 'admin_broadcast';

  // BUG-18: never call .trim() on a non-string (e.g. Date object).
  const scheduledAt = normaliseScheduledAt(scheduled_at);

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
      // BUG-15: validate recipient existence + active status.
      const userId = Number(user_id);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: 'user_id must be a positive integer' });
      }
      const [recipients] = await db.execute(
        "SELECT user_id FROM user WHERE user_id=? AND status='active'", [userId]
      );
      if (recipients.length === 0) {
        return res.status(400).json({ message: 'Recipient user not found or inactive' });
      }
      await db.execute(
        `INSERT INTO notification (user_id, title, message, type, target_role, scheduled_at)
         VALUES (?, ?, ?, ?, NULL, ?)`,
        [userId, title, message, notifType, scheduledAt]
      );
      res.status(201).json({ message: 'Notification created successfully', recipients: 1 });

    } else if (target_role) {
      // ── Mode 2: role broadcast ─────────────────────────────────────────────
      if (!VALID_ROLES.includes(target_role)) {
        return res.status(400).json({ message: `Invalid target_role. Must be one of: ${VALID_ROLES.join(', ')}` });
      }
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
      const courseId = Number(course_id);
      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: 'course_id must be a positive integer' });
      }
      const [[course]] = await db.execute(
        `SELECT title FROM course WHERE course_id=?`, [courseId]
      );
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const [recipients] = await db.execute(
        `SELECT DISTINCT e.user_id FROM enrollment e
         JOIN user u ON e.user_id = u.user_id
         WHERE e.course_id=? AND e.status='active' AND u.status='active'`,
        [courseId]
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
    if (error.code === 'ER_NO_REFERENCED' || error.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ message: 'Invalid recipient reference' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Edit notification — only allowed if not yet sent
// "Not yet sent" = scheduled_at IS NULL OR scheduled_at > NOW()
// i.e. drafts (send-now pending) and future-scheduled ones. Sent notifications
// cannot be edited.
exports.editNotification = async (req, res) => {
  const { id } = req.params;
  const { title, message, scheduled_at } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  const notifId = Number(id);
  if (!Number.isInteger(notifId) || notifId <= 0) {
    return res.status(400).json({ message: 'Invalid notification id' });
  }

  try {
    const [[existing]] = await db.execute(
      `SELECT notification_id, scheduled_at FROM notification WHERE notification_id=?`,
      [notifId]
    );
    if (!existing) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    // Edit only drafts (IS NULL) AND future-scheduled. Already-sent rows immutable.
    const scheduled = existing.scheduled_at;
    const isDraft = scheduled === null;
    const isFuture = scheduled !== null && new Date(scheduled) > new Date();
    if (!isDraft && !isFuture) {
      return res.status(400).json({
        message: 'Only draft or future-scheduled notifications can be edited. Delete this notification and create a new one.'
      });
    }

    const scheduledAtNew = normaliseScheduledAt(scheduled_at);

    const [result] = await db.execute(
      `UPDATE notification SET title=?, message=?, scheduled_at=? WHERE notification_id=?`,
      [title, message, scheduledAtNew, notifId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification by id
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  const notifId = Number(id);
  if (!Number.isInteger(notifId) || notifId <= 0) {
    return res.status(400).json({ message: 'Invalid notification id' });
  }
  try {
    const [result] = await db.execute(
      `DELETE FROM notification WHERE notification_id=?`, [notifId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── SHARED HELPERS (reports + logs) ─────────────────────
// (normaliseScheduledAt and isValidDepartment live at the top of the file.)

// Validate a YYYY-MM-DD string and build a date-range WHERE fragment on `column`.
// Returns { clause, params }; clause is '' when no valid dates are supplied.
// BUG-22: rejects inverted ranges (start > end) at the source.
// BUG-23: capping to "today" is delegated to SQL via NOW() — JS date is
// timezone-naive and can be off by a day.
function buildDateRange(column, startDate, endDate) {
  const clauses = [];
  const params = [];
  const isValid = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
  const s = isValid(startDate) ? startDate : null;
  const e = isValid(endDate)   ? endDate   : null;
  if (s && e && s > e) {
    const err = new Error('Invalid date range: startDate is after endDate');
    err.statusCode = 400;
    throw err;
  }
  if (s) { clauses.push(`${column} >= ?`); params.push(`${s} 00:00:00`); }
  if (e) { clauses.push(`${column} <= ?`); params.push(`${e} 23:59:59`); }
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
    try {
      if (type === 'summary')                  payload = await buildSummaryReport(startDate, endDate);
      else if (type === 'student_enrollment')  payload = await buildEnrollmentReport(startDate, endDate);
      else if (type === 'course_performance')  payload = await buildCoursePerformanceReport(startDate, endDate);
      else if (type === 'user_registration')   payload = await buildUserRegistrationReport(startDate, endDate);
    } catch (e) {
      if (e && e.statusCode === 400) {
        return res.status(400).json({ message: e.message });
      }
      throw e;
    }

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

  // BUG-24: also treat top-courses emptiness as "empty summary".
  const hasCourses = courseStats.some(c => Number(c.enrollments) > 0);
  const isEmpty = (Number(totalUsers) === 0 && Number(totalEnrollments) === 0) || !hasCourses;
  return {
    isEmpty,
    summary: { totalUsers, totalCourses, totalEnrollments, activeStudents },
    data: courseStats,
  };
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

    try {
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
    } catch (e) {
      if (e && e.statusCode === 400) {
        return res.status(400).json({ message: e.message });
      }
      throw e;
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
// LEFT JOIN so users with zero activity still appear (BUG-29); tie-break on user_id
// for deterministic ordering across pages.
exports.getActivityUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.username, u.role,
              a.activity_type AS last_activity_type,
              a.description   AS last_description,
              a.created_at    AS last_activity_at
       FROM user u
       LEFT JOIN activity_log a ON a.activity_log_id = (
         SELECT a2.activity_log_id FROM activity_log a2
         WHERE a2.user_id = u.user_id
         ORDER BY a2.created_at DESC LIMIT 1
       )
       ORDER BY a.created_at IS NULL, a.created_at DESC, u.user_id ASC`
    );
    if (rows.length === 0) {
      return res.json({ isEmpty: true, message: 'No users found', data: [] });
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

// ─── ADVISOR ASSIGNMENT ─────────────────────────────────

// Get all students with their current advisor (for the admin assignment table).
exports.getAllStudentsWithAdvisor = async (req, res) => {
  try {
    const [students] = await db.execute(
      `SELECT sp.user_id, u.username, u.email, u.department, u.status,
              sp.advisor_id,
              a.username AS advisor_name, a.email AS advisor_email
       FROM student_profile sp
       JOIN user u ON sp.user_id = u.user_id
       LEFT JOIN user a ON sp.advisor_id = a.user_id
       ORDER BY u.username ASC`
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all advisors (active users with role='advisor') for the dropdown.
exports.getAllAdvisors = async (req, res) => {
  try {
    const [advisors] = await db.execute(
      `SELECT user_id, username, email, department, status
       FROM user
       WHERE role = 'advisor' AND status = 'active'
       ORDER BY username ASC`
    );
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign (or reassign / unassign) an advisor to a student.
exports.assignAdvisor = async (req, res) => {
  const { studentId } = req.params;
  const { advisor_id } = req.body;

  // Normalise "clear/unset" to null.
  const newAdvisorId = (advisor_id === null || advisor_id === undefined || advisor_id === '') ? null : Number(advisor_id);

  if (advisor_id !== null && advisor_id !== undefined && advisor_id !== '' && !Number.isInteger(newAdvisorId)) {
    return res.status(400).json({ message: 'advisor_id must be an integer or null' });
  }

  try {
    const [students] = await db.execute(
      "SELECT user_id FROM user WHERE user_id=? AND role='student'", [studentId]
    );
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (newAdvisorId !== null) {
      const [advisors] = await db.execute(
        "SELECT user_id FROM user WHERE user_id=? AND role='advisor' AND status='active'", [newAdvisorId]
      );
      if (advisors.length === 0) {
        return res.status(400).json({ message: 'Selected user is not an active advisor' });
      }
    }

    const [result] = await db.execute(
      'UPDATE student_profile SET advisor_id = ? WHERE user_id = ?',
      [newAdvisorId, studentId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const msg = newAdvisorId ? 'Advisor assigned successfully' : 'Advisor unassigned';
    res.json({ message: msg });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DASHBOARD ───────────────────────────────────────────

// Single endpoint that bundles everything the Admin Dashboard page shows:
// headline counts, user breakdown by role, top courses, and recent activity.
// BUG-40: fan out via Promise.all instead of serialising 9 round-trips.
exports.getDashboard = async (req, res) => {
  try {
    const [
      [userTotal],
      [courseTotal],
      [enrollmentTotal],
      [activeStudents],
      [usersByRole],
      [topCourses],
      [recentActivity],
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) AS totalUsers FROM user'),
      db.execute('SELECT COUNT(*) AS totalCourses FROM course'),
      db.execute('SELECT COUNT(*) AS totalEnrollments FROM enrollment'),
      db.execute("SELECT COUNT(*) AS activeStudents FROM user WHERE role='student' AND status='active'"),
      db.execute('SELECT role, COUNT(*) AS count FROM user GROUP BY role'),
      db.execute(
        `SELECT c.title, COUNT(e.enrollment_id) AS enrollments
         FROM course c LEFT JOIN enrollment e ON c.course_id = e.course_id
         GROUP BY c.course_id ORDER BY enrollments DESC LIMIT 5`
      ),
      db.execute(
        `SELECT a.activity_type, a.description, a.created_at, u.username, u.role
         FROM activity_log a JOIN user u ON a.user_id = u.user_id
         ORDER BY a.created_at DESC LIMIT 10`
      ),
    ]);

    res.json({
      stats: {
        totalUsers:       userTotal[0].totalUsers,
        totalCourses:     courseTotal[0].totalCourses,
        totalEnrollments: enrollmentTotal[0].totalEnrollments,
        activeStudents:   activeStudents[0].activeStudents,
      },
      usersByRole,
      topCourses,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};