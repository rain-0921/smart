const db = require('../config/db');
const path = require('path');
const fs = require('fs');

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
              sp.academic_level, sp.programme, sp.learning_preferences, sp.gpa,
              sp.is_at_risk,
              adv.username AS advisor_name, adv.email AS advisor_email
       FROM user u
       LEFT JOIN student_profile sp ON u.user_id = sp.user_id
       LEFT JOIN user adv ON sp.advisor_id = adv.user_id
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

    // Look up the score-band feedback message for this quiz (if the instructor configured any)
    const [bandRows] = await db.execute(
      `SELECT feedback_message FROM quiz_feedback
       WHERE quiz_id=? AND ? BETWEEN min_score AND max_score
       ORDER BY min_score DESC LIMIT 1`,
      [attemptRows[0].quiz_id, percentage]
    );
    const overallFeedback = bandRows.length > 0 ? bandRows[0].feedback_message : null;

    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
       VALUES (?, 'quiz_submit', ?, 'quiz_attempt', ?)`,
      [userId, `Student submitted quiz. Score: ${percentage.toFixed(1)}%`, attemptId]
    );

    res.json({ score: percentage.toFixed(1), totalScore, totalPoints, overallFeedback, results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ASSIGNMENT FILE SUBMISSION ──────────────────────────
// Returns the file_upload / mixed assignment plus the student's existing submission (if any)
exports.getAssignment = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  try {
    const [quizRows] = await db.execute(
      `SELECT q.quiz_id, q.title, q.description, q.due_date, q.submission_type, q.status
       FROM quiz q WHERE q.quiz_id=?`, [quizId]
    );
    if (quizRows.length === 0) return res.status(404).json({ message: 'Assignment not found' });
    const quiz = quizRows[0];

    if (quiz.submission_type === 'online_quiz') {
      return res.status(400).json({ message: 'This is not a file-upload assignment' });
    }

    // The prompt question this assignment's file answer attaches to
    const [questions] = await db.execute(
      `SELECT question_id, question_text FROM question WHERE quiz_id=? ORDER BY sort_order LIMIT 1`,
      [quizId]
    );

    // Latest attempt + submitted file for this student
    const [attempts] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.status, qa.score, qa.created_at, qa.end_time,
              a.file_url, a.feedback
       FROM quiz_attempt qa
       LEFT JOIN answer a ON a.quiz_attempt_id = qa.quiz_attempt_id
       WHERE qa.quiz_id=? AND qa.user_id=?
       ORDER BY qa.attempt_number DESC LIMIT 1`,
      [quizId, userId]
    );

    const now = new Date();
    const isClosed = quiz.due_date && new Date(quiz.due_date) < now;

    res.json({
      quiz,
      question: questions[0] || null,
      submission: attempts[0] || null,
      deadline_passed: !!isClosed
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload (or resubmit) an assignment file. Multipart: field "file" + optional "text_note"
exports.submitAssignment = async (req, res) => {
  const userId = req.user.user_id;
  const { quizId } = req.params;
  const textNote = req.body.text_note || null;

  // Helper to delete the just-uploaded file if we must reject the request
  const cleanupUpload = () => {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  };

  if (!req.file) {
    return res.status(400).json({ message: 'A file is required for submission' });
  }

  try {
    const [quizRows] = await db.execute(
      `SELECT quiz_id, title, due_date, submission_type, status FROM quiz WHERE quiz_id=?`,
      [quizId]
    );
    if (quizRows.length === 0) {
      cleanupUpload();
      return res.status(404).json({ message: 'Assignment not found' });
    }
    const quiz = quizRows[0];

    if (quiz.submission_type === 'online_quiz') {
      cleanupUpload();
      return res.status(400).json({ message: 'This assignment does not accept file uploads' });
    }
    if (quiz.status !== 'published') {
      cleanupUpload();
      return res.status(400).json({ message: 'This assignment is not open for submission' });
    }

    // Deadline control — reject if the due date has passed
    if (quiz.due_date && new Date(quiz.due_date) < new Date()) {
      cleanupUpload();
      return res.status(400).json({ message: 'The deadline has passed. Submission is closed.' });
    }

    // Student must be enrolled in the course this assignment belongs to
    const [enrolled] = await db.execute(
      `SELECT e.enrollment_id
       FROM enrollment e
       JOIN quiz q ON q.course_id = e.course_id
       WHERE q.quiz_id=? AND e.user_id=? AND e.status='active'`,
      [quizId, userId]
    );
    if (enrolled.length === 0) {
      cleanupUpload();
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // The prompt question to attach the file answer to
    const [questions] = await db.execute(
      `SELECT question_id FROM question WHERE quiz_id=? ORDER BY sort_order LIMIT 1`, [quizId]
    );
    if (questions.length === 0) {
      cleanupUpload();
      return res.status(400).json({ message: 'This assignment has no submission prompt configured' });
    }
    const questionId = questions[0].question_id;

    const fileUrl = `/uploads/${req.file.filename}`;

    // Resubmission: reuse the latest non-graded attempt and overwrite the previous file
    const [existing] = await db.execute(
      `SELECT quiz_attempt_id FROM quiz_attempt
       WHERE quiz_id=? AND user_id=? AND status IN ('in_progress','submitted')
       ORDER BY attempt_number DESC LIMIT 1`,
      [quizId, userId]
    );

    let attemptId;
    if (existing.length > 0) {
      attemptId = existing[0].quiz_attempt_id;

      // Remove the previously uploaded file before overwriting
      const [oldAns] = await db.execute(
        `SELECT file_url FROM answer WHERE quiz_attempt_id=? AND question_id=?`,
        [attemptId, questionId]
      );
      if (oldAns.length > 0 && oldAns[0].file_url) {
        const oldPath = path.join(__dirname, '..', oldAns[0].file_url.replace(/^\//, ''));
        fs.unlink(oldPath, () => {});
        await db.execute(
          `UPDATE answer SET user_answer=?, file_url=? WHERE quiz_attempt_id=? AND question_id=?`,
          [textNote, fileUrl, attemptId, questionId]
        );
      } else {
        await db.execute(
          `INSERT INTO answer (quiz_attempt_id, question_id, user_answer, file_url)
           VALUES (?, ?, ?, ?)`,
          [attemptId, questionId, textNote, fileUrl]
        );
      }
      await db.execute(
        `UPDATE quiz_attempt SET status='submitted', end_time=NOW() WHERE quiz_attempt_id=?`,
        [attemptId]
      );
    } else {
      // First submission
      const [attempt] = await db.execute(
        `INSERT INTO quiz_attempt (quiz_id, user_id, start_time, end_time, status, attempt_number)
         VALUES (?, ?, NOW(), NOW(), 'submitted',
         (SELECT COUNT(*)+1 FROM quiz_attempt qa2 WHERE qa2.quiz_id=? AND qa2.user_id=?))`,
        [quizId, userId, quizId, userId]
      );
      attemptId = attempt.insertId;
      await db.execute(
        `INSERT INTO answer (quiz_attempt_id, question_id, user_answer, file_url)
         VALUES (?, ?, ?, ?)`,
        [attemptId, questionId, textNote, fileUrl]
      );
    }

    // Notify the instructor of the new submission
    const [instr] = await db.execute(
      `SELECT q.created_by, q.title FROM quiz q WHERE q.quiz_id=?`, [quizId]
    );
    if (instr.length > 0) {
      await db.execute(
        `INSERT INTO notification (user_id, title, message, type, related_item_type, related_item_id)
         VALUES (?, 'New Submission', ?, 'submission', 'quiz_attempt', ?)`,
        [instr[0].created_by, `A student submitted "${instr[0].title}".`, attemptId]
      );
    }

    // Confirmation notification for the student themselves
    await db.execute(
      `INSERT INTO notification (user_id, title, message, type, related_item_type, related_item_id)
       VALUES (?, 'Submission Confirmed', ?, 'submission_confirm', 'quiz_attempt', ?)`,
      [userId, `Your submission for "${quiz.title}" has been received and is pending review.`, attemptId]
    );

    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
       VALUES (?, 'assignment_submit', ?, 'quiz_attempt', ?)`,
      [userId, `Submitted assignment "${quiz.title}"`, attemptId]
    );

    res.status(201).json({
      message: 'Assignment submitted successfully',
      attempt_id: attemptId,
      file_url: fileUrl,
      status: 'Submitted'
    });
  } catch (error) {
    cleanupUpload();
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
// ─── PROGRESS TRACKING (UC7) ─────────────────────────────
// Returns per-course completion, quiz performance, GPA and recommended next steps.
exports.getProgress = async (req, res) => {
  const userId = req.user.user_id;
  try {
    // ── 1. GPA & at-risk flag ──────────────────────────────
    const [profileRows] = await db.execute(
      `SELECT gpa, is_at_risk FROM student_profile WHERE user_id = ?`,
      [userId]
    );
    const profile = profileRows[0] || { gpa: null, is_at_risk: false };

    // ── 2. Enrolled courses with overall completion % ──────
    const [courses] = await db.execute(
      `SELECT e.enrollment_id, e.course_id, e.completion_percent, e.status AS enrollment_status,
              c.title AS course_title,
              u.username AS instructor_name
       FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       JOIN user u ON c.instructor_id = u.user_id
       WHERE e.user_id = ? AND e.status IN ('active','completed')
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    // ── 3. Module progress per course ─────────────────────
    for (const course of courses) {
      const [modules] = await db.execute(
        `SELECT m.module_id, m.title,
                COALESCE(mp.status, 'not_started') AS status,
                COALESCE(mp.completion_percentage, 0) AS completion_percentage,
                mp.completed_at
         FROM module m
         LEFT JOIN module_progress mp ON mp.module_id = m.module_id AND mp.user_id = ?
         WHERE m.course_id = ?
         ORDER BY m.sort_order`,
        [userId, course.course_id]
      );
      course.modules = modules;

      // Recompute course-level completion from modules
      const total = modules.length;
      const done  = modules.filter(m => m.status === 'completed').length;
      course.module_completion_percent = total > 0
        ? parseFloat(((done / total) * 100).toFixed(2))
        : 0;
    }

    // ── 4. Quiz performance summary ────────────────────────
    const [quizStats] = await db.execute(
      `SELECT q.course_id,
              COUNT(DISTINCT qa.quiz_attempt_id)           AS attempts_count,
              AVG(qa.score)                                AS avg_score,
              MAX(qa.score)                                AS best_score
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       WHERE qa.user_id = ? AND qa.status IN ('graded','submitted')
       GROUP BY q.course_id`,
      [userId]
    );
    const quizMap = {};
    for (const s of quizStats) quizMap[s.course_id] = s;

    for (const course of courses) {
      course.quiz_stats = quizMap[course.course_id] || {
        attempts_count: 0, avg_score: null, best_score: null
      };
    }

    // ── 5. Recommended next steps ──────────────────────────
    // Find the first incomplete module across all active courses
    const recommendations = [];
    for (const course of courses) {
      if (course.enrollment_status !== 'active') continue;
      const nextModule = course.modules.find(m => m.status !== 'completed');
      if (nextModule) {
        recommendations.push({
          course_id: course.course_id,
          course_title: course.course_title,
          next_module_id: nextModule.module_id,
          next_module_title: nextModule.title,
          message: `Continue "${nextModule.title}" in ${course.course_title}`
        });
      }

      // Flag upcoming quizzes not yet attempted
      const [upcoming] = await db.execute(
        `SELECT q.quiz_id, q.title, q.due_date
         FROM quiz q
         WHERE q.course_id = ? AND q.status = 'published'
           AND (q.due_date IS NULL OR q.due_date > NOW())
           AND q.quiz_id NOT IN (
               SELECT qa.quiz_id FROM quiz_attempt qa WHERE qa.user_id = ?
           )
         ORDER BY q.due_date ASC LIMIT 3`,
        [course.course_id, userId]
      );
      for (const q of upcoming) {
        recommendations.push({
          course_id: course.course_id,
          course_title: course.course_title,
          quiz_id: q.quiz_id,
          quiz_title: q.title,
          due_date: q.due_date,
          message: `Attempt quiz "${q.title}" in ${course.course_title}`
        });
      }
    }

    res.json({
      gpa: profile.gpa,
      is_at_risk: !!profile.is_at_risk,
      courses,
      recommendations: recommendations.slice(0, 5) // top 5
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GRADE DETAIL WITH FEEDBACK (UC8) ────────────────────
// Returns full breakdown for one quiz attempt: each question, student answer,
// correct answer, score awarded, per-question feedback, and instructor comments.
exports.getGradeDetail = async (req, res) => {
  const userId = req.user.user_id;
  const { attemptId } = req.params;
  try {
    // Verify this attempt belongs to the requesting student
    const [attemptRows] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.quiz_id, qa.score, qa.status,
              qa.start_time, qa.end_time,
              q.title AS quiz_title, q.submission_type,
              c.title AS course_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       WHERE qa.quiz_attempt_id = ? AND qa.user_id = ?`,
      [attemptId, userId]
    );
    if (attemptRows.length === 0) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    const attempt = attemptRows[0];

    // Status-gating: don't reveal answers while still in_progress
    if (attempt.status === 'in_progress') {
      return res.status(400).json({ message: 'Quiz is still in progress' });
    }

    // Pending / ungraded — return high-level status only
    if (attempt.status === 'submitted') {
      return res.json({
        attempt_id: attempt.quiz_attempt_id,
        quiz_title: attempt.quiz_title,
        course_title: attempt.course_title,
        status: 'pending',
        message: 'This submission is awaiting instructor review.',
        score: null,
        answers: []
      });
    }

    // Graded — return full per-question breakdown
    const [answers] = await db.execute(
      `SELECT a.answer_id,
              a.question_id,
              q.question_text,
              q.question_type,
              q.options,
              q.points                        AS max_points,
              a.user_answer,
              CASE WHEN q.question_type = 'short_answer' THEN NULL
                   ELSE q.correct_answer END   AS correct_answer,
              a.is_correct,
              a.score_awarded,
              a.feedback                       AS auto_feedback,
              a.file_url,
              u.username                       AS graded_by
       FROM answer a
       JOIN question q ON a.question_id = q.question_id
       LEFT JOIN user u ON a.graded_by_user_id = u.user_id
       WHERE a.quiz_attempt_id = ?
       ORDER BY q.sort_order`,
      [attemptId]
    );

    // Score-band overall feedback (if configured by instructor)
    const [bandRows] = await db.execute(
      `SELECT feedback_message FROM quiz_feedback
       WHERE quiz_id = ? AND ? BETWEEN min_score AND max_score
       ORDER BY min_score DESC LIMIT 1`,
      [attempt.quiz_id, attempt.score || 0]
    );

    res.json({
      attempt_id: attempt.quiz_attempt_id,
      quiz_title: attempt.quiz_title,
      course_title: attempt.course_title,
      status: attempt.status,
      score: attempt.score,
      start_time: attempt.start_time,
      end_time: attempt.end_time,
      overall_feedback: bandRows.length > 0 ? bandRows[0].feedback_message : null,
      answers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ACTIVITY LOGGING ─────────────────────────────────────
// Logs page_visit and video_watch activity for the admin activity log.
// Allowed types: page_visit | video_watch
exports.logActivity = async (req, res) => {
  const userId = req.user.user_id;
  const { activity_type, description, related_item_type, related_item_id } = req.body;

  const ALLOWED = ['page_visit', 'video_watch'];
  if (!activity_type || !ALLOWED.includes(activity_type)) {
    return res.status(400).json({ message: 'Invalid activity_type' });
  }

  try {
    await db.execute(
      `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, activity_type, description || null, related_item_type || null, related_item_id || null]
    );
    res.json({ message: 'Activity logged' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};