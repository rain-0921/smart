const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ─── HELPER: Generate institution_id ─────────────────────
const prefixMap = {
  student:    'S',
  instructor: 'I',
  advisor:    'A',
  admin:      'AD'
};

async function generateInstitutionId(role) {
  const prefix = prefixMap[role];
  const [rows] = await db.execute(
    `SELECT institution_id FROM user
     WHERE institution_id LIKE ?
     ORDER BY institution_id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  if (rows.length === 0) return `${prefix}001`;
  const lastNum = parseInt(rows[0].institution_id.replace(prefix, ''), 10);
  return `${prefix}${String(lastNum + 1).padStart(3, '0')}`;
}

// REGISTER
exports.register = async (req, res) => {
  const { username, email, password, role, department, phone_number } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // Check if email already exists
    const [existing] = await db.execute(
      'SELECT user_id FROM user WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate institution_id
    const institution_id = await generateInstitutionId(role);

    // Insert user
    const [result] = await db.execute(
      `INSERT INTO user (institution_id, username, email, password_hash, role, department, phone_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [institution_id, username, email, password_hash, role, department || null, phone_number || null]
    );

    const newUserId = result.insertId;

    // Auto-create profile based on role
    if (role === 'student') {
      await db.execute(
        'INSERT INTO student_profile (user_id) VALUES (?)', [newUserId]
      );
    } else if (role === 'instructor') {
      await db.execute(
        'INSERT INTO instructor_profile (user_id) VALUES (?)', [newUserId]
      );
    }

    res.status(201).json({ message: 'Account created successfully', institution_id });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { institution_id, password } = req.body;

  if (!institution_id || !password) {
    return res.status(400).json({ message: 'ID and password are required' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM user WHERE institution_id = ?', [institution_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid ID or password' });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is inactive. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid ID or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log the login activity
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description)
       VALUES (?, 'login', ?)`,
      [user.user_id, `User ${user.username} logged in`]
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        institution_id: user.institution_id,
        username: user.username,
        email: user.email,
        role: user.role,
        photo_url: user.photo_url
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET CURRENT USER (me)
exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT user_id, username, email, role, department, photo_url, phone_number, status FROM user WHERE user_id = ?',
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};