const db = require('../config/db');

// ─── DASHBOARD ───────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [[{ totalCourses }]] = await db.execute(
      'SELECT COUNT(*) AS totalCourses FROM course WHERE instructor_id=?', [userId]
    );
    const [[{ totalStudents }]] = await db.execute(
      `SELECT COUNT(DISTINCT e.user_id) AS totalStudents
       FROM enrollment e JOIN course c ON e.course_id = c.course_id
       WHERE c.instructor_id=? AND e.status='active'`, [userId]
    );
    const [[{ totalQuizzes }]] = await db.execute(
      `SELECT COUNT(*) AS totalQuizzes FROM quiz WHERE created_by=?`, [userId]
    );
    const [[{ pendingGrading }]] = await db.execute(
      `SELECT COUNT(*) AS pendingGrading FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       WHERE q.created_by=? AND qa.status='submitted'`, [userId]
    );
    const [recentSubmissions] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.status, qa.created_at, qa.score,
              u.username AS student_name, q.title AS quiz_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN user u ON qa.user_id = u.user_id
       WHERE q.created_by=?
       ORDER BY qa.created_at DESC LIMIT 5`, [userId]
    );
    res.json({ totalCourses, totalStudents, totalQuizzes, pendingGrading, recentSubmissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PROFILE ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.username, u.email, u.department, u.phone_number, u.photo_url,
              ip.specialization, ip.subjects_taught, ip.office_hours
       FROM user u
       LEFT JOIN instructor_profile ip ON u.user_id = ip.user_id
       WHERE u.user_id=?`, [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { username, phone_number, department, specialization, subjects_taught, office_hours } = req.body;
  if (!username) return res.status(400).json({ message: 'Username is required' });
  try {
    await db.execute(
      `UPDATE user SET username=?, phone_number=?, department=? WHERE user_id=?`,
      [username, phone_number||null, department||null, userId]
    );
    await db.execute(
      `UPDATE instructor_profile SET specialization=?, subjects_taught=?, office_hours=?
       WHERE user_id=?`,
      [specialization||null, subjects_taught||null, office_hours||null, userId]
    );
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description)
       VALUES (?, 'profile_update', 'Instructor updated their profile')`, [userId]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── COURSES ─────────────────────────────────────────────
exports.getMyCourses = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [courses] = await db.execute(
      `SELECT c.course_id, c.title, c.description, c.status, c.created_at,
              COUNT(DISTINCT e.user_id) AS enrolled_count
       FROM course c
       LEFT JOIN enrollment e ON e.course_id = c.course_id AND e.status='active'
       WHERE c.instructor_id=?
       GROUP BY c.course_id
       ORDER BY c.created_at DESC`, [userId]
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  const userId = req.user.user_id;
  const { title, description, status } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    const [result] = await db.execute(
      `INSERT INTO course (instructor_id, title, description, status) VALUES (?,?,?,?)`,
      [userId, title, description||null, status||'draft']
    );
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
       VALUES (?, 'course_create', ?, 'course', ?)`,
      [userId, `Created course: ${title}`, result.insertId]
    );
    res.status(201).json({ message: 'Course created', course_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const { title, description, status } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    // Check course has lessons before publishing
    if (status === 'published') {
      const [[{ lessonCount }]] = await db.execute(
        `SELECT COUNT(*) AS lessonCount FROM lesson l
         JOIN module m ON l.module_id = m.module_id
         WHERE m.course_id=?`, [id]
      );
      if (lessonCount === 0)
        return res.status(400).json({ message: 'Cannot publish: add at least one lesson first' });
    }
    await db.execute(
      `UPDATE course SET title=?, description=?, status=? WHERE course_id=? AND instructor_id=?`,
      [title, description||null, status, id, userId]
    );
    res.json({ message: 'Course updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  try {
    await db.execute(
      `UPDATE course SET status='archived' WHERE course_id=? AND instructor_id=?`,
      [id, userId]
    );
    res.json({ message: 'Course archived' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── MODULES ─────────────────────────────────────────────
exports.getCourseModules = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [modules] = await db.execute(
      `SELECT * FROM module WHERE course_id=? ORDER BY sort_order`, [courseId]
    );
    for (const mod of modules) {
      const [lessons] = await db.execute(
        `SELECT * FROM lesson WHERE module_id=? ORDER BY sort_order`, [mod.module_id]
      );
      mod.lessons = lessons;
    }
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createModule = async (req, res) => {
  const { courseId } = req.params;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    const [[{ maxOrder }]] = await db.execute(
      `SELECT COALESCE(MAX(sort_order),0) AS maxOrder FROM module WHERE course_id=?`, [courseId]
    );
    const [result] = await db.execute(
      `INSERT INTO module (course_id, title, description, sort_order) VALUES (?,?,?,?)`,
      [courseId, title, description||null, maxOrder+1]
    );
    res.status(201).json({ message: 'Module created', module_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  const { moduleId } = req.params;
  try {
    await db.execute(`DELETE FROM module WHERE module_id=?`, [moduleId]);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── LESSONS / MATERIALS ─────────────────────────────────
exports.createLesson = async (req, res) => {
  const { moduleId } = req.params;
  const { title, content_type, content_url, content_text, duration_minutes } = req.body;
  if (!title || !content_type)
    return res.status(400).json({ message: 'Title and content type are required' });
  try {
    const [[{ maxOrder }]] = await db.execute(
      `SELECT COALESCE(MAX(sort_order),0) AS maxOrder FROM lesson WHERE module_id=?`, [moduleId]
    );
    await db.execute(
      `INSERT INTO lesson (module_id, title, content_type, content_url, content_text,
       sort_order, duration_minutes, status)
       VALUES (?,?,?,?,?,?,'published')`,
      [moduleId, title, content_type, content_url||null, content_text||null,
       maxOrder+1, duration_minutes||null]
    );
    res.status(201).json({ message: 'Lesson created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  const { lessonId } = req.params;
  try {
    await db.execute(`DELETE FROM lesson WHERE lesson_id=?`, [lessonId]);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── QUIZZES ─────────────────────────────────────────────
exports.getCourseQuizzes = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [quizzes] = await db.execute(
      `SELECT q.*, COUNT(qq.question_id) AS question_count,
              COUNT(DISTINCT qa.quiz_attempt_id) AS attempt_count
       FROM quiz q
       LEFT JOIN question qq ON qq.quiz_id = q.quiz_id
       LEFT JOIN quiz_attempt qa ON qa.quiz_id = q.quiz_id
       WHERE q.course_id=?
       GROUP BY q.quiz_id
       ORDER BY q.created_at DESC`, [courseId]
    );
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  const { title, description, due_date, time_limit_minutes,
          max_attempts, randomize_questions, submission_type } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    const [result] = await db.execute(
      `INSERT INTO quiz (course_id, created_by, title, description, due_date,
       time_limit_minutes, max_attempts, randomize_questions, submission_type, status)
       VALUES (?,?,?,?,?,?,?,?,?,'draft')`,
      [courseId, userId, title, description||null, due_date||null,
       time_limit_minutes||null, max_attempts||1, randomize_questions||false, submission_type||'online_quiz']
    );
    res.status(201).json({ message: 'Quiz created', quiz_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { title, description, due_date, time_limit_minutes,
          max_attempts, randomize_questions, status } = req.body;
  try {
    // Check has questions before publishing
    if (status === 'published') {
      const [[{ qCount }]] = await db.execute(
        `SELECT COUNT(*) AS qCount FROM question WHERE quiz_id=?`, [quizId]
      );
      if (qCount === 0)
        return res.status(400).json({ message: 'Cannot publish: add questions first' });
    }
    await db.execute(
      `UPDATE quiz SET title=?, description=?, due_date=?, time_limit_minutes=?,
       max_attempts=?, randomize_questions=?, status=? WHERE quiz_id=?`,
      [title, description||null, due_date||null, time_limit_minutes||null,
       max_attempts||1, randomize_questions||false, status, quizId]
    );
    res.json({ message: 'Quiz updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  const { quizId } = req.params;
  try {
    await db.execute(`DELETE FROM quiz WHERE quiz_id=?`, [quizId]);
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── QUESTIONS ───────────────────────────────────────────
exports.getQuizQuestions = async (req, res) => {
  const { quizId } = req.params;
  try {
    const [questions] = await db.execute(
      `SELECT * FROM question WHERE quiz_id=? ORDER BY sort_order`, [quizId]
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addQuestion = async (req, res) => {
  const { quizId } = req.params;
  const { question_type, question_text, options, correct_answer, points, improvement_tip } = req.body;
  if (!question_type || !question_text || !correct_answer)
    return res.status(400).json({ message: 'Question type, text and correct answer are required' });
  try {
    const [[{ maxOrder }]] = await db.execute(
      `SELECT COALESCE(MAX(sort_order),0) AS maxOrder FROM question WHERE quiz_id=?`, [quizId]
    );
    await db.execute(
      `INSERT INTO question (quiz_id, question_type, question_text, options,
       correct_answer, points, improvement_tip, sort_order)
       VALUES (?,?,?,?,?,?,?,?)`,
      [quizId, question_type, question_text,
       options ? JSON.stringify(options) : null,
       correct_answer, points||1, improvement_tip||null, maxOrder+1]
    );
    res.status(201).json({ message: 'Question added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  try {
    await db.execute(`DELETE FROM question WHERE question_id=?`, [questionId]);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── STUDENT PROGRESS ────────────────────────────────────
exports.getCourseStudents = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [students] = await db.execute(
      `SELECT u.user_id, u.username, u.email,
              e.status AS enrollment_status, e.completion_percent, e.enrolled_at,
              sp.gpa, sp.is_at_risk,
              COUNT(DISTINCT qa.quiz_attempt_id) AS quizzes_taken,
              COALESCE(AVG(qa.score),0) AS avg_score
       FROM enrollment e
       JOIN user u ON e.user_id = u.user_id
       LEFT JOIN student_profile sp ON u.user_id = sp.user_id
       LEFT JOIN quiz_attempt qa ON qa.user_id = u.user_id
       WHERE e.course_id=? AND e.status='active'
       GROUP BY u.user_id
       ORDER BY avg_score ASC`, [courseId]
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GRADE ASSIGNMENTS ───────────────────────────────────
exports.getPendingSubmissions = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [submissions] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.status, qa.created_at, qa.score,
              u.username AS student_name, u.email AS student_email,
              q.title AS quiz_title, c.title AS course_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       JOIN user u ON qa.user_id = u.user_id
       WHERE q.created_by=? AND qa.status IN ('submitted','in_progress')
       ORDER BY qa.created_at ASC`, [userId]
    );
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  const { attemptId } = req.params;
  const { score, feedback } = req.body;
  if (score === undefined || score === null)
    return res.status(400).json({ message: 'Score is required' });
  try {
    await db.execute(
      `UPDATE quiz_attempt SET score=?, status='graded', end_time=NOW() WHERE quiz_attempt_id=?`,
      [score, attemptId]
    );
    if (feedback) {
      await db.execute(
        `UPDATE answer SET feedback=? WHERE quiz_attempt_id=?`, [feedback, attemptId]
      );
    }
    // Notify student
    const [attempt] = await db.execute(
      `SELECT qa.user_id, q.title FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id WHERE qa.quiz_attempt_id=?`, [attemptId]
    );
    if (attempt.length > 0) {
      await db.execute(
        `INSERT INTO notification (user_id, title, message, type)
         VALUES (?, 'Assignment Graded', ?, 'grade')`,
        [attempt[0].user_id, `Your submission for "${attempt[0].title}" has been graded. Score: ${score}%`]
      );
    }
    res.json({ message: 'Submission graded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ANALYTICS ───────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    // Average score per quiz
    const [quizStats] = await db.execute(
      `SELECT q.title, COALESCE(AVG(qa.score),0) AS avg_score,
              COUNT(qa.quiz_attempt_id) AS attempts
       FROM quiz q
       LEFT JOIN quiz_attempt qa ON qa.quiz_id = q.quiz_id AND qa.status='graded'
       WHERE q.course_id=? AND q.created_by=?
       GROUP BY q.quiz_id`, [courseId, userId]
    );
    // Enrollment over time
    const [enrollmentTrend] = await db.execute(
      `SELECT DATE(enrolled_at) AS date, COUNT(*) AS count
       FROM enrollment WHERE course_id=?
       GROUP BY DATE(enrolled_at)
       ORDER BY date ASC LIMIT 30`, [courseId]
    );
    // Completion stats
    const [[{ completed, total }]] = await db.execute(
      `SELECT
         SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
         COUNT(*) AS total
       FROM enrollment WHERE course_id=?`, [courseId]
    );
    res.json({ quizStats, enrollmentTrend, completed: completed||0, total: total||0 });
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
       WHERE user_id=? OR target_role='instructor'
       ORDER BY created_at DESC LIMIT 20`, [userId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(`UPDATE notification SET is_read=1 WHERE notification_id=?`, [id]);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};