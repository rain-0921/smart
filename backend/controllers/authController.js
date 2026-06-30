const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password, role, department, phone_number } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT user_id FROM user WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO user (username, email, password_hash, role, department, phone_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, role, department || null, phone_number || null]
    );

    const newUserId = result.insertId;

    if (role === 'student') {
      await db.execute(
        'INSERT INTO student_profile (user_id) VALUES (?)', [newUserId]
      );
    } else if (role === 'instructor') {
      await db.execute(
        'INSERT INTO instructor_profile (user_id) VALUES (?)', [newUserId]
      );
    }

    res.status(201).json({ message: 'Account created successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM user WHERE email = ?', [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is inactive. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description)
       VALUES (?, 'login', ?)`,
      [user.user_id, `User ${user.username} logged in`]
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
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