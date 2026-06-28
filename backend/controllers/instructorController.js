const db = require('../config/db');
const { inferContentType } = require('../middleware/materialUpload');

// ─── HELPER ─────────────────────────────────────────────
// Returns user_id[] for all students actively enrolled in a course.
// Used by updateCourse and updateQuiz to fan-out notifications on publish.
async function getActiveEnrolledStudents(courseId) {
  const [rows] = await db.execute(
    `SELECT user_id FROM enrollment WHERE course_id=? AND status='active'`,
    [courseId]
  );
  return rows.map(r => r.user_id);
}

// Verifies the requesting instructor owns the course identified by courseId.
// Throws 403 if not found.
async function requireCourseOwnership(courseId, userId) {
  const [[row]] = await db.execute(
    'SELECT 1 FROM course WHERE course_id=? AND instructor_id=?',
    [courseId, userId]
  );
  if (!row) throw { status: 404, message: 'Course not found' };
}

// Verifies the quiz belongs to a course owned by the requesting instructor.
// Throws 403 if not found.
async function requireQuizOwnership(quizId, userId) {
  const [[row]] = await db.execute(
    `SELECT 1 FROM quiz q JOIN course c ON q.course_id=c.course_id
     WHERE q.quiz_id=? AND c.instructor_id=?`,
    [quizId, userId]
  );
  if (!row) throw { status: 404, message: 'Quiz not found' };
}

// Verifies the question belongs to a quiz in a course owned by the requesting instructor.
async function requireQuizOwnershipByQuestion(questionId, userId) {
  const [[row]] = await db.execute(
    `SELECT 1 FROM question qq
     JOIN quiz q ON qq.quiz_id=q.quiz_id
     JOIN course c ON q.course_id=c.course_id
     WHERE qq.question_id=? AND c.instructor_id=?`,
    [questionId, userId]
  );
  if (!row) throw { status: 404, message: 'Question not found' };
}

// Verifies the feedback belongs to a quiz in a course owned by the requesting instructor.
async function requireQuizOwnershipByFeedback(feedbackId, userId) {
  const [[row]] = await db.execute(
    `SELECT 1 FROM quiz_feedback qf
     JOIN quiz q ON qf.quiz_id=q.quiz_id
     JOIN course c ON q.course_id=c.course_id
     WHERE qf.quiz_feedback_id=? AND c.instructor_id=?`,
    [feedbackId, userId]
  );
  if (!row) throw { status: 404, message: 'Feedback band not found' };
}

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

  // req.file is set by the `handlePhotoUpload` multer middleware in instructorRoutes.js.
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
      `UPDATE instructor_profile SET specialization=?, subjects_taught=?, office_hours=?
       WHERE user_id=?`,
      [specialization||null, subjects_taught||null, office_hours||null, userId]
    );
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description)
       VALUES (?, 'profile_update', 'Instructor updated their profile')`, [userId]
    );
    res.json({ message: 'Profile updated successfully', photo_url: photo_url || undefined });
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
    // Grab current status first so we know whether this is a draft -> published transition
    const [[existing]] = await db.execute(
      `SELECT status FROM course WHERE course_id=? AND instructor_id=?`, [id, userId]
    );
    if (!existing) return res.status(404).json({ message: 'Course not found' });

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

    // ── FIX: notify enrolled students when course transitions to 'published' ──
    if (status === 'published' && existing.status !== 'published') {
      const studentIds = await getActiveEnrolledStudents(id);
      if (studentIds.length > 0) {
        await Promise.all(
          studentIds.map(uid =>
            db.execute(
              `INSERT INTO notification (user_id, title, message, type, related_item_type, related_item_id)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uid, `Course Published: ${title}`,
               `The course "${title}" has been published and is now available.`,
               'course_published', 'course', id]
            )
          )
        );
      }
    }

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
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    await requireCourseOwnership(courseId, userId);
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
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createModule = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    await requireCourseOwnership(courseId, userId);
    const [[{ maxOrder }]] = await db.execute(
      `SELECT COALESCE(MAX(sort_order),0) AS maxOrder FROM module WHERE course_id=?`, [courseId]
    );
    const [result] = await db.execute(
      `INSERT INTO module (course_id, title, description, sort_order) VALUES (?,?,?,?)`,
      [courseId, title, description||null, maxOrder+1]
    );
    res.status(201).json({ message: 'Module created', module_id: result.insertId });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateModule = async (req, res) => {
  const userId = req.user.user_id;
  const { moduleId } = req.params;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    const [[row]] = await db.execute(
      `SELECT m.module_id FROM module m JOIN course c ON m.course_id=c.course_id
       WHERE m.module_id=? AND c.instructor_id=?`, [moduleId, userId]
    );
    if (!row) return res.status(404).json({ message: 'Module not found' });
    await db.execute(
      `UPDATE module SET title=?, description=? WHERE module_id=?`,
      [title, description||null, moduleId]
    );
    res.json({ message: 'Module updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  const userId = req.user.user_id;
  const { moduleId } = req.params;
  try {
    const [[row]] = await db.execute(
      `SELECT m.module_id FROM module m JOIN course c ON m.course_id=c.course_id
       WHERE m.module_id=? AND c.instructor_id=?`, [moduleId, userId]
    );
    if (!row) return res.status(404).json({ message: 'Module not found' });
    await db.execute(`DELETE FROM module WHERE module_id=?`, [moduleId]);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── LESSONS / MATERIALS ─────────────────────────────────
exports.createLesson = async (req, res) => {
  const userId = req.user.user_id;
  const { moduleId } = req.params;
  const { title, content_type, content_url, content_text, duration_minutes } = req.body;
  if (!title)
    return res.status(400).json({ message: 'Title is required' });

  try {
    // Verify the module belongs to one of this instructor's courses
    const [[mod]] = await db.execute(
      `SELECT m.module_id FROM module m JOIN course c ON m.course_id=c.course_id
       WHERE m.module_id=? AND c.instructor_id=?`, [moduleId, userId]
    );
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    let resolvedContentType = content_type;
    let resolvedContentUrl  = content_url || null;
    let resolvedContentText = content_text || null;

    if (req.file) {
      resolvedContentType = inferContentType(req.file.mimetype);
      resolvedContentUrl  = `/uploads/lessons/${req.file.filename}`;
    }

    if (!resolvedContentType)
      return res.status(400).json({ message: 'content_type is required when no file is uploaded' });

    const [[{ maxOrder }]] = await db.execute(
      `SELECT COALESCE(MAX(sort_order),0) AS maxOrder FROM lesson WHERE module_id=?`, [moduleId]
    );
    await db.execute(
      `INSERT INTO lesson (module_id, title, content_type, content_url, content_text,
       sort_order, duration_minutes, status)
       VALUES (?,?,?,?,?,?,?,'published')`,
      [moduleId, title, resolvedContentType, resolvedContentUrl, resolvedContentText,
       maxOrder+1, duration_minutes||null]
    );
    res.status(201).json({
      message: 'Lesson created',
      content_type: resolvedContentType,
      content_url: resolvedContentUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLesson = async (req, res) => {
  const userId = req.user.user_id;
  const { lessonId } = req.params;
  const { title, content_type, content_url, content_text, duration_minutes } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    const [[row]] = await db.execute(
      `SELECT l.lesson_id FROM lesson l
       JOIN module m ON l.module_id=m.module_id
       JOIN course c ON m.course_id=c.course_id
       WHERE l.lesson_id=? AND c.instructor_id=?`, [lessonId, userId]
    );
    if (!row) return res.status(404).json({ message: 'Lesson not found' });

    let resolvedContentType = content_type;
    let resolvedContentUrl  = content_url || null;
    let resolvedContentText = content_text || null;

    if (req.file) {
      resolvedContentType = inferContentType(req.file.mimetype);
      resolvedContentUrl  = `/uploads/lessons/${req.file.filename}`;
    }

    await db.execute(
      `UPDATE lesson SET title=?, content_type=?, content_url=?, content_text=?,
       duration_minutes=? WHERE lesson_id=?`,
      [title, resolvedContentType, resolvedContentUrl, resolvedContentText,
       duration_minutes||null, lessonId]
    );
    res.json({ message: 'Lesson updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  const userId = req.user.user_id;
  const { lessonId } = req.params;
  try {
    const [[row]] = await db.execute(
      `SELECT l.lesson_id FROM lesson l
       JOIN module m ON l.module_id=m.module_id
       JOIN course c ON m.course_id=c.course_id
       WHERE l.lesson_id=? AND c.instructor_id=?`, [lessonId, userId]
    );
    if (!row) return res.status(404).json({ message: 'Lesson not found' });
    await db.execute(`DELETE FROM lesson WHERE lesson_id=?`, [lessonId]);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── QUIZZES ─────────────────────────────────────────────
exports.getCourseQuizzes = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    await requireCourseOwnership(courseId, userId);
    const [quizzes] = await db.execute(
      `SELECT q.quiz_id, q.course_id, q.created_by, q.title, q.description, q.status,
              q.due_date, q.time_limit_minutes, q.max_attempts, q.randomize_questions,
              q.num_questions_per_attempt, q.submission_type, q.created_at,
              COUNT(DISTINCT qq.question_id) AS question_count,
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
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  const { title, description, due_date, time_limit_minutes,
          max_attempts, randomize_questions, submission_type,
          num_questions_per_attempt } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    await requireCourseOwnership(courseId, userId);
    const [result] = await db.execute(
      `INSERT INTO quiz (course_id, created_by, title, description, due_date,
       time_limit_minutes, max_attempts, randomize_questions, submission_type,
       num_questions_per_attempt, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,'draft')`,
      [courseId, userId, title, description||null, due_date||null,
       time_limit_minutes||null, max_attempts||1, randomize_questions||false,
       submission_type||'online_quiz', num_questions_per_attempt||null]
    );
    res.status(201).json({ message: 'Quiz created', quiz_id: result.insertId });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  const { title, description, due_date, time_limit_minutes,
          max_attempts, randomize_questions, submission_type,
          num_questions_per_attempt, status } = req.body;
  try {
    await requireQuizOwnership(quizId, userId);
    // Grab current status + course_id before update (needed for publish check + notify)
    const [[existing]] = await db.execute(
      `SELECT status, course_id FROM quiz WHERE quiz_id=?`, [quizId]
    );
    if (!existing) return res.status(404).json({ message: 'Quiz not found' });

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
       max_attempts=?, randomize_questions=?, submission_type=?,
       num_questions_per_attempt=?, status=? WHERE quiz_id=?`,
      [title, description||null, due_date||null, time_limit_minutes||null,
       max_attempts||1, randomize_questions||false, submission_type||'online_quiz',
       num_questions_per_attempt||null, status, quizId]
    );

    // ── FIX: notify enrolled students when quiz transitions to 'published' ──
    if (status === 'published' && existing.status !== 'published') {
      const studentIds = await getActiveEnrolledStudents(existing.course_id);
      if (studentIds.length > 0) {
        await Promise.all(
          studentIds.map(uid =>
            db.execute(
              `INSERT INTO notification (user_id, title, message, type, related_item_type, related_item_id)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uid, `New Quiz Available: ${title}`,
               `A new quiz "${title}" has been published in your course.`,
               'quiz_published', 'quiz', quizId]
            )
          )
        );
      }
    }

    res.json({ message: 'Quiz updated' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  try {
    await requireQuizOwnership(quizId, userId);
    await db.execute(`DELETE FROM quiz WHERE quiz_id=?`, [quizId]);
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── QUESTIONS ───────────────────────────────────────────
exports.getQuizQuestions = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  try {
    await requireQuizOwnership(quizId, userId);
    const [questions] = await db.execute(
      `SELECT * FROM question WHERE quiz_id=? ORDER BY sort_order`, [quizId]
    );
    res.json(questions);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addQuestion = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  const { question_type, question_text, options, correct_answer, points, improvement_tip } = req.body;
  if (!question_type || !question_text || !correct_answer)
    return res.status(400).json({ message: 'Question type, text and correct answer are required' });
  try {
    await requireQuizOwnership(quizId, userId);
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
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  const userId = req.user.user_id;
  const { questionId } = req.params;
  try {
    await requireQuizOwnershipByQuestion(questionId, userId);
    await db.execute(`DELETE FROM question WHERE question_id=?`, [questionId]);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an existing question — used to revise the per-question
// improvement_tip (or any other field) after the quiz has been published.
// Spec UC2.4.6 caps feedback text at 500 characters per question.
exports.updateQuestion = async (req, res) => {
  const userId = req.user.user_id;
  const { questionId } = req.params;
  const { question_type, question_text, options, correct_answer, points, improvement_tip, sort_order } = req.body;
  try {
    await requireQuizOwnershipByQuestion(questionId, userId);
    const [[existing]] = await db.execute(
      `SELECT q.question_id, COUNT(qa.quiz_attempt_id) AS attempt_count
       FROM question q
       LEFT JOIN answer a ON a.question_id = q.question_id
       LEFT JOIN quiz_attempt qa ON qa.quiz_attempt_id = a.quiz_attempt_id
       WHERE q.question_id=? GROUP BY q.question_id`, [questionId]
    );
    if (!existing) return res.status(404).json({ message: 'Question not found' });

    if (improvement_tip && String(improvement_tip).length > 500) {
      return res.status(400).json({ message: 'Improvement tip must not exceed 500 characters' });
    }

    await db.execute(
      `UPDATE question SET
        question_type = COALESCE(?, question_type),
        question_text = COALESCE(?, question_text),
        options       = COALESCE(?, options),
        correct_answer= COALESCE(?, correct_answer),
        points        = COALESCE(?, points),
        improvement_tip = ?,
        sort_order    = COALESCE(?, sort_order)
       WHERE question_id = ?`,
      [
        question_type || null,
        question_text || null,
        options ? JSON.stringify(options) : null,
        correct_answer || null,
        points ?? null,
        improvement_tip || null,
        sort_order ?? null,
        questionId
      ]
    );
    res.json({
      message: 'Question updated',
      attempted_already: existing.attempt_count > 0
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── QUIZ FEEDBACK (score-band messages) ─────────────────
exports.getQuizFeedback = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  try {
    await requireQuizOwnership(quizId, userId);
    const [feedback] = await db.execute(
      `SELECT quiz_feedback_id, quiz_id, min_score, max_score, feedback_message
       FROM quiz_feedback WHERE quiz_id=? ORDER BY min_score ASC`, [quizId]
    );
    // Warn the instructor if the quiz has already been attempted
    const [[{ attemptCount }]] = await db.execute(
      `SELECT COUNT(*) AS attemptCount FROM quiz_attempt WHERE quiz_id=?`, [quizId]
    );
    res.json({ feedback, alreadyAttempted: attemptCount > 0 });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addQuizFeedback = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  const { min_score, max_score, feedback_message } = req.body;
  if (min_score === undefined || max_score === undefined || !feedback_message)
    return res.status(400).json({ message: 'Min score, max score and message are required' });
  if (Number(min_score) > Number(max_score))
    return res.status(400).json({ message: 'Min score cannot be greater than max score' });
  if (feedback_message.length > 500)
    return res.status(400).json({ message: 'Feedback message must not exceed 500 characters' });
  try {
    await requireQuizOwnership(quizId, userId);
    const [result] = await db.execute(
      `INSERT INTO quiz_feedback (quiz_id, min_score, max_score, feedback_message)
       VALUES (?,?,?,?)`,
      [quizId, min_score, max_score, feedback_message]
    );
    res.status(201).json({ message: 'Feedback band added', quiz_feedback_id: result.insertId });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateQuizFeedback = async (req, res) => {
  const userId = req.user.user_id;
  const { feedbackId } = req.params;
  const { min_score, max_score, feedback_message } = req.body;
  if (min_score === undefined || max_score === undefined || !feedback_message)
    return res.status(400).json({ message: 'Min score, max score and message are required' });
  if (Number(min_score) > Number(max_score))
    return res.status(400).json({ message: 'Min score cannot be greater than max score' });
  if (feedback_message.length > 500)
    return res.status(400).json({ message: 'Feedback message must not exceed 500 characters' });
  try {
    await requireQuizOwnershipByFeedback(feedbackId, userId);
    await db.execute(
      `UPDATE quiz_feedback SET min_score=?, max_score=?, feedback_message=?
       WHERE quiz_feedback_id=?`,
      [min_score, max_score, feedback_message, feedbackId]
    );
    res.json({ message: 'Feedback band updated' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteQuizFeedback = async (req, res) => {
  const userId = req.user.user_id;
  const { feedbackId } = req.params;
  try {
    await requireQuizOwnershipByFeedback(feedbackId, userId);
    await db.execute(`DELETE FROM quiz_feedback WHERE quiz_feedback_id=?`, [feedbackId]);
    res.json({ message: 'Feedback band deleted' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── STUDENT PROGRESS ────────────────────────────────────
exports.getCourseStudents = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    await requireCourseOwnership(courseId, userId);
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
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Per-student drill-down: returns profile, courses with completion, full quiz
// attempt history, and assignment submissions. Authorization: the student must
// be enrolled in at least one of the requesting instructor's courses.
exports.getStudentDetail = async (req, res) => {
  const userId = req.user.user_id;
  const { studentId } = req.params;
  try {
    const [ownedRows] = await db.execute(
      `SELECT 1 FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       WHERE c.instructor_id = ? AND e.user_id = ?
       LIMIT 1`, [userId, studentId]
    );
    if (ownedRows.length === 0) {
      return res.status(403).json({ message: 'This student is not enrolled in any of your courses' });
    }

    const [[profile]] = await db.execute(
      `SELECT u.user_id, u.username, u.email, u.photo_url,
              sp.programme, sp.academic_level, sp.gpa, sp.is_at_risk,
              sp.learning_preferences
       FROM user u
       LEFT JOIN student_profile sp ON u.user_id = sp.user_id
       WHERE u.user_id = ?`, [studentId]
    );

    const [courses] = await db.execute(
      `SELECT c.course_id, c.title, c.status, e.completion_percent,
              e.enrolled_at, e.status AS enrollment_status
       FROM enrollment e
       JOIN course c ON c.course_id = e.course_id
       WHERE e.user_id = ? AND c.instructor_id = ?
       ORDER BY e.enrolled_at DESC`, [studentId, userId]
    );

    const [quizAttempts] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.quiz_id, qa.status, qa.score,
              qa.created_at, qa.end_time, q.title AS quiz_title,
              q.submission_type, c.title AS course_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       WHERE qa.user_id = ? AND c.instructor_id = ?
       ORDER BY qa.created_at DESC`, [studentId, userId]
    );

    const [submissions] = await db.execute(
      `SELECT a.answer_id, a.file_url, a.user_answer, a.score_awarded,
              a.feedback, a.created_at, q.title AS quiz_title,
              qa.status, q.submission_type, c.title AS course_title
       FROM answer a
       JOIN quiz_attempt qa ON qa.quiz_attempt_id = a.quiz_attempt_id
       JOIN quiz q ON q.quiz_id = qa.quiz_id
       JOIN course c ON c.course_id = q.course_id
       WHERE qa.user_id = ? AND c.instructor_id = ?
         AND (a.file_url IS NOT NULL OR q.submission_type IN ('file_upload','mixed'))
       ORDER BY a.created_at DESC`, [studentId, userId]
    );

    res.json({ profile, courses, quizAttempts, submissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PDF BUILDER (zero-deps, A4 portrait, Helvetica) ──────
// SPEC UC2.4.8 calls for "PDF or CSV" export of the student-progress report.
// CSV is provided by exportCourseStudents; this adds the PDF variant using
// just Node built-ins so we don't have to add a PDF library dependency.
//
// The output is a minimal but valid PDF 1.4 document. It handles a single
// page of rows in a simple table layout and overflows to additional pages.
function buildStudentsPdf(students, courseTitle) {
  const PAGE_W = 595;       // A4 width  in points
  const PAGE_H = 842;       // A4 height in points
  const MARGIN = 36;
  const ROW_H = 18;
  const HEAD_Y = 90;        // y-coordinate of the table header
  const COLS = [
    { key: 'username',          label: 'Username',          x: MARGIN,        w: 110 },
    { key: 'email',             label: 'Email',             x: MARGIN + 110,  w: 200 },
    { key: 'enrollment_status', label: 'Status',            x: MARGIN + 310,  w: 60  },
    { key: 'completion_percent',label: 'Completion %',      x: MARGIN + 370,  w: 70  },
    { key: 'avg_score',         label: 'Avg Score',         x: MARGIN + 440,  w: 55  },
    { key: 'is_at_risk',        label: 'Risk',              x: MARGIN + 495,  w: 40  },
  ];

  // Build PDF objects as a stream of `n 0 obj ... endobj`.
  const objs = [];
  const push = (body) => { objs.push(body); return objs.length; }; // 1-based id

  // 1: Catalog
  const catalogId = push('<< /Type /Catalog /Pages 2 0 R >>');
  // placeholder; fix after Pages is added

  // We will register Pages later. For now, reserve id 2.
  objs.push(null);
  const pagesId = 2;

  // Font
  const fontId = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // Helper to escape PDF strings
  const esc = (s) => String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

  // ── Render content into one or more pages ──
  const pages = []; // each page is an array of content-stream operators
  const newPage = () => {
    const ops = [];
    pages.push(ops);
    return ops;
  };

  // Page 1: title + table header
  let ops = newPage();
  ops.push('BT');
  ops.push('/F2 16 Tf');           // bold
  ops.push(`1 0 0 1 ${MARGIN} ${PAGE_H - 60} Tm`);
  ops.push(`(Student Progress Report) Tj`);
  ops.push('/F1 11 Tf');
  ops.push(`0 0 0 rg`);
  ops.push(`1 0 0 1 ${MARGIN} ${PAGE_H - 78} Tm`);
  ops.push(`(Course: ${esc(courseTitle || 'Untitled')}) Tj`);
  ops.push(`(Generated: ${esc(new Date().toISOString())}) Tj`);

  // Table header bar
  ops.push('ET');
  ops.push(`${MARGIN} ${PAGE_H - HEAD_Y - 4} ${PAGE_W - 2 * MARGIN} 18 re f`);
  ops.push(`0.93 0.9 0.85 rg`);

  ops.push('BT');
  ops.push('/F2 10 Tf');
  ops.push(`0.27 0.15 0.05 rg`);
  for (const col of COLS) {
    ops.push(`1 0 0 1 ${col.x + 4} ${PAGE_H - HEAD_Y + 5} Tm`);
    ops.push(`(${esc(col.label)}) Tj`);
  }
  ops.push('ET');

  // Rows — each row prints below the previous; new page when out of space.
  const ROW_START_Y = HEAD_Y + 14;
  let rowIndex = 0;
  const rowCapacity = Math.floor((PAGE_H - MARGIN - ROW_START_Y - ROW_H) / ROW_H);

  const printRow = (s, y) => {
    const cur = pages[pages.length - 1];
    cur.push('BT');
    cur.push('/F1 9 Tf');
    cur.push(`0 0 0 rg`);
    for (const col of COLS) {
      let v = s[col.key];
      if (col.key === 'is_at_risk') v = v ? 'YES' : 'no';
      if (col.key === 'completion_percent' || col.key === 'avg_score')
        v = v == null ? '—' : Number(v).toFixed(1);
      // truncate long values to fit column
      const txt = String(v ?? '');
      const max = Math.max(1, Math.floor((col.w - 8) / 4.5));
      const truncated = txt.length > max ? txt.slice(0, max - 1) + '…' : txt;
      cur.push(`1 0 0 1 ${col.x + 4} ${PAGE_H - y} Tm`);
      cur.push(`(${esc(truncated)}) Tj`);
    }
    cur.push('ET');
    // Row separator
    cur.push(`0.85 0.83 0.78 rg`);
    cur.push(`${MARGIN} ${PAGE_H - y - 12} ${PAGE_W - 2 * MARGIN} 0.5 re f`);
    cur.push(`0 0 0 rg`);
  };

  for (const s of students) {
    if (rowIndex > 0 && rowIndex % rowCapacity === 0) {
      // start new page with repeated header
      const newOps = newPage();
      newOps.push('BT');
      newOps.push('/F2 12 Tf');
      newOps.push(`0.27 0.15 0.05 rg`);
      newOps.push(`1 0 0 1 ${MARGIN} ${PAGE_H - 50} Tm`);
      newOps.push(`(Student Progress Report - continued) Tj`);
      newOps.push('ET');
      // table header again
      newOps.push(`${MARGIN} ${PAGE_H - HEAD_Y - 4} ${PAGE_W - 2 * MARGIN} 18 re f`);
      newOps.push(`0.93 0.9 0.85 rg`);
      newOps.push('BT');
      newOps.push('/F2 10 Tf');
      newOps.push(`0.27 0.15 0.05 rg`);
      for (const col of COLS) {
        newOps.push(`1 0 0 1 ${col.x + 4} ${PAGE_H - HEAD_Y + 5} Tm`);
        newOps.push(`(${esc(col.label)}) Tj`);
      }
      newOps.push('ET');
    }
    const pageRow = rowIndex % rowCapacity;
    printRow(s, ROW_START_Y + pageRow * ROW_H);
    rowIndex++;
  }

  // Build Page objects (one per content stream)
  const pageIds = [];
  for (let i = 0; i < pages.length; i++) {
    const contentStream = pages[i].join('\n');
    const contentObjId = push(`<< /Length ${Buffer.byteLength(contentStream, 'binary')} >>\nstream\n${contentStream}\nendstream`);
    const pageObjId = push(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentObjId} 0 R >>`);
    pageIds.push(pageObjId);
  }

  // Pages dict (now we can fill id 2)
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  // ── Serialise ──
  let body = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0]; // 1-based page object table; index 0 unused
  for (let i = 0; i < objs.length; i++) {
    offsets.push(Buffer.byteLength(body, 'binary'));
    body += `${i + 1} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(body, 'binary');
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, 'binary');
}

// Spec UC2.4.8 — export the enrolled-students progress report as PDF.
// Returns a minimal but valid PDF document so no external library is needed.
exports.exportCourseStudentsPdf = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    await requireCourseOwnership(courseId, userId);
    const [[course]] = await db.execute(
      `SELECT title FROM course WHERE course_id=?`, [courseId]
    );
    const [students] = await db.execute(
      `SELECT u.username, u.email,
              e.status AS enrollment_status,
              ROUND(e.completion_percent, 2) AS completion_percent,
              sp.gpa, sp.is_at_risk,
              COUNT(DISTINCT qa.quiz_attempt_id) AS quizzes_taken,
              ROUND(COALESCE(AVG(qa.score),0), 2) AS avg_score
       FROM enrollment e
       JOIN user u ON e.user_id = u.user_id
       LEFT JOIN student_profile sp ON u.user_id = sp.user_id
       LEFT JOIN quiz_attempt qa ON qa.user_id = u.user_id
       WHERE e.course_id = ? AND e.status = 'active'
       GROUP BY u.user_id
       ORDER BY avg_score ASC`, [courseId]
    );
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students to export' });
    }
    const pdf = buildStudentsPdf(students, course?.title || '');
    const filename = `course_${courseId}_students_${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Stream the enrolled-students list for a course as a CSV file. Spec UC2.4.8
// requires the instructor be able to export the report as PDF or CSV.
exports.exportCourseStudents = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  try {
    await requireCourseOwnership(courseId, userId);
    const [students] = await db.execute(
      `SELECT u.username, u.email,
              e.status AS enrollment_status,
              ROUND(e.completion_percent, 2) AS completion_percent,
              e.enrolled_at,
              sp.gpa,
              sp.is_at_risk,
              COUNT(DISTINCT qa.quiz_attempt_id) AS quizzes_taken,
              ROUND(COALESCE(AVG(qa.score),0), 2) AS avg_score
       FROM enrollment e
       JOIN user u ON e.user_id = u.user_id
       LEFT JOIN student_profile sp ON u.user_id = sp.user_id
       LEFT JOIN quiz_attempt qa ON qa.user_id = u.user_id
       WHERE e.course_id = ? AND e.status = 'active'
       GROUP BY u.user_id
       ORDER BY avg_score ASC`, [courseId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students to export' });
    }

    const headers = ['username', 'email', 'enrollment_status', 'completion_percent', 'enrolled_at', 'gpa', 'is_at_risk', 'quizzes_taken', 'avg_score'];
    const lines = [headers.join(',')];
    for (const s of students) {
      lines.push(headers.map(h => toCsvValue(s[h])).join(','));
    }
    const csv = lines.join('\r\n');
    const filename = `course_${courseId}_students_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// RFC 4180 CSV field escape. Duplicated locally so this controller is self-contained.
function toCsvValue(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ─── GRADE ASSIGNMENTS ───────────────────────────────────
exports.getPendingSubmissions = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [submissions] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.status, qa.created_at, qa.score,
              u.username AS student_name, u.email AS student_email,
              q.title AS quiz_title, q.submission_type, c.title AS course_title,
              MAX(a.file_url) AS file_url, MAX(a.user_answer) AS text_note
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       JOIN user u ON qa.user_id = u.user_id
       LEFT JOIN answer a ON a.quiz_attempt_id = qa.quiz_attempt_id
       WHERE c.instructor_id=? AND qa.status IN ('submitted','in_progress')
       GROUP BY qa.quiz_attempt_id
       ORDER BY qa.created_at ASC`, [userId]
    );
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  const userId = req.user.user_id;
  const { attemptId } = req.params;
  const { score, feedback } = req.body;
  if (score === undefined || score === null)
    return res.status(400).json({ message: 'Score is required' });
  try {
    // Verify this submission belongs to a quiz in one of this instructor's courses
    const [[row]] = await db.execute(
      `SELECT qa.quiz_attempt_id FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       WHERE qa.quiz_attempt_id=? AND c.instructor_id=?`,
      [attemptId, userId]
    );
    if (!row) return res.status(404).json({ message: 'Submission not found' });

    // Update the quiz_attempt score and status
    await db.execute(
      `UPDATE quiz_attempt SET score=?, status='graded', end_time=NOW() WHERE quiz_attempt_id=?`,
      [score, attemptId]
    );
    // Update all answer records for this attempt with instructor feedback
    await db.execute(
      `UPDATE answer SET feedback=? WHERE quiz_attempt_id=?`,
      [feedback || null, attemptId]
    );
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
// Accepts optional ?from=YYYY-MM-DD&to=YYYY-MM-DD to scope all metrics.
// Returns quizStats (avg score per quiz), enrollmentTrend (daily counts),
// scoreDistribution (5 buckets), submissionRate (submitted/active),
// and basic completed/total enrollment counts.
exports.getAnalytics = async (req, res) => {
  const userId = req.user.user_id;
  const { courseId } = req.params;
  const { from, to } = req.query;

  try {
    await requireCourseOwnership(courseId, userId);

    // Build a date range predicate when both endpoints provided.
    const range = [];
    let rangeClause = '';
    if (from && to) {
      range.push(from, to);
      rangeClause = 'AND DATE(qa.created_at) BETWEEN ? AND ?';
    } else if (from) {
      range.push(from);
      rangeClause = 'AND DATE(qa.created_at) >= ?';
    } else if (to) {
      range.push(to);
      rangeClause = 'AND DATE(qa.created_at) <= ?';
    }

    const enrRange = [];
    let enrRangeClause = '';
    if (from && to) { enrRange.push(from, to); enrRangeClause = 'AND DATE(enrolled_at) BETWEEN ? AND ?'; }
    else if (from) { enrRange.push(from); enrRangeClause = 'AND DATE(enrolled_at) >= ?'; }
    else if (to) { enrRange.push(to); enrRangeClause = 'AND DATE(enrolled_at) <= ?'; }

    // Average score per quiz, scoped to the date range.
    const [quizStats] = await db.execute(
      `SELECT q.title, COALESCE(AVG(qa.score),0) AS avg_score,
              COUNT(qa.quiz_attempt_id) AS attempts
       FROM quiz q
       LEFT JOIN quiz_attempt qa ON qa.quiz_id = q.quiz_id AND qa.status='graded' ${rangeClause}
       WHERE q.course_id=? AND q.created_by=?
       GROUP BY q.quiz_id`, [...range, courseId, userId]
    );

    // Daily enrollment counts (last 30 within the range).
    const [enrollmentTrend] = await db.execute(
      `SELECT DATE(enrolled_at) AS date, COUNT(*) AS count
       FROM enrollment WHERE course_id=? ${enrRangeClause}
       GROUP BY DATE(enrolled_at)
       ORDER BY date ASC LIMIT 30`, [courseId, ...enrRange]
    );

    // Score distribution: bucket graded attempts into 5 ranges.
    const [scoreDistribution] = await db.execute(
      `SELECT
         SUM(CASE WHEN score < 50 THEN 1 ELSE 0 END) AS '0_49',
         SUM(CASE WHEN score >= 50 AND score < 60 THEN 1 ELSE 0 END) AS '50_59',
         SUM(CASE WHEN score >= 60 AND score < 70 THEN 1 ELSE 0 END) AS '60_69',
         SUM(CASE WHEN score >= 70 AND score < 80 THEN 1 ELSE 0 END) AS '70_79',
         SUM(CASE WHEN score >= 80 THEN 1 ELSE 0 END) AS '80_100',
         COUNT(*) AS total
       FROM quiz_attempt qa
       JOIN quiz q ON q.quiz_id = qa.quiz_id
       WHERE q.course_id=? AND q.created_by=? AND qa.status='graded' ${rangeClause}`,
      [courseId, userId, ...range]
    );

    // Submission rate: percentage of active enrollments that have at least
    // one graded attempt.
    const [[submissionRate]] = await db.execute(
      `SELECT
         (SELECT COUNT(*) FROM enrollment WHERE course_id=? AND status='active') AS active_count,
         (SELECT COUNT(DISTINCT qa.user_id) FROM quiz_attempt qa
          JOIN quiz q ON q.quiz_id = qa.quiz_id
          WHERE q.course_id=? AND q.created_by=? AND qa.status='graded' ${rangeClause}) AS submitted_count`,
      [courseId, courseId, userId, ...range]
    );

    // Completion stats (not date-filtered — enrollment completion is cumulative).
    const [[{ completed, total }]] = await db.execute(
      `SELECT
         SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
         COUNT(*) AS total
       FROM enrollment WHERE course_id=?`, [courseId]
    );

    const dist = scoreDistribution[0] || { '0_49': 0, '50_59': 0, '60_69': 0, '70_79': 0, '80_100': 0, total: 0 };
    const submissionRatePct = submissionRate.active_count > 0
      ? Math.round((submissionRate.submitted_count / submissionRate.active_count) * 100)
      : 0;

    res.json({
      quizStats,
      enrollmentTrend,
      scoreDistribution: [
        { bucket: '0–49%',  count: Number(dist['0_49']  || 0) },
        { bucket: '50–59%', count: Number(dist['50_59'] || 0) },
        { bucket: '60–69%', count: Number(dist['60_69'] || 0) },
        { bucket: '70–79%', count: Number(dist['70_79'] || 0) },
        { bucket: '80–100%',count: Number(dist['80_100']|| 0) }
      ],
      submissionRate: { submitted: submissionRate.submitted_count, active: submissionRate.active_count, pct: submissionRatePct },
      completed: completed || 0,
      total: total || 0,
      range: { from: from || null, to: to || null }
    });
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