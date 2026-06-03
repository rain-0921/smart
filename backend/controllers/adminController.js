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

// ─── REPORTS ─────────────────────────────────────────────

exports.getReports = async (req, res) => {
  try {
    const [[{ totalUsers }]]       = await db.execute('SELECT COUNT(*) AS totalUsers FROM user');
    const [[{ totalCourses }]]     = await db.execute('SELECT COUNT(*) AS totalCourses FROM course');
    const [[{ totalEnrollments }]] = await db.execute('SELECT COUNT(*) AS totalEnrollments FROM enrollment');
    const [[{ activeStudents }]]   = await db.execute(
      "SELECT COUNT(*) AS activeStudents FROM user WHERE role='student' AND status='active'"
    );
    const [courseStats] = await db.execute(
      `SELECT c.title, COUNT(e.enrollment_id) AS enrollments
       FROM course c LEFT JOIN enrollment e ON c.course_id = e.course_id
       GROUP BY c.course_id ORDER BY enrollments DESC LIMIT 5`
    );
    res.json({ totalUsers, totalCourses, totalEnrollments, activeStudents, courseStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ACTIVITY LOGS ───────────────────────────────────────

exports.getActivityLogs = async (req, res) => {
  try {
    const [logs] = await db.execute(
      `SELECT a.activity_log_id, a.activity_type, a.description,
              a.related_item_type, a.created_at, u.username, u.role
       FROM activity_log a
       JOIN user u ON a.user_id = u.user_id
       ORDER BY a.created_at DESC LIMIT 100`
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};