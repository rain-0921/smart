const db = require('../config/db');

// ─── DASHBOARD OVERVIEW ──────────────────────────────────
exports.getDashboard = async (req, res) => {
  const userId = req.user.user_id;
  try {
    // Enrolled courses
    const [enrollments] = await db.execute(
      `SELECT e.enrollment_id, e.status, e.completion_percent, e.enrolled_at,
              c.course_id, c.title, c.description,
              u.username AS instructor_name
       FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       JOIN user u ON c.instructor_id = u.user_id
       WHERE e.user_id = ? AND e.status = 'active'`,
      [userId]
    );

    // Recent quiz scores
    const [quizScores] = await db.execute(
      `SELECT qa.score, qa.created_at, q.title AS quiz_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       WHERE qa.user_id = ? AND qa.status = 'graded'
       ORDER BY qa.created_at DESC LIMIT 5`,
      [userId]
    );

    // Upcoming deadlines
    const [deadlines] = await db.execute(
      `SELECT q.title, q.due_date, c.title AS course_title
       FROM quiz q
       JOIN course c ON q.course_id = c.course_id
       JOIN enrollment e ON e.course_id = q.course_id
       WHERE e.user_id = ? AND q.due_date > NOW()
       ORDER BY q.due_date ASC LIMIT 5`,
      [userId]
    );

    // Student profile
    const [profile] = await db.execute(
      `SELECT u.username, u.email, u.photo_url, u.department,
              sp.academic_level, sp.programme, sp.gpa, sp.is_at_risk
       FROM user u
       LEFT JOIN student_profile sp ON u.user_id = sp.user_id
       WHERE u.user_id = ?`,
      [userId]
    );

    res.json({
      profile: profile[0],
      enrollments,
      quizScores,
      deadlines
    });
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
              u.phone_number, u.photo_url,
              sp.academic_level, sp.programme, sp.learning_preferences, sp.gpa
       FROM user u
       LEFT JOIN student_profile sp ON u.user_id = sp.user_id
       WHERE u.user_id = ?`,
      [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { username, phone_number, department, academic_level, programme, learning_preferences } = req.body;
  if (!username) return res.status(400).json({ message: 'Username is required' });
  try {
    await db.execute(
      `UPDATE user SET username=?, phone_number=?, department=? WHERE user_id=?`,
      [username, phone_number || null, department || null, userId]
    );
    await db.execute(
      `UPDATE student_profile SET academic_level=?, programme=?, learning_preferences=?
       WHERE user_id=?`,
      [academic_level || null, programme || null, learning_preferences || null, userId]
    );
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description)
       VALUES (?, 'profile_update', 'Student updated their profile')`,
      [userId]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── COURSE CATALOGUE & ENROLMENT ────────────────────────
exports.getCourseCatalogue = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [courses] = await db.execute(
      `SELECT c.course_id, c.title, c.description, c.created_at,
              u.username AS instructor_name,
              (SELECT COUNT(*) FROM enrollment e2
               WHERE e2.course_id = c.course_id AND e2.user_id = ?) AS is_enrolled
       FROM course c
       JOIN user u ON c.instructor_id = u.user_id
       WHERE c.status = 'published'`,
      [userId]
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  const userId = req.user.user_id;
  const { course_id } = req.body;
  try {
    const [existing] = await db.execute(
      'SELECT enrollment_id FROM enrollment WHERE user_id=? AND course_id=?',
      [userId, course_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    await db.execute(
      "INSERT INTO enrollment (user_id, course_id, status) VALUES (?, ?, 'active')",
      [userId, course_id]
    );
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
       VALUES (?, 'enroll', 'Student enrolled in a course', 'course', ?)`,
      [userId, course_id]
    );
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── LESSONS ─────────────────────────────────────────────
exports.getCourseModules = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    // Check enrollment
    const [enrolled] = await db.execute(
      "SELECT enrollment_id FROM enrollment WHERE user_id=? AND course_id=? AND status='active'",
      [userId, courseId]
    );
    if (enrolled.length === 0) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }
    const [modules] = await db.execute(
      `SELECT m.module_id, m.title, m.description, m.sort_order,
              mp.status AS progress_status, mp.completion_percentage
       FROM module m
       LEFT JOIN module_progress mp ON mp.module_id = m.module_id AND mp.user_id = ?
       WHERE m.course_id = ?
       ORDER BY m.sort_order`,
      [userId, courseId]
    );
    for (const mod of modules) {
      const [lessons] = await db.execute(
        `SELECT lesson_id, title, content_type, content_url, content_text,
                sort_order, duration_minutes, status
         FROM lesson WHERE module_id = ? ORDER BY sort_order`,
        [mod.module_id]
      );
      mod.lessons = lessons;
    }
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.completeLesson = async (req, res) => {
  const userId = req.user.user_id;
  const { moduleId } = req.params;
  try {
    const [existing] = await db.execute(
      'SELECT * FROM module_progress WHERE user_id=? AND module_id=?',
      [userId, moduleId]
    );
    if (existing.length === 0) {
      await db.execute(
        `INSERT INTO module_progress (user_id, module_id, status, completion_percentage, last_accessed)
         VALUES (?, ?, 'in_progress', 50, NOW())`,
        [userId, moduleId]
      );
    } else {
      await db.execute(
        `UPDATE module_progress SET status='completed', completion_percentage=100,
         last_accessed=NOW(), completed_at=NOW() WHERE user_id=? AND module_id=?`,
        [userId, moduleId]
      );
    }
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
       VALUES (?, 'lesson_complete', 'Student completed a lesson', 'module', ?)`,
      [userId, moduleId]
    );
    res.json({ message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── QUIZZES ─────────────────────────────────────────────
exports.getCourseQuizzes = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    const [quizzes] = await db.execute(
      `SELECT q.quiz_id, q.title, q.description, q.due_date,
              q.time_limit_minutes, q.max_attempts, q.submission_type,
              COUNT(qa.quiz_attempt_id) AS attempts_taken
       FROM quiz q
       LEFT JOIN quiz_attempt qa ON qa.quiz_id = q.quiz_id AND qa.user_id = ?
       WHERE q.course_id = ? AND q.status = 'published'
       GROUP BY q.quiz_id`,
      [userId, courseId]
    );
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.startQuiz = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  try {
    const [quiz] = await db.execute(
      'SELECT * FROM quiz WHERE quiz_id=? AND status="published"', [quizId]
    );
    if (quiz.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    const [attempts] = await db.execute(
      'SELECT COUNT(*) AS cnt FROM quiz_attempt WHERE quiz_id=? AND user_id=?',
      [quizId, userId]
    );
    if (attempts[0].cnt >= quiz[0].max_attempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    let query = 'SELECT * FROM question WHERE quiz_id=?';
    if (quiz[0].randomize_questions) query += ' ORDER BY RAND()';
    if (quiz[0].num_questions_per_attempt) query += ` LIMIT ${quiz[0].num_questions_per_attempt}`;

    const [questions] = await db.execute(query, [quizId]);

    // Hide correct answers from student
    const safeQuestions = questions.map(q => ({
      question_id: q.question_id,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options,
      points: q.points
    }));

    const [attempt] = await db.execute(
      `INSERT INTO quiz_attempt (quiz_id, user_id, start_time, status, attempt_number)
       VALUES (?, ?, NOW(), 'in_progress',
       (SELECT COUNT(*)+1 FROM quiz_attempt qa2 WHERE qa2.quiz_id=? AND qa2.user_id=?))`,
      [quizId, userId, quizId, userId]
    );

    res.json({
      attempt_id: attempt.insertId,
      quiz: { title: quiz[0].title, time_limit_minutes: quiz[0].time_limit_minutes },
      questions: safeQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  const userId = req.user.user_id;
  const { attemptId } = req.params;
  const { answers } = req.body; // [{ question_id, user_answer }]
  try {
    const [attemptRows] = await db.execute(
      'SELECT * FROM quiz_attempt WHERE quiz_attempt_id=? AND user_id=?',
      [attemptId, userId]
    );
    if (attemptRows.length === 0) return res.status(404).json({ message: 'Attempt not found' });

    let totalScore = 0;
    let totalPoints = 0;
    const results = [];

    for (const ans of answers) {
      const [qRows] = await db.execute(
        'SELECT * FROM question WHERE question_id=?', [ans.question_id]
      );
      if (qRows.length === 0) continue;
      const question = qRows[0];
      totalPoints += question.points;

      let isCorrect = false;
      let scoreAwarded = 0;

      if (question.question_type !== 'short_answer') {
        isCorrect = ans.user_answer?.trim().toLowerCase() ===
                    question.correct_answer?.trim().toLowerCase();
        scoreAwarded = isCorrect ? question.points : 0;
        if (isCorrect) totalScore += question.points;
      }

      await db.execute(
        `INSERT INTO answer (quiz_attempt_id, question_id, user_answer, is_correct, score_awarded, feedback)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attemptId, ans.question_id, ans.user_answer || '',
         isCorrect, scoreAwarded,
         isCorrect ? 'Correct!' : (question.improvement_tip || 'Review this topic')]
      );

      results.push({
        question_text: question.question_text,
        user_answer: ans.user_answer,
        correct_answer: question.question_type !== 'short_answer' ? question.correct_answer : null,
        is_correct: isCorrect,
        score_awarded: scoreAwarded,
        feedback: isCorrect ? 'Correct!' : (question.improvement_tip || 'Review this topic')
      });
    }

    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;

    await db.execute(
      `UPDATE quiz_attempt SET status='graded', score=?, end_time=NOW()
       WHERE quiz_attempt_id=?`,
      [percentage, attemptId]
    );

    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
       VALUES (?, 'quiz_submit', ?, 'quiz_attempt', ?)`,
      [userId, `Student submitted quiz. Score: ${percentage.toFixed(1)}%`, attemptId]
    );

    res.json({ score: percentage.toFixed(1), totalScore, totalPoints, results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GRADES ──────────────────────────────────────────────
exports.getGrades = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    const [grades] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.score, qa.status, qa.created_at,
              q.title AS quiz_title, q.submission_type
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       WHERE qa.user_id = ? AND q.course_id = ?
       ORDER BY qa.created_at DESC`,
      [userId, courseId]
    );
    res.json(grades);
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
       WHERE user_id = ? OR target_role = 'student'
       ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE notification SET is_read=1 WHERE notification_id=?', [id]);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};