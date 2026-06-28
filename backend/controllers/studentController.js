const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Expands an array into a comma-separated list of '?' placeholders for IN() clauses.
const inPlaceholders = (arr) => arr.map(() => '?').join(',');

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

    // Upcoming deadlines — quizzes/assignments not yet closed for this student.
    // Shows everything still actionable: untouched quizzes, in-progress attempts,
    // and submitted-but-awaiting-grading assignments so the student can still
    // see "View Result" once the instructor finishes grading.
    const [deadlines] = await db.execute(
      `SELECT q.quiz_id, q.course_id, q.title, q.due_date,
              q.submission_type, q.time_limit_minutes, q.max_attempts,
              att.quiz_attempt_id     AS latest_attempt_id,
              att.status             AS latest_attempt_status,
              att.score              AS latest_score,
              att.created_at         AS latest_attempt_at,
              c.title                AS course_title
       FROM quiz q
       JOIN course c ON q.course_id = c.course_id
       JOIN enrollment e ON e.course_id = q.course_id
       LEFT JOIN (
         SELECT qa.quiz_id, qa.user_id, qa.quiz_attempt_id, qa.status, qa.score, qa.created_at
         FROM quiz_attempt qa
         WHERE qa.quiz_attempt_id = (
           SELECT qa2.quiz_attempt_id FROM quiz_attempt qa2
           WHERE qa2.quiz_id = qa.quiz_id AND qa2.user_id = qa.user_id
           ORDER BY qa2.quiz_attempt_id DESC LIMIT 1
         )
       ) att ON att.quiz_id = q.quiz_id AND att.user_id = ?
       WHERE e.user_id = ?
         AND e.status = 'active'
         AND q.status = 'published'
         AND (q.due_date IS NULL OR q.due_date > NOW())
         AND (
           att.quiz_attempt_id IS NULL                -- never attempted
           OR att.status IN ('in_progress','submitted') -- still actionable
         )
       ORDER BY (q.due_date IS NULL) ASC, q.due_date ASC
       LIMIT 5`,
      [userId, userId]
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

  // req.file is set by the `handlePhotoUpload` multer middleware in studentRoutes.js.
  // Format (JPG/PNG) and size (<=5MB) are already validated there per SDS 7.2.2.
  const photo_url = req.file ? `/uploads/profile-photos/${req.file.filename}` : null;

  try {
    if (photo_url) {
      await db.execute(
        `UPDATE user SET username=?, phone_number=?, department=?, photo_url=? WHERE user_id=?`,
        [username, phone_number || null, department || null, photo_url, userId]
      );
    } else {
      await db.execute(
        `UPDATE user SET username=?, phone_number=?, department=? WHERE user_id=?`,
        [username, phone_number || null, department || null, userId]
      );
    }
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
    res.json({ message: 'Profile updated successfully', photo_url: photo_url || undefined });
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
              CONCAT('CRS-', LPAD(c.course_id, 3, '0')) AS course_code,
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
      "SELECT enrollment_id FROM enrollment WHERE user_id=? AND course_id=? AND status IN ('active','completed')",
      [userId, course_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    // Reactivate a dropped record instead of creating a new one
    const [dropped] = await db.execute(
      "SELECT enrollment_id FROM enrollment WHERE user_id=? AND course_id=? AND status='dropped'",
      [userId, course_id]
    );
    if (dropped.length > 0) {
      await db.execute(
        "UPDATE enrollment SET status='active' WHERE enrollment_id=?",
        [dropped[0].enrollment_id]
      );
      await db.execute(
        `INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id)
         VALUES (?, 'enroll', 'Student re-enrolled in a dropped course', 'course', ?)`,
        [userId, course_id]
      );
      return res.status(201).json({ message: 'Re-enrolled successfully' });
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
       WHERE m.course_id = ? AND m.status = 'published'
       ORDER BY m.sort_order`,
      [userId, courseId]
    );
    for (const mod of modules) {
      const [lessons] = await db.execute(
        `SELECT lesson_id, title, content_type, content_url, content_text,
                sort_order, duration_minutes, status
         FROM lesson WHERE module_id = ? AND status = 'published' ORDER BY sort_order`,
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
    // SPEC UC2.1.4 — student must be actively enrolled in the module's course.
    const [enrolled] = await db.execute(
      `SELECT e.enrollment_id FROM enrollment e
       JOIN module m ON m.course_id = e.course_id
       WHERE m.module_id = ? AND e.user_id = ? AND e.status = 'active'`,
      [moduleId, userId]
    );
    if (enrolled.length === 0) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

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

    // Recalculate and persist enrollment.completion_percent so dashboard stays in sync
    const [[{ course_id }]] = await db.execute(
      'SELECT course_id FROM module WHERE module_id = ?', [moduleId]
    );
    const [[{ total, done }]] = await db.execute(
      `SELECT
         COUNT(m.module_id) AS total,
         COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) AS done
       FROM module m
       LEFT JOIN module_progress mp ON mp.module_id = m.module_id AND mp.user_id = ?
       WHERE m.course_id = ?`,
      [userId, course_id]
    );
    const newPct = total > 0 ? parseFloat(((done / total) * 100).toFixed(2)) : 0;
    await db.execute(
      'UPDATE enrollment SET completion_percent = ? WHERE user_id = ? AND course_id = ?',
      [newPct, userId, course_id]
    );

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
              COUNT(qa.quiz_attempt_id) AS attempts_taken,
              MAX(CASE WHEN qa.status='graded' THEN 1 ELSE 0 END) AS has_grade,
              (SELECT qa2.status     FROM quiz_attempt qa2
               WHERE qa2.quiz_id = q.quiz_id AND qa2.user_id = ?
               ORDER BY qa2.quiz_attempt_id DESC LIMIT 1) AS latest_status,
              (SELECT qa2.quiz_attempt_id FROM quiz_attempt qa2
               WHERE qa2.quiz_id = q.quiz_id AND qa2.user_id = ?
               ORDER BY qa2.quiz_attempt_id DESC LIMIT 1) AS latest_attempt_id,
              (SELECT qa2.score FROM quiz_attempt qa2
               WHERE qa2.quiz_id = q.quiz_id AND qa2.user_id = ?
               ORDER BY qa2.quiz_attempt_id DESC LIMIT 1) AS latest_score,
              (SELECT qa2.created_at FROM quiz_attempt qa2
               WHERE qa2.quiz_id = q.quiz_id AND qa2.user_id = ?
               ORDER BY qa2.quiz_attempt_id DESC LIMIT 1) AS latest_attempt_at
       FROM quiz q
       LEFT JOIN quiz_attempt qa ON qa.quiz_id = q.quiz_id AND qa.user_id = ?
       WHERE q.course_id = ? AND q.status = 'published'
       GROUP BY q.quiz_id`,
      [userId, userId, userId, userId, userId, courseId]
    );
    const now = new Date();
    const result = quizzes.map(q => {
      const isAssignment = q.submission_type !== 'online_quiz';
      const attemptsTaken = Number(q.attempts_taken) || 0;
      const maxAttempts = Number(q.max_attempts) || 1;
      const attemptsFull = attemptsTaken >= maxAttempts;
      const pastDue = q.due_date && new Date(q.due_date) < now;
      const hasAttempt = attemptsTaken > 0;
      const isGraded = Number(q.has_grade) === 1;

      let status;
      if (!hasAttempt && pastDue) {
        // Past the deadline and the student never opened it — closed permanently
        status = 'closed';
      } else if (isGraded) {
        // Instructor (or auto-grader) has produced a final score for this attempt
        status = 'graded';
      } else if (pastDue && hasAttempt) {
        // Deadline passed but there's a pending review — keep it visible
        status = isAssignment ? 'submitted' : 'completed';
      } else if (attemptsFull) {
        // Used all allowed attempts but not yet graded
        status = isAssignment ? 'submitted' : 'completed';
      } else {
        // Still open: not attempted, or in-progress for an assignment
        status = isAssignment
          ? (hasAttempt ? 'submitted' : 'available')
          : 'available';
      }
      return { ...q, type: isAssignment ? 'assignment' : 'quiz', status };
    });
    res.json(result);
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

    // SPEC UC2.4.5 — "students can attempt it based on configured settings".
    // The configured due_date is one of those settings, so once it has passed
    // the quiz is closed and no new attempts may be started.
    if (quiz[0].due_date && new Date(quiz[0].due_date) < new Date()) {
      return res.status(400).json({ message: 'The deadline for this quiz has passed.' });
    }

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

    // Security: verify the student is enrolled in this quiz's course
    const [enrollRows] = await db.execute(
      `SELECT 1 FROM enrollment e
       JOIN quiz q ON e.course_id = q.course_id
       WHERE e.user_id=? AND q.quiz_id=? AND e.status='active'`,
      [userId, attemptRows[0].quiz_id]
    );
    if (enrollRows.length === 0) return res.status(403).json({ message: 'You are not enrolled in this course' });

    let totalScore = 0;
    let totalPoints = 0;       // points from auto-gradable questions only
    let pendingReview = 0;     // number of short_answer questions awaiting manual grading
    const results = [];

    for (const ans of answers) {
      const [qRows] = await db.execute(
        'SELECT * FROM question WHERE question_id=?', [ans.question_id]
      );
      if (qRows.length === 0) continue;
      const question = qRows[0];

      let isCorrect = null;     // null = pending review (short_answer), true/false = auto-graded
      let scoreAwarded = 0;

      if (question.question_type === 'short_answer') {
        // Short-answer cannot be auto-graded per spec; instructor will grade manually.
        // is_correct stays NULL so the UI can show a "Pending review" badge.
        pendingReview += 1;
        scoreAwarded = 0;
      } else {
        // Exclude short_answer from totalPoints so they're not penalized.
        totalPoints += question.points;
        isCorrect = ans.user_answer?.trim().toLowerCase() ===
                    question.correct_answer?.trim().toLowerCase();
        scoreAwarded = isCorrect ? question.points : 0;
        if (isCorrect) totalScore += question.points;
      }

      const autoFeedback = isCorrect === true
        ? 'Correct!'
        : (isCorrect === false ? (question.improvement_tip || 'Review this topic') : null);

      await db.execute(
        `INSERT INTO answer (quiz_attempt_id, question_id, user_answer, is_correct, score_awarded, feedback)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attemptId, ans.question_id, ans.user_answer || '',
         isCorrect, scoreAwarded,
         isCorrect === null ? 'Awaiting instructor review' : autoFeedback]
      );

      results.push({
        question_text: question.question_text,
        question_type: question.question_type,
        user_answer: ans.user_answer,
        correct_answer: question.question_type !== 'short_answer' ? question.correct_answer : null,
        is_correct: isCorrect,
        score_awarded: scoreAwarded,
        feedback: isCorrect === null ? 'Awaiting instructor review' : autoFeedback
      });
    }

    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;

    await db.execute(
      `UPDATE quiz_attempt SET status='graded', score=?, end_time=NOW()
       WHERE quiz_attempt_id=?`,
      [percentage, attemptId]
    );

    // ── Recalculate GPA from all graded attempts, then notify advisor if below 2.0 ──
    const [[{ avgScore }]] = await db.execute(
      `SELECT AVG(score) AS avgScore FROM quiz_attempt
       WHERE user_id=? AND status='graded' AND score IS NOT NULL`,
      [userId]
    );
    const newGpa = avgScore ? parseFloat(((avgScore / 100) * 4).toFixed(2)) : 0;
    await db.execute(
      `UPDATE student_profile SET gpa=? WHERE user_id=?`,
      [newGpa, userId]
    );
    const [[profile]] = await db.execute(
      `SELECT sp.advisor_id, u.username AS student_name
       FROM student_profile sp JOIN user u ON sp.user_id=u.user_id
       WHERE sp.user_id=?`,
      [userId]
    );
    if (profile && profile.advisor_id) {
      const [[{ wasAtRisk }]] = await db.execute(
        `SELECT is_at_risk AS wasAtRisk FROM student_profile WHERE user_id=?`,
        [userId]
      );
      const nowAtRisk = newGpa < 2.0 ? 1 : 0;
        if (nowAtRisk === 1 && wasAtRisk !== 1) {
        await db.execute(
          `INSERT INTO notification (user_id, title, message, type, related_item_type, related_item_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [profile.advisor_id,
           `Low GPA Alert: ${profile.student_name}`,
           `Your student ${profile.student_name}'s GPA has dropped to ${newGpa.toFixed(2)} (below 2.0). Please review their academic progress.`,
           'alert', 'student', userId]
        );
      }
      await db.execute(
        `UPDATE student_profile SET is_at_risk=? WHERE user_id=?`,
        [nowAtRisk, userId]
      );
    }

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
      [userId, `Student submitted quiz. Score: ${percentage.toFixed(1)}%${pendingReview > 0 ? ` (${pendingReview} pending review)` : ''}`, attemptId]
    );

    res.json({
      score: percentage.toFixed(1),
      totalScore,
      totalPoints,
      pendingReview,
      overallFeedback,
      results
    });
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
      `SELECT q.quiz_id, q.title, q.description, q.due_date, q.submission_type, q.status, q.accepted_file_types
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
      // Only return the question for non-file_upload types
      question: quiz.submission_type !== 'file_upload' ? (questions[0] || null) : null,
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

    // Enforce max_attempts on first submission
    const [attemptCountRows] = await db.execute(
      `SELECT COUNT(*) AS cnt FROM quiz_attempt WHERE quiz_id=? AND user_id=?`,
      [quizId, userId]
    );
    const attemptCount = attemptCountRows[0].cnt;
    const [maxRows] = await db.execute(
      `SELECT max_attempts FROM quiz WHERE quiz_id=?`, [quizId]
    );
    const maxAttempts = maxRows[0].max_attempts || 1;
    if (attemptCount >= maxAttempts) {
      cleanupUpload();
      return res.status(400).json({ message: `Maximum of ${maxAttempts} attempt(s) reached for this assignment.` });
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

    // For file_upload quizzes: auto-create a placeholder question if needed so
    // the answer record has a valid FK. The question text doubles as the assignment
    // instructions shown to the student.
    let questionId = null;
    if (quiz.submission_type === 'file_upload') {
      const [existingQ] = await db.execute(
        `SELECT question_id FROM question WHERE quiz_id=? ORDER BY sort_order LIMIT 1`, [quizId]
      );
      if (existingQ.length > 0) {
        questionId = existingQ[0].question_id;
      } else {
        // Create a placeholder question so the answer record has a valid FK.
        // Its text doubles as the instructions shown to the student; it carries
        // no points so it does not affect grading.
        const [insResult] = await db.execute(
          `INSERT INTO question (quiz_id, question_type, question_text, correct_answer, points, sort_order)
           VALUES (?, 'short_answer', '[File submission — see assignment instructions]', 'N/A', 0, 1)`,
          [quizId]
        );
        questionId = insResult.insertId;
      }
    } else {
      const [questions] = await db.execute(
        `SELECT question_id FROM question WHERE quiz_id=? ORDER BY sort_order LIMIT 1`, [quizId]
      );
      if (questions.length === 0) {
        cleanupUpload();
        return res.status(400).json({ message: 'This assignment has no submission prompt configured' });
      }
      questionId = questions[0].question_id;
    }

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
      // Reject resubmit if deadline has passed
      if (quiz.due_date && new Date(quiz.due_date) < new Date()) {
        cleanupUpload();
        return res.status(400).json({ message: 'The deadline has passed. Resubmission is not allowed.' });
      }
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
  const userId = req.user.user_id;
  try {
    // Guard: only allow marking as read if the notification belongs to this user
    // or is a role-broadcast for 'student'. This prevents cross-user marking.
    const [result] = await db.execute(
      `UPDATE notification SET is_read=1
       WHERE notification_id=? AND (user_id=? OR target_role='student')`,
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
              CONCAT('CRS-', LPAD(c.course_id, 3, '0')) AS course_code,
              u.username AS instructor_name
       FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       JOIN user u ON c.instructor_id = u.user_id
       WHERE e.user_id = ? AND e.status IN ('active','completed')
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    // ── 3. Module progress per course (batch fetch — no N+1) ───
    if (courses.length > 0) {
      const courseIds = courses.map(c => c.course_id);
      const [allModules] = await db.execute(
        `SELECT m.module_id, m.course_id, m.title,
                COALESCE(mp.status, 'not_started') AS status,
                COALESCE(mp.completion_percentage, 0) AS completion_percentage,
                mp.completed_at
         FROM module m
         LEFT JOIN module_progress mp ON mp.module_id = m.module_id AND mp.user_id = ?
         WHERE m.course_id IN (${inPlaceholders(courseIds)}) AND m.status = 'published'
         ORDER BY m.sort_order`,
        [userId, ...courseIds]
      );
      const modulesByCourse = {};
      for (const m of allModules) {
        if (!modulesByCourse[m.course_id]) modulesByCourse[m.course_id] = [];
        modulesByCourse[m.course_id].push(m);
      }
      for (const course of courses) {
        const modules = modulesByCourse[course.course_id] || [];
        course.modules = modules;
        const total = modules.length;
        const done  = modules.filter(m => m.status === 'completed').length;
        course.module_completion_percent = total > 0
          ? parseFloat(((done / total) * 100).toFixed(2))
          : 0;
      }
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

    // ── 5. Recommended next steps (batch — no N+1) ───────────
    const activeCourses = courses.filter(c => c.enrollment_status === 'active');
    const recommendations = [];
    if (activeCourses.length > 0) {
      const activeCourseIds = activeCourses.map(c => c.course_id);

      // Batch-fetch all upcoming unattempted quizzes across active courses
      const [allUpcoming] = await db.execute(
        `SELECT q.quiz_id, q.course_id, q.title, q.due_date
         FROM quiz q
         WHERE q.course_id IN (${inPlaceholders(activeCourseIds)})
           AND q.status = 'published'
           AND (q.due_date IS NULL OR q.due_date > NOW())
           AND q.quiz_id NOT IN (
               SELECT qa.quiz_id FROM quiz_attempt qa
               WHERE qa.user_id = ? AND qa.status IN ('graded','submitted')
           )
         ORDER BY q.course_id, q.due_date ASC`,
        [...activeCourseIds, userId]
      );
      const upcomingByCourse = {};
      for (const q of allUpcoming) {
        if (!upcomingByCourse[q.course_id]) upcomingByCourse[q.course_id] = [];
        if (upcomingByCourse[q.course_id].length < 3) {
          upcomingByCourse[q.course_id].push(q);
        }
      }

      for (const course of activeCourses) {
        const nextModule = course.modules.find(m => m.status !== 'completed');
        if (nextModule) {
          recommendations.push({
            type: 'module',
            course_id: course.course_id,
            course_title: course.course_title,
            next_module_id: nextModule.module_id,
            next_module_title: nextModule.title,
            message: `Continue "${nextModule.title}" in ${course.course_title}`
          });
        }
        for (const q of (upcomingByCourse[course.course_id] || [])) {
          recommendations.push({
            type: 'quiz',
            course_id: course.course_id,
            course_title: course.course_title,
            quiz_id: q.quiz_id,
            quiz_title: q.title,
            due_date: q.due_date,
            message: `Attempt quiz "${q.title}" in ${course.course_title}`
          });
        }
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
    // Verify this attempt belongs to the requesting student AND student is enrolled
    const [attemptRows] = await db.execute(
      `SELECT qa.quiz_attempt_id, qa.quiz_id, qa.score, qa.status,
              qa.start_time, qa.end_time,
              q.title AS quiz_title, q.submission_type,
              c.title AS course_title
       FROM quiz_attempt qa
       JOIN quiz q ON qa.quiz_id = q.quiz_id
       JOIN course c ON q.course_id = c.course_id
       JOIN enrollment e ON e.course_id = c.course_id AND e.user_id = ?
       WHERE qa.quiz_attempt_id = ? AND qa.user_id = ? AND e.status = 'active'`,
      [userId, attemptId, userId]
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